import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import redis from '@/lib/redis/client';
import crypto from 'crypto';
import { serverError } from '@/lib/http/errors';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const challenge = crypto.randomBytes(32).toString('base64url');
    const challengeKey = `transfer_challenge:${params.id}`;

    await redis.setex(challengeKey, 300, challenge);

    return NextResponse.json({ challenge });
  } catch (error) {
    return serverError('/api/transfers/[id]/sign-challenge', error, 'Internal Server Error');
  }
}
