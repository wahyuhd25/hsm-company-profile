const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAdmins() {
  const admins = await prisma.admin.findMany();
  console.log("Admin accounts found:");
  if (admins.length === 0) {
    console.log("No admin accounts found.");
  } else {
    admins.forEach(a => console.log(`ID: ${a.id}, Email: ${a.email}`));
  }
  await prisma.$disconnect();
}
findAdmins();
