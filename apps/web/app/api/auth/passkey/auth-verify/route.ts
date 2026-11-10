import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setSession } from '@/lib/auth/session';
import redis from '@/lib/redis/client';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { UserRole } from '@chainproof/types';
import { z } from 'zod';
import { toAuthenticatorDevice } from '@/lib/auth/webauthn';

const RP_ID = process.env.RP_ID || 'localhost';
const EXPECTED_ORIGIN = process.env.EXPECTED_ORIGIN || 'http://localhost:3000';

const schema = z.object({
  employeeId: z.string().min(1),
  authResponse: z.any(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    // Retrieve user ID from Redis
    const userId = await redis.get(`webauthn_auth_user:${data.employeeId}`);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication session expired. Please try again.' }, { status: 400 });
    }

    const storedChallenge = await redis.get(`webauthn_auth_challenge:${userId}`);
    if (!storedChallenge) {
      return NextResponse.json({ error: 'Challenge expired. Please try again.' }, { status: 400 });
    }

    // Find credential
    const credential = await prisma.passkeyCredential.findUnique({
      where: { credentialId: data.authResponse.id },
      include: { user: true }
    });

    if (!credential || credential.userId !== userId) {
      return NextResponse.json({ error: 'Unknown credential' }, { status: 401 });
    }

    const verification = await verifyAuthenticationResponse({
      response: data.authResponse,
      expectedChallenge: storedChallenge,
      expectedOrigin: EXPECTED_ORIGIN,
      expectedRPID: RP_ID,
      authenticator: toAuthenticatorDevice(credential),
    });

    // Delete challenges after use
    await redis.del(`webauthn_auth_challenge:${userId}`);
    await redis.del(`webauthn_auth_user:${data.employeeId}`);

    if (!verification.verified) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Update counter
    await prisma.passkeyCredential.update({
      where: { id: credential.id },
      data: { counter: BigInt(verification.authenticationInfo.newCounter), lastUsedAt: new Date() }
    });

    const user = credential.user;
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    const userPayload = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      department: user.department,
      badgeNumber: user.badgeNumber ?? undefined,
      walletAddress: user.walletAddress ?? undefined,
      isActive: user.isActive,
    };

    await setSession(userPayload);

    return NextResponse.json({ user: userPayload });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error' }, { status: 400 });
    }
    console.error('Passkey auth-verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
