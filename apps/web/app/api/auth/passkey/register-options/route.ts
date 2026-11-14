import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import redis from '@/lib/redis/client';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { serverError } from '@/lib/http/errors';
import { toCredentialDescriptor } from '@/lib/auth/webauthn';

const RP_NAME = 'ChainProof';
const RP_ID = process.env.RP_ID || 'localhost';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existingCredentials = await prisma.passkeyCredential.findMany({
      where: { userId: session.user.id },
      select: { credentialId: true, transports: true }
    });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: session.user.id,
      userName: session.user.employeeId,
      userDisplayName: session.user.name,
      excludeCredentials: existingCredentials.map(toCredentialDescriptor),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // A5: Store challenge in Redis with 5-minute TTL
    await redis.setex(`webauthn_challenge:${session.user.id}`, 300, options.challenge);

    // Do NOT return the challenge in the response — it's server-managed
    return NextResponse.json(options);
  } catch (error) {
    return serverError('/api/auth/passkey/register-options', error, 'Internal Server Error');
  }
}