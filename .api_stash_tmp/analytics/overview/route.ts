import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { serverError } from '@/lib/http/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'AUDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalCases, totalEvidence, totalTransfers, tamperAlerts, evidenceList, activeOfficers] = await Promise.all([
      prisma.case.count(),
      prisma.evidence.count(),
      prisma.transfer.count(),
      prisma.auditLog.count({ where: { severity: { in: ['HIGH', 'CRITICAL'] } } }),
      prisma.evidence.findMany({ select: { integrityScore: true } }),
      prisma.user.count({ where: { role: 'OFFICER', isActive: true } })
    ]);

    const avgIntegrityScore = evidenceList.length > 0 
      ? evidenceList.reduce((acc, ev) => acc + ev.integrityScore, 0) / evidenceList.length 
      : 100;

    return NextResponse.json({
      data: {
        totalCases,
        totalEvidence,
        totalTransfers,
        tamperAlerts,
        avgIntegrityScore: Math.round(avgIntegrityScore),
        activeOfficers
      }
    });
  } catch (error) {
    return serverError('/api/analytics/overview', error, 'Internal Server Error');
  }
}
