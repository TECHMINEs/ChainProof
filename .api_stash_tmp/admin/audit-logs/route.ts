import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { ALERT_SEVERITIES } from '@chainproof/types';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { serverError } from '@/lib/http/errors';
import { publicUserSelect } from '@/lib/selects';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  severity: z.nativeEnum(ALERT_SEVERITIES).optional(),
  flagged: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'AUDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    const { page, pageSize, severity, flagged } = parsed.data;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AuditLogWhereInput = {};
    if (severity) where.severity = severity;
    if (flagged) where.flagged = true;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: publicUserSelect } }
      }),
      prisma.auditLog.count({ where })
    ]);

    return NextResponse.json({ logs, total, page, pageSize });
  } catch (error) {
    return serverError('/api/admin/audit-logs', error, 'Internal Server Error');
  }
}
