import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serverError } from '@/lib/http/errors';

export async function GET(request: Request, { params }: { params: { evidenceNumber: string } }) {
  try {
    const evidence = await prisma.evidence.findUnique({
      where: { evidenceNumber: params.evidenceNumber },
      include: {
        case: true,
      }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    const result = {
      evidenceNumber: evidence.evidenceNumber,
      caseNumber: evidence.case?.caseNumber || 'N/A',
      currentStatus: evidence.status,
      integrityScore: evidence.integrityScore,
      lastVerifiedAt: evidence.lastVerifiedAt,
      isVerified: evidence.integrityScore === 100,
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    return serverError('/api/qr/[evidenceNumber]', error, 'Internal Server Error');
  }
}
