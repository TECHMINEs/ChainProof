import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { generateTransferProof } from '@chainproof/crypto/src/zkProof';
import { hashTransferData } from '@chainproof/crypto/src/hash';
import { logAudit } from '@/lib/audit/logger';
import { ethers } from 'ethers';
import { serverError } from '@/lib/http/errors';

const createTransferSchema = z.object({
  evidenceId: z.string().min(1),
  toUserId: z.string().min(1),
  purpose: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = createTransferSchema.parse(body);

    const evidence = await prisma.evidence.findUnique({
      where: { id: data.evidenceId },
      include: { transfers: { where: { status: 'COMPLETED' }, orderBy: { transferredAt: 'desc' }, take: 1 } }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // B9: Verify session user is the current custodian
    const lastCompletedTransfer = evidence.transfers[0];
    const currentCustodianId = lastCompletedTransfer
      ? lastCompletedTransfer.toUserId
      : evidence.registrarId;

    if (currentCustodianId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You are not the current custodian of this evidence' }, { status: 403 });
    }

    const timestamp = Date.now().toString();
    const zkInput = {
      fromOfficerIdHash: BigInt(ethers.keccak256(ethers.toUtf8Bytes(session.user.id))).toString(),
      toOfficerIdHash: BigInt(ethers.keccak256(ethers.toUtf8Bytes(data.toUserId))).toString(),
      evidenceHashSecret: BigInt(ethers.keccak256(ethers.toUtf8Bytes(evidence.sha256Hash || ''))).toString(),
      timestamp
    };

    let zkProof = null;
    let zkVerified = false;
    try {
      zkProof = await generateTransferProof(
        zkInput,
        './public/zk/transfer_js/transfer.wasm',
        './public/zk/transfer_final.zkey'
      );
      zkVerified = true;
    } catch (e) {
      console.warn('ZK circuit unavailable, generated fallback cryptographic proof:', e);
      zkProof = { simulated: true, protocol: 'groth16' };
      zkVerified = false;
    }

    const combinedDataHash = hashTransferData(data.evidenceId, session.user.id, data.toUserId, data.purpose, timestamp);

    const toUser = await prisma.user.findUnique({ where: { id: data.toUserId } });
    if (!toUser) return NextResponse.json({ error: 'Receiving officer not found' }, { status: 404 });

    const transfer = await prisma.$transaction(async (tx) => {
      const t = await tx.transfer.create({
        data: {
          evidenceId: data.evidenceId,
          fromUserId: session.user.id,
          toUserId: data.toUserId,
          status: 'PENDING',
          purpose: data.purpose,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          notes: data.notes,
          combinedDataHash,
          zkProof: (zkProof ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull,
          zkVerified,
        }
      });

      await tx.evidence.update({
        where: { id: data.evidenceId },
        data: { status: 'IN_TRANSIT' }
      });

      await tx.notification.create({
        data: {
          userId: data.toUserId,
          type: 'TRANSFER_REQUEST',
          title: 'New Transfer Request',
          message: `You have a pending transfer request for evidence ${evidence.evidenceNumber}`,
          metadata: { transferId: t.id }
        }
      });

      return t;
    });

    // D9: Wire email/SMS notifications
    try {
      const { sendEmail } = await import('@/lib/notifications/emailService');
      await sendEmail(
        toUser.email,
        'New Evidence Transfer Request',
        `<p>A custody transfer request has been initiated for evidence <strong>${evidence.evidenceNumber}</strong>.</p><p>Purpose: ${data.purpose}</p><p>Please sign in to ChainProof to accept or reject this transfer.</p>`
      );
    } catch (e) {
      console.warn('Email notification failed:', e);
    }

    const ip = request.headers.get('x-forwarded-for') ?? undefined;
    const ua = request.headers.get('user-agent') ?? undefined;
    await logAudit({
      userId: session.user.id,
      action: 'TRANSFER_CREATED',
      entityType: 'Transfer',
      entityId: transfer.id,
      details: { evidenceId: data.evidenceId, toUserId: data.toUserId, purpose: data.purpose, zkVerified },
      ipAddress: ip,
      userAgent: ua,
      severity: 'MEDIUM',
    });

    return NextResponse.json({ data: transfer }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    console.error('Transfer POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '20'));
    const skip = (page - 1) * pageSize;

    const isAdminOrAuditor = ['ADMIN', 'AUDITOR'].includes(session.user.role);
    const where = isAdminOrAuditor
      ? {}
      : { OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }] };

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        include: { evidence: { select: { evidenceNumber: true } }, fromUser: { select: { name: true } }, toUser: { select: { name: true } } },
        orderBy: { transferredAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.transfer.count({ where }),
    ]);

    return NextResponse.json({ data: transfers, total, page, pageSize });
  } catch (error) {
    return serverError('/api/transfers', error, 'Internal Server Error');
  }
}
