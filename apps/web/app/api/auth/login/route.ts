import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { setSession } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
  employeeId: z.string().min(1),
  password: z.string().min(1),
});

// removed hashPassword

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { employeeId: data.employeeId },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
    }

    const userPayload = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      badgeNumber: user.badgeNumber,
      walletAddress: user.walletAddress,
      isActive: user.isActive,
    };

    await setSession(userPayload);

    return NextResponse.json({
      user: userPayload,
      token: 'session-cookie-set',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
