const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClavicula() {
  const products = await prisma.product.findMany({
    where: { categories: { some: { categoryId: "CAT-CLAVICULA-SERIES" } } },
    select: { id: true, name: true, isActive: true }
  });
  console.log("Clavicula Products in DB:");
  console.table(products);
  await prisma.$disconnect();
}
checkClavicula();
