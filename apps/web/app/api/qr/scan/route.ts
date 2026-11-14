import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const scanSchema = z.object({
  qrData: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = scanSchema.parse(body);

    // Format: chainproof://evidence/EV-12345
    const prefix = 'chainproof://evidence/';
    if (!data.qrData.startsWith(prefix)) {
      return NextResponse.json({ error: 'Invalid QR code format' }, { status: 400 });
    }

    const evidenceNumber = data.qrData.substring(prefix.length);

    const evidence = await prisma.evidence.findUnique({
      where: { evidenceNumber },
      include: { case: true }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // In a full implementation, we might log this scan action in audit logs
    
    return NextResponse.json({
      data: {
        evidenceId: evidence.id,
        evidenceNumber: evidence.evidenceNumber,
        status: evidence.status,
        type: evidence.type,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
