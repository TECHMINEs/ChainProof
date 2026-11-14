import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { reportQueue } from '@/lib/queue/reportQueue';
import { serverError } from '@/lib/http/errors';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    type ServiceHealth = { status: 'UNKNOWN' | 'OK' | 'ERROR' | 'NOT_CONFIGURED'; latency: number };
    const health: { status: 'OK' | 'ERROR'; services: Record<'database' | 'redis' | 'pinata' | 'polygonRpc', ServiceHealth> } = {
      status: 'OK',
      services: {
        database: { status: 'UNKNOWN', latency: 0 },
        redis: { status: 'UNKNOWN', latency: 0 },
        pinata: { status: 'UNKNOWN', latency: 0 },
        polygonRpc: { status: 'UNKNOWN', latency: 0 }
      }
    };

    // DB Check
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      health.services.database = { status: 'OK', latency: Date.now() - start };
    } catch {
      health.services.database.status = 'ERROR';
      health.status = 'ERROR';
    }

    // Redis Check
    try {
      const start = Date.now();
      await reportQueue.client.ping();
      health.services.redis = { status: 'OK', latency: Date.now() - start };
    } catch {
      health.services.redis.status = 'ERROR';
      health.status = 'ERROR';
    }

    // Pinata check
    try {
      const start = Date.now();
      const res = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` }
      });
      if (res.ok) {
        health.services.pinata = { status: 'OK', latency: Date.now() - start };
      } else {
        health.services.pinata.status = 'ERROR';
        health.status = 'ERROR';
      }
    } catch {
      health.services.pinata.status = 'ERROR';
      health.status = 'ERROR';
    }

    // Polygon Check
    try {
      const start = Date.now();
      const res = await fetch(process.env.POLYGON_RPC_URL || 'http://127.0.0.1:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
      });
      if (res.ok) {
        health.services.polygonRpc = { status: 'OK', latency: Date.now() - start };
      } else {
        health.services.polygonRpc.status = 'ERROR';
        health.status = 'ERROR';
      }
    } catch {
      health.services.polygonRpc.status = 'ERROR';
      health.status = 'ERROR';
    }

    return NextResponse.json({ data: health }, { status: health.status === 'OK' ? 200 : 503 });
  } catch (error) {
    return serverError('/api/admin/system-health', error, 'Internal Server Error');
  }
}
