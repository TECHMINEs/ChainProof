import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from './src/lib/auth/middleware';

export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-|logo-|apple-touch-icon|techmines-|manifest.json|sw.js|workbox-).*)',
  ],
};
