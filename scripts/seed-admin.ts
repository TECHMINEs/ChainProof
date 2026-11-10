import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const employeeId = 'ADMIN-001';
  const password = 'admin-password-2026';
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { employeeId },
    update: {
        password: hashedPassword,
    },
    create: {
      employeeId,
      name: 'System Administrator',
      email: 'admin@chainproof.io',
      password: hashedPassword,
      role: UserRole.ADMIN,
      department: 'Digital Forensics Unit',
      badgeNumber: 'DFU-001',
      isActive: true,
    },
  });

  // Initialize evidence counter if it doesn't exist
  await prisma.evidenceCounter.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, sequence: 1 }
  });

  console.log('✅ Admin account seeded successfully!');
  console.log('-----------------------------------');
  console.log(`Employee ID: ${employeeId}`);
  console.log(`Password:    ${password}`);
  console.log('-----------------------------------');
  console.log('Use these credentials to log in at http://localhost:3000/login');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
