import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/audit/logger';
import { evidenceAccessFilter } from '@/lib/evidence/access';
import { publicUserSelect } from '@/lib/selects';
import { serverError } from '@/lib/http/errors';
import { validateStatusTransition } from '@/lib/evidence/statusMachine';
import { z } from 'zod';

const patchSchema = z.object({
  storageLocation: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['REGISTERED', 'IN_TRANSIT', 'STORED', 'VERIFIED', 'FLAGGED', 'ARCHIVED']).optional(),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const evidence = await prisma.evidence.findFirst({
      where: { AND: [{ id: params.id }, await evidenceAccessFilter(session)] },
      include: {
        case: { select: { id: true, caseNumber: true, title: true, status: true } },
        registrar: { select: publicUserSelect },
      },
    });

    // 404 (not 403) so the endpoint does not reveal which exhibit IDs exist
    if (!evidence) return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });

    return NextResponse.json({ data: evidence });
  } catch (error) {
    return serverError('/api/evidence/[id]', error);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = patchSchema.parse(body);

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: {
        transfers: { where: { status: 'COMPLETED' }, orderBy: { transferredAt: 'desc' }, take: 1 }
      }
    });
    if (!evidence) return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });

    // Only ADMIN or current custodian can edit
    const lastTransfer = evidence.transfers[0];
    const currentCustodianId = lastTransfer ? lastTransfer.toUserId : evidence.registrarId;
    if (currentCustodianId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Not the current custodian' }, { status: 403 });
    }

    // Validate status transition if status is being changed
    if (data.status && data.status !== evidence.status) {
      if (!validateStatusTransition(evidence.status, data.status)) {
        return NextResponse.json({
          error: `Invalid status transition: ${evidence.status} → ${data.status}`
        }, { status: 400 });
      }
    }

    const updated = await prisma.evidence.update({
      where: { id: params.id },
      data: {
        ...(data.storageLocation !== undefined && { storageLocation: data.storageLocation }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.status !== undefined && { status: data.status }),
      }
    });

    const ip = request.headers.get('x-forwarded-for') ?? undefined;
    const ua = request.headers.get('user-agent') ?? undefined;
    await logAudit({
      userId: session.user.id,
      action: 'EVIDENCE_UPDATED',
      entityType: 'Evidence',
      entityId: params.id,
      details: { changes: data },
      ipAddress: ip,
      userAgent: ua,
      severity: data.status ? 'HIGH' : 'LOW',
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
