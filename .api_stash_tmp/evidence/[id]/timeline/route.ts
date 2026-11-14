import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { serverError } from '@/lib/http/errors';
import { publicUserSelect } from '@/lib/selects';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transfers = await prisma.transfer.findMany({
      where: { evidenceId: params.id },
      orderBy: { transferredAt: 'asc' },
      include: {
        fromUser: { select: publicUserSelect },
        toUser: { select: publicUserSelect },
      },
    });

    return NextResponse.json({ data: transfers });
  } catch (error) {
    return serverError('/api/evidence/[id]/timeline', error, 'Internal Server Error');
  }
}
