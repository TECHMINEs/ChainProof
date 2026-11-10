import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import crypto from 'crypto';
import { serverError } from '@/lib/http/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    const message = `Sign this message to link your wallet to ChainProof.\nNonce: ${nonce}`;

    // Store nonce in session or redis mapped to user (skipping for demo)
    return NextResponse.json({ message, nonce });
  } catch (error) {
    return serverError('/api/auth/wallet/link', error, 'Internal Server Error');
  }
}
