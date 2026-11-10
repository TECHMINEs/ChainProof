import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { USER_ROLES } from '@chainproof/types';
import bcrypt from 'bcryptjs';

const registerSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.OFFICER, USER_ROLES.REGISTRAR, USER_ROLES.AUDITOR]),
  department: z.string().min(1),
  badgeNumber: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { employeeId: data.employeeId }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        password: await bcrypt.hash(data.password, 12),
        role: data.role,
        department: data.department,
        badgeNumber: data.badgeNumber,
      },
    });

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

    return NextResponse.json({ user: userPayload }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
