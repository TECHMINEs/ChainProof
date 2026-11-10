import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import redis from '@/lib/redis/client';
import { verifyRegistrationResponse } from '@simplewebauthn/server';

const RP_ID = process.env.RP_ID || 'localhost';
const EXPECTED_ORIGIN = process.env.EXPECTED_ORIGIN || 'http://localhost:3000';

// A5: Store challenge in Redis, never trust from client
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    // A5: Retrieve challenge from Redis
    const challengeKey = `webauthn_challenge:${session.user.id}`;
    const storedChallenge = await redis.get(challengeKey);
    if (!storedChallenge) {
      return NextResponse.json({ error: 'Registration challenge expired. Please restart passkey setup.' }, { status: 400 });
    }

    const existingCredentials = await prisma.passkeyCredential.findMany({
      where: { userId: session.user.id }
    });

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: storedChallenge,
      expectedOrigin: EXPECTED_ORIGIN,
      expectedRPID: RP_ID,
    });

    // Delete challenge after use
    await redis.del(challengeKey);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
    const encodedCredentialId = Buffer.from(credentialID).toString('base64url');

    // Reject re-registering an authenticator that is already bound to this account
    if (existingCredentials.some(c => c.credentialId === encodedCredentialId)) {
      return NextResponse.json({ error: 'This passkey is already registered.' }, { status: 409 });
    }
 
     // A6: Save the new credential to the database
     await prisma.passkeyCredential.create({
       data: {
         userId: session.user.id,
         credentialId: encodedCredentialId,
         publicKey: Buffer.from(credentialPublicKey),
         counter: BigInt(counter),
        transports: (body.response?.transports as string[]) ?? [],
        deviceType: verification.registrationInfo.credentialDeviceType,
        backedUp: verification.registrationInfo.credentialBackedUp,
      }
    });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Passkey register-verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
