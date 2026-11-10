import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { serverError } from '@/lib/http/errors';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notification = await prisma.notification.findUnique({
      where: { id: params.id }
    });

    if (!notification) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    if (notification.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return serverError('/api/notifications/[id]/read', error, 'Internal Server Error');
  }
}
