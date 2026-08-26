const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@hsm.co.id';
  const plainPassword = 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  await prisma.admin.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      password: hashedPassword
    }
  });
  console.log(`Created admin account: ${email} / ${plainPassword}`);
  await prisma.$disconnect();
}
createAdmin();
