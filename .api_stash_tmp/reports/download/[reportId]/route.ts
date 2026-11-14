import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { serverError } from '@/lib/http/errors';

export async function GET(request: Request, { params }: { params: { reportId: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const report = await prisma.report.findUnique({
      where: { id: params.reportId }
    });

    if (!report || !report.pdfUrl) {
      return NextResponse.json({ error: 'Report not available' }, { status: 404 });
    }

    return NextResponse.redirect(report.pdfUrl);
  } catch (error) {
    return serverError('/api/reports/download/[reportId]', error, 'Internal Server Error');
  }
}
