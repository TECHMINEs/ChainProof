import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { contractClient } from '@/lib/blockchain/contractClient';
import { serverError } from '@/lib/http/errors';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'ADMIN' && session.user.role !== 'REGISTRAR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
    });

    if (!evidence) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    if (evidence.blockchainTxHash) {
      return NextResponse.json({ error: 'Already synced to blockchain' }, { status: 400 });
    }

    // Call smart contract
    // Requires ADMIN or REGISTRAR role on contract which the wallet signing the tx must have.
    // The wallet loaded in contractClient must have REGISTRAR_ROLE or ADMIN_ROLE.
    let txHash = '';
    let blockNumber = 0;

    try {
      const tx = await contractClient.registerEvidence(
        evidence.evidenceNumber,
        evidence.sha256Hash || ''
      );
      const receipt = await tx.wait();
      
      txHash = receipt.hash;
      blockNumber = receipt.blockNumber;
    } catch (err) {
      console.error('Contract transaction failed', err);
      return NextResponse.json({ error: 'Blockchain transaction failed' }, { status: 500 });
    }

    const updated = await prisma.evidence.update({
      where: { id: params.id },
      data: {
        blockchainTxHash: txHash,
        blockchainBlockNumber: blockNumber,
        chainSyncStatus: 'SYNCED',
      }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return serverError('/api/blockchain/sync-evidence/[id]', error, 'Internal Server Error');
  }
}
