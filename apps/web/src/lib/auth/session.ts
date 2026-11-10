import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AuthUser } from '@chainproof/types';

/** Claims stored in the signed session cookie. */
export interface SessionPayload {
  user: AuthUser;
  expires: string;
}

function getKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Add it to apps/web/.env.local');
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ user: { ...payload.user }, expires: payload.expires })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getKey());
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, getKey(), {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const session = cookies().get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
  } catch {
    return null;
  }
}

export async function setSession(user: AuthUser): Promise<void> {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires: expires.toISOString() });
  cookies().set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  cookies().set('session', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
