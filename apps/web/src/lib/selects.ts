import type { Prisma } from '@prisma/client';

/**
 * Safe subset of User columns for embedding in API responses.
 * Never use `include: { user: true }` in a response — it would ship the password hash.
 */
export const publicUserSelect = {
  id: true,
  employeeId: true,
  name: true,
  role: true,
  department: true,
  badgeNumber: true,
} satisfies Prisma.UserSelect;
