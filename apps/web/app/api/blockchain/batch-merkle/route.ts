import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { contractClient } from '@/lib/blockchain/contractClient';
import { MerkleTree } from '@chainproof/crypto/src/merkle';
import { serverError } from '@/lib/http/errors';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find unsynced completed transfers
    const unsyncedTransfers = await prisma.transfer.findMany({
      where: {
        status: 'COMPLETED',
        syncedToChainAt: null,
      },
      take: 100, // Process in batches
    });

    if (unsyncedTransfers.length === 0) {
      return NextResponse.json({ message: 'No unsynced transfers found' });
    }

    // Prepare leaves
    // Leaf data: combinedDataHash
    const leaves = unsyncedTransfers.map(t => t.combinedDataHash || 'empty');
    const tree = new MerkleTree(leaves);
    const root = tree.getRoot();
    const batchId = `BATCH-${Date.now()}`;

    // Call contract
    let txHash = '';
    let blockNumber = 0;
    try {
      const tx = await contractClient.recordMerkleCheckpoint(batchId, root);
      const receipt = await tx.wait();
      txHash = receipt.hash;
      blockNumber = receipt.blockNumber;
    } catch (err) {
      console.error('Contract transaction failed', err);
      return NextResponse.json({ error: 'Blockchain transaction failed' }, { status: 500 });
    }

    // Record checkpoint in DB
    await prisma.merkleCheckpoint.create({
      data: {
        batchId,
        merkleRoot: root,
        leafHashes: leaves,
        txHash,
        blockNumber,
      }
    });

    // Mark transfers as synced
    const transferIds = unsyncedTransfers.map(t => t.id);
    await prisma.transfer.updateMany({
      where: { id: { in: transferIds } },
      data: {
        syncedToChainAt: new Date(),
        blockchainTxHash: txHash,
        blockchainBlockNumber: blockNumber,
      }
    });

    return NextResponse.json({ 
      success: true, 
      batchId, 
      root, 
      transfersSynced: transferIds.length 
    });
  } catch (error) {
    return serverError('/api/blockchain/batch-merkle', error, 'Internal Server Error');
  }
}
