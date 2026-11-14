import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/audit/logger';
import { evidenceAccessFilter } from '@/lib/evidence/access';
import { publicUserSelect } from '@/lib/selects';
import { serverError } from '@/lib/http/errors';
import { z } from 'zod';

const patchCaseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'CLOSED', 'ARCHIVED']).optional(),
  courtName: z.string().optional(),
  prosecutorName: z.string().optional(),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const caseRecord = await prisma.case.findUnique({
      where: { id: params.id },
      include: {
        officer: { select: publicUserSelect },
        // Only list exhibits this user is allowed to see
        evidence: {
          where: await evidenceAccessFilter(session),
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!caseRecord) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    return NextResponse.json({ data: caseRecord });
  } catch (error) {
    return serverError('/api/cases/[id]', error);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = patchCaseSchema.parse(body);

    const existingCase = await prisma.case.findUnique({ where: { id: params.id } });
    if (!existingCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    // Only ADMIN or assigned officer can update
    if (existingCase.officerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.case.update({
      where: { id: params.id },
      data
    });

    const ip = request.headers.get('x-forwarded-for') ?? undefined;
    const ua = request.headers.get('user-agent') ?? undefined;
    await logAudit({
      userId: session.user.id,
      action: 'CASE_UPDATED',
      entityType: 'Case',
      entityId: params.id,
      details: { changes: data },
      ipAddress: ip,
      userAgent: ua,
      severity: data.status ? 'MEDIUM' : 'LOW',
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
