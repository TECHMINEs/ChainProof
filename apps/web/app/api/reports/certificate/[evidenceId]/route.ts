import { NextResponse } from 'next/server';
import { addReportJob } from '@/lib/queue/reportQueue';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { serverError } from '@/lib/http/errors';

export async function POST(request: Request, { params }: { params: { evidenceId: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.evidenceId }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    const job = await addReportJob(params.evidenceId, evidence.caseId, 'CERTIFICATE', session.user.id);

    return NextResponse.json({ data: { jobId: job.id, status: 'waiting' } });
  } catch (error) {
    return serverError('/api/reports/certificate/[evidenceId]', error, 'Internal Server Error');
  }
}
