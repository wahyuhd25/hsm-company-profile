import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "manager@hartindo.local";
  const plainPassword = "testing";

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`⚠️ Admin ${email} already exists in database.`);
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  // Insert admin
  const newAdmin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin ${email} successfully created in database!`);
  console.log(`   ID: ${newAdmin.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
