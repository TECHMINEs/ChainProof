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

    const transfers = await prisma.transfer.findMany({
      where: { status: 'COMPLETED' },
      select: { transferredAt: true, toSignedAt: true }
    });

    let totalHours = 0;
    let count = 0;
    transfers.forEach(t => {
      if (t.toSignedAt) {
        const diff = new Date(t.toSignedAt).getTime() - new Date(t.transferredAt).getTime();
        totalHours += diff / (1000 * 60 * 60);
        count++;
      }
    });

    const averageResponseTimeHours = count > 0 ? totalHours / count : 0;

    return NextResponse.json({ data: { averageResponseTimeHours } });
  } catch (error) {
    return serverError('/api/analytics/response-times', error, 'Internal Server Error');
  }
}
