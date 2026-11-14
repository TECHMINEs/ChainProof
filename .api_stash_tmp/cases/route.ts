import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { serverError } from '@/lib/http/errors';
import { publicUserSelect } from '@/lib/selects';

const createCaseSchema = z.object({
  caseNumber: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  incidentDate: z.string().datetime(),
  incidentLocation: z.string().min(1),
  priority: z.string().optional(),
  courtName: z.string().optional(),
  prosecutorName: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { officer: { select: publicUserSelect } }
      }),
      prisma.case.count(),
    ]);

    return NextResponse.json({ cases, total, page, pageSize });
  } catch (error) {
    return serverError('/api/cases', error, 'Internal Server Error');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = createCaseSchema.parse(body);

    const newCase = await prisma.case.create({
      data: {
        caseNumber: data.caseNumber,
        title: data.title,
        description: data.description,
        incidentDate: new Date(data.incidentDate),
        incidentLocation: data.incidentLocation,
        status: 'OPEN',
        priority: data.priority || 'MEDIUM',
        courtName: data.courtName,
        prosecutorName: data.prosecutorName,
        officer: {
          connect: { id: session.user.id }
        },
      },
    });

    return NextResponse.json({ data: newCase }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
