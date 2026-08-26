const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLogo() {
  await prisma.manufacturer.update({
    where: { slug: 'marthys' },
    data: { logoUrl: 'https://marthysorthopaedic.com/assets/images/logo%20web.png' }
  });
  console.log("Updated manufacturer logoUrl to https://marthysorthopaedic.com/assets/images/logo%20web.png");
  await prisma.$disconnect();
}
updateLogo();
