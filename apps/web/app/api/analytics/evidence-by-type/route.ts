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

    const evidence = await prisma.evidence.findMany({
      select: { type: true }
    });

    const total = evidence.length;
    const counts: Record<string, number> = {};
    evidence.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });

    const data = Object.keys(counts).map(type => ({
      type,
      count: counts[type],
      percentage: total > 0 ? (counts[type] / total) * 100 : 0
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return serverError('/api/analytics/evidence-by-type', error, 'Internal Server Error');
  }
}
