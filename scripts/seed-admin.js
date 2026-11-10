const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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
      role: 'ADMIN',
      department: 'Digital Forensics Unit',
      badgeNumber: 'DFU-001',
      isActive: true,
    },
  });

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
