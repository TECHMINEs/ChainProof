import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { serverError } from '@/lib/http/errors';
import { publicUserSelect } from '@/lib/selects';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transfer = await prisma.transfer.findUnique({
      where: { id: params.id },
      include: {
        evidence: true,
        fromUser: { select: publicUserSelect },
        toUser: { select: publicUserSelect },
      },
    });

    if (!transfer) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    return NextResponse.json({ data: transfer });
  } catch (error) {
    return serverError('/api/transfers/[id]', error, 'Internal Server Error');
  }
}
