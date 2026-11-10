import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import type { SessionPayload } from './session';

const PUBLIC_PATHS = [
  '/login',
  '/verify',
  '/api/verify',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/icon-',
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) return null;

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) return null;

  try {
    const key = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(sessionCookie, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    if (pathname.startsWith('/login')) {
      const session = await getSessionFromRequest(request);
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
