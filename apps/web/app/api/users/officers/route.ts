import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { serverError } from '@/lib/http/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const officers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ['OFFICER', 'REGISTRAR'] },
      },
      select: {
        id: true,
        name: true,
        badgeNumber: true,
        department: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: officers });
  } catch (error) {
    return serverError('/api/users/officers', error, 'Internal Server Error');
  }
}
