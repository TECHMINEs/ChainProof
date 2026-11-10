import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { SessionPayload } from '@/lib/auth/session';

/**
 * Role-based visibility for evidence, shared by list and detail endpoints.
 * - ADMIN / AUDITOR: everything
 * - REGISTRAR: exhibits they registered
 * - OFFICER: exhibits they registered, on cases they lead, or received via a completed transfer
 */
export async function evidenceAccessFilter(session: SessionPayload): Promise<Prisma.EvidenceWhereInput> {
  const { id: userId, role } = session.user;

  if (role === 'REGISTRAR') return { registrarId: userId };

  if (role === 'OFFICER') {
    const received = await prisma.transfer.findMany({
      where: { toUserId: userId, status: 'COMPLETED' },
      select: { evidenceId: true },
    });
    return {
      OR: [
        { registrarId: userId },
        { case: { officerId: userId } },
        { id: { in: received.map(t => t.evidenceId) } },
      ],
    };
  }

  return {};
}
