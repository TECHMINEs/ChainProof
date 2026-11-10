import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

import { UserRole } from '@prisma/client';

const updateUserSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
      }
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
