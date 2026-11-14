import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { contractClient, signerAvailable } from '@/lib/blockchain/contractClient';
import { logAudit } from '@/lib/audit/logger';
import { ethers } from 'ethers';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transfer = await prisma.transfer.findUnique({
      where: { id: params.id },
      include: { evidence: true, toUser: true }
    });

    if (!transfer) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });

    if (transfer.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Only completed transfers can be synced to blockchain' }, { status: 400 });
    }

    if (transfer.blockchainTxHash) {
      return NextResponse.json({ error: 'Transfer already synced to blockchain', txHash: transfer.blockchainTxHash }, { status: 400 });
    }

    const contractAddress = process.env.CHAIN_OF_CUSTODY_CONTRACT_ADDRESS;
    if (!signerAvailable || !contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json({ error: 'Blockchain signer or contract address not configured' }, { status: 503 });
    }

    // 1. Ensure evidence is registered on chain
    try {
      const evidenceRecord = await contractClient.evidenceRecords(transfer.evidence.evidenceNumber);
      if (!evidenceRecord.exists) {
        const regTx = await contractClient.registerEvidence(
          transfer.evidence.evidenceNumber,
          transfer.evidence.sha256Hash || ethers.keccak256(ethers.toUtf8Bytes(transfer.evidence.evidenceNumber))
        );
        await regTx.wait();
      }
    } catch (regErr) {
      console.warn('Evidence registration check warning during sync-transfer:', regErr);
    }

    // 2. Prepare transfer parameters
    const toOfficerAddress = (transfer.toUser?.walletAddress && ethers.isAddress(transfer.toUser.walletAddress))
      ? transfer.toUser.walletAddress
      : ethers.ZeroAddress;

    const locationStr = transfer.address || 'Forensic Custody Facility';
    const combinedHash = transfer.combinedDataHash || ethers.keccak256(ethers.toUtf8Bytes(transfer.id));

    // 3. Record transfer on Polygon smart contract
    const tx = await contractClient.recordTransfer(
      transfer.id,
      transfer.evidence.evidenceNumber,
      combinedHash,
      locationStr,
      toOfficerAddress,
      Boolean(transfer.zkVerified)
    );
    const receipt = await tx.wait();

    // 4. Update database record
    const updated = await prisma.transfer.update({
      where: { id: params.id },
      data: {
        blockchainTxHash: receipt.hash,
        blockchainBlockNumber: receipt.blockNumber,
        syncedToChainAt: new Date(),
      }
    });

    const ip = request.headers.get('x-forwarded-for') ?? undefined;
    const ua = request.headers.get('user-agent') ?? undefined;
    await logAudit({
      userId: session.user.id,
      action: 'TRANSFER_SYNCED_CHAIN',
      entityType: 'Transfer',
      entityId: params.id,
      details: { txHash: receipt.hash, blockNumber: receipt.blockNumber },
      ipAddress: ip,
      userAgent: ua,
      severity: 'MEDIUM',
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Sync transfer error:', error);
    return NextResponse.json({ error: 'Failed to sync transfer to blockchain' }, { status: 500 });
  }
}
