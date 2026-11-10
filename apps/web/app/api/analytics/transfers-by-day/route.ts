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

    // Getting the last 7 days of transfers
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const transfers = await prisma.transfer.findMany({
      where: { transferredAt: { gte: sevenDaysAgo } },
      select: { transferredAt: true }
    });

    const counts: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      counts[dateStr] = 0;
    }

    transfers.forEach(t => {
      const dateStr = t.transferredAt.toISOString().split('T')[0];
      if (counts[dateStr] !== undefined) {
        counts[dateStr]++;
      }
    });

    const data = Object.keys(counts).map(date => ({
      date,
      count: counts[date]
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return serverError('/api/analytics/transfers-by-day', error, 'Internal Server Error');
  }
}
