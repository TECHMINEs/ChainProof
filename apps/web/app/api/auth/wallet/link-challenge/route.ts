import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import redis from '@/lib/redis/client';
import crypto from 'crypto';
import { serverError } from '@/lib/http/errors';

// A8: Generate server-side nonce for wallet linking
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const nonce = crypto.randomUUID();
    const key = `wallet_nonce:${session.user.id}`;

    // Store with 10-minute TTL
    await redis.setex(key, 600, nonce);

    return NextResponse.json({ message: `Link wallet to ChainProof: ${nonce}`, nonce });
  } catch (error) {
    return serverError('/api/auth/wallet/link-challenge', error, 'Internal Server Error');
  }
}
