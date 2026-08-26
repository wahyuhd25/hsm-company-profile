import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "admin@hartindosuryamedika.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.admin.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword }
    });
    console.log("Updated existing admin password to admin123");
  } else {
    await prisma.admin.create({
      data: {
        email,
        password: hashedPassword
      }
    });
    console.log("Created new admin with password admin123");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
