const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLogo() {
  await prisma.manufacturer.update({
    where: { slug: 'marthys' },
    data: { logoUrl: '/images/manufacturers/marthys.webp' }
  });
  console.log("Updated manufacturer logoUrl to /images/manufacturers/marthys.webp");
  await prisma.$disconnect();
}
updateLogo();
