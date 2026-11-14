import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import redis from '@/lib/redis/client';
import { ethers } from 'ethers';
import { z } from 'zod';

const verifySchema = z.object({
  address: z.string().min(1),
  signature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = verifySchema.parse(body);

    // A8: Retrieve the server-generated nonce from Redis
    const nonceKey = `wallet_nonce:${session.user.id}`;
    const storedNonce = await redis.get(nonceKey);
    if (!storedNonce) {
      return NextResponse.json({ error: 'Challenge expired. Please request a new wallet link challenge.' }, { status: 400 });
    }

    const expectedMessage = `Link wallet to ChainProof: ${storedNonce}`;
    const recoveredAddress = ethers.verifyMessage(expectedMessage, data.signature);

    if (recoveredAddress.toLowerCase() !== data.address.toLowerCase()) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    // Delete nonce after use (one-time)
    await redis.del(nonceKey);

    // B12: Check the wallet isn't already linked to a different account
    const existingUser = await prisma.user.findFirst({
      where: {
        walletAddress: { equals: data.address, mode: 'insensitive' },
        NOT: { id: session.user.id }
      }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'This wallet address is already linked to another account' }, { status: 409 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress: data.address }
    });

    return NextResponse.json({ success: true, address: data.address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
