import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import type { OfficerActivity } from '@chainproof/types';
import { serverError } from '@/lib/http/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'AUDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const officers = await prisma.user.findMany({
      where: { role: 'OFFICER' },
      include: {
        transfersFrom: true,
        transfersTo: true,
        evidenceReg: true,
      }
    });

    const data: OfficerActivity[] = officers.map(o => {
      // Calculate avg response hours (time between transfer creation and toSignedAt)
      let totalHours = 0;
      let count = 0;
      o.transfersTo.forEach(t => {
        if (t.toSignedAt) {
          const diffMs = new Date(t.toSignedAt).getTime() - new Date(t.transferredAt).getTime();
          totalHours += diffMs / (1000 * 60 * 60);
          count++;
        }
      });

      return {
        userId: o.id,
        name: o.name,
        badgeNumber: o.badgeNumber || undefined,
        role: o.role,
        department: o.department,
        transfersInitiated: o.transfersFrom.length,
        transfersReceived: o.transfersTo.length,
        evidenceRegistered: o.evidenceReg.length,
        avgResponseHours: count > 0 ? totalHours / count : 0,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    return serverError('/api/analytics/officer-activity', error, 'Internal Server Error');
  }
}
