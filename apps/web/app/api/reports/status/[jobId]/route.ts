import { NextResponse } from 'next/server';
import { reportQueue } from '@/lib/queue/reportQueue';
import { serverError } from '@/lib/http/errors';

export async function GET(request: Request, { params }: { params: { jobId: string } }) {
  try {
    const job = await reportQueue.getJob(params.jobId);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const state = await job.getState();
    const progress = await job.progress();
    const result = job.returnvalue;

    return NextResponse.json({
      data: {
        jobId: job.id,
        status: state, // waiting, active, completed, failed
        progress,
        result
      }
    });
  } catch (error) {
    return serverError('/api/reports/status/[jobId]', error, 'Internal Server Error');
  }
}
