import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { serverError } from '@/lib/http/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ user: session.user });
  } catch (error) {
    return serverError('/api/auth/me', error, 'Internal Server Error');
  }
}
