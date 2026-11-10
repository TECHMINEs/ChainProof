import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import type { AnomalyEntry } from '@chainproof/types';
import { serverError } from '@/lib/http/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'AUDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const anomalousEvidence = await prisma.evidence.findMany({
      where: {
        OR: [
          { integrityScore: { lt: 100 } },
          { status: 'FLAGGED' },
          { transferCount: { gt: 10 } } // Example anomaly: high transfer count
        ]
      },
      orderBy: { integrityScore: 'asc' },
      take: 20,
    });

    const data: AnomalyEntry[] = anomalousEvidence.map(e => ({
      id: e.id,
      evidenceNumber: e.evidenceNumber,
      integrityScore: e.integrityScore,
      status: e.status,
      transferCount: e.transferCount,
      hasFailedSync: e.chainSyncStatus === 'FAILED',
      lastTransfer: e.lastVerifiedAt?.toISOString()
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return serverError('/api/analytics/anomalies', error, 'Internal Server Error');
  }
}
