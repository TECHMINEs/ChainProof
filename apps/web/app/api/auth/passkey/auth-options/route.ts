import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis/client';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { z } from 'zod';
import { toCredentialDescriptor } from '@/lib/auth/webauthn';

const RP_ID = process.env.RP_ID || 'localhost';

const schema = z.object({ employeeId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { employeeId: data.employeeId },
      include: { passkeyCredentials: { select: { credentialId: true, transports: true } } }
    });

    if (!user || !user.isActive) {
      // Don't reveal if user exists — return same response
      return NextResponse.json({ error: 'No passkey registered for this account' }, { status: 404 });
    }

    if (user.passkeyCredentials.length === 0) {
      return NextResponse.json({ error: 'No passkey registered for this account' }, { status: 404 });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'preferred',
      allowCredentials: user.passkeyCredentials.map(toCredentialDescriptor),
    });

    // A5: Store challenge in Redis keyed to user ID with 5-minute TTL
    await redis.setex(`webauthn_auth_challenge:${user.id}`, 300, options.challenge);
    // Also store user ID keyed to employee ID for verify lookup
    await redis.setex(`webauthn_auth_user:${data.employeeId}`, 300, user.id);

    return NextResponse.json(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
