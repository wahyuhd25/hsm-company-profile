const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFixation() {
  const data = await prisma.categoryToProduct.findMany({
    where: { categoryId: "CAT-CLAVICULA-SERIES" },
    include: { product: true }
  });
  console.log("Clavicula Fixation Types:");
  data.forEach(d => console.log(`${d.product.name} -> ${d.fixationType}`));
  
  const allTypes = await prisma.categoryToProduct.groupBy({
    by: ['fixationType'],
    _count: true
  });
  console.log("\nAll Fixation Types in DB:", allTypes);
  await prisma.$disconnect();
}
checkFixation();
