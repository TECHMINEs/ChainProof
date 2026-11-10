import { NextResponse } from 'next/server';
import { addReportJob } from '@/lib/queue/reportQueue';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { serverError } from '@/lib/http/errors';

export async function POST(request: Request, { params }: { params: { caseId: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const caseRec = await prisma.case.findUnique({
      where: { id: params.caseId }
    });

    if (!caseRec) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const job = await addReportJob(undefined, params.caseId, 'CASE_BUNDLE', session.user.id);

    return NextResponse.json({ data: { jobId: job.id, status: 'waiting' } });
  } catch (error) {
    return serverError('/api/reports/case-bundle/[caseId]', error, 'Internal Server Error');
  }
}
