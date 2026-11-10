import { AlertSeverity } from '@chainproof/types';
import { Prisma } from '@prisma/client';
import prisma from '../prisma';

interface LogOptions {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity?: AlertSeverity;
  flagged?: boolean;
}

export async function logAudit(options: LogOptions) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        details: options.details as Prisma.InputJsonValue | undefined,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        severity: options.severity || 'LOW',
        flagged: options.flagged || false,
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
