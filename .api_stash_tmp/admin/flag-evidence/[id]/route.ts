import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { contractClient } from '@/lib/blockchain/contractClient';
import { serverError } from '@/lib/http/errors';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // Flag in DB
    const updated = await prisma.evidence.update({
      where: { id: params.id },
      data: { status: 'FLAGGED' }
    });

    // Attempt to flag on chain if synced
    if (evidence.blockchainTxHash) {
      try {
        const tx = await contractClient.flagEvidence(evidence.evidenceNumber);
        await tx.wait();
      } catch (err) {
        console.warn('Failed to flag on blockchain', err);
        // Continue anyway since DB was updated
      }
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    return serverError('/api/admin/flag-evidence/[id]', error, 'Internal Server Error');
  }
}
