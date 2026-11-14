import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/logger';
import { serverError } from '@/lib/http/errors';

const scanPayloadSchema = z.object({
  evidenceId: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timestamp: z.string(),
  localHash: z.string().optional(),
});

const syncPayloadSchema = z.object({
  deviceId: z.string().min(1),
  actions: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('SCAN'), payload: scanPayloadSchema }),
    z.object({ type: z.literal('SIGN'), payload: z.object({ transferId: z.string().min(1) }).passthrough() }),
  ])).max(500),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = syncPayloadSchema.parse(body);

    const results = [];

    for (const action of data.actions) {
      if (action.type === 'SCAN') {
        const payload = action.payload;
        // Verify evidence exists
        const evidence = await prisma.evidence.findUnique({ where: { id: payload.evidenceId } });
        if (evidence) {
          await logAudit({
            userId: session.user.id,
            action: 'OFFLINE_SCAN_SYNC',
            entityType: 'EVIDENCE',
            entityId: evidence.id,
            details: { ...payload, deviceId: data.deviceId }
          });
          results.push({ type: 'SCAN', status: 'SUCCESS', id: payload.evidenceId });
        } else {
          results.push({ type: 'SCAN', status: 'FAILED', reason: 'Not found' });
        }
      } else if (action.type === 'SIGN') {
        // Custody signatures need a fresh server-issued WebAuthn challenge, so they can
        // never be completed offline. Tell the client to re-sign once it is back online.
        results.push({
          type: 'SIGN',
          status: 'REQUIRES_ONLINE',
          id: action.payload.transferId,
          reason: 'Transfer signatures require a live passkey challenge. Please re-sign while online.',
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return serverError('/api/offline/sync', error);
  }
}
