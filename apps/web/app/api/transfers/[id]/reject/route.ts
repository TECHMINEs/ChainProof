import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(1),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transfer = await prisma.transfer.findUnique({
      where: { id: params.id },
      include: { toUser: true }
    });

    if (!transfer) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    if (transfer.toUserId !== session.user.id) {
      return NextResponse.json({ error: 'Only receiving officer can reject' }, { status: 403 });
    }
    if (transfer.status !== 'PENDING') {
      return NextResponse.json({ error: 'Transfer is not pending' }, { status: 400 });
    }

    const body = await request.json();
    const data = rejectSchema.parse(body);

    const updatedTransfer = await prisma.transfer.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: data.reason,
      }
    });

    // Revert evidence status
    await prisma.evidence.update({
      where: { id: transfer.evidenceId },
      data: { status: 'STORED' }
    });

    // Notify sender
    await prisma.notification.create({
      data: {
        userId: transfer.fromUserId,
        type: 'TRANSFER_REJECTED',
        title: 'Transfer Rejected',
        message: `Your transfer request was rejected by ${transfer.toUser?.name}. Reason: ${data.reason}`,
        metadata: { transferId: transfer.id }
      }
    });

    return NextResponse.json({ data: updatedTransfer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
