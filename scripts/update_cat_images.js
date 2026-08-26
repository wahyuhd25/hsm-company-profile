const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCatImages() {
  const categories = await prisma.category.findMany();
  let count = 0;
  for (const cat of categories) {
    // Assuming sortOrder is 1 to 16
    const imgUrl = `https://marthysorthopaedic.com/dist/tipe_produk/${cat.sortOrder}.png`;
    await prisma.category.update({
      where: { id: cat.id },
      data: { imageUrl: imgUrl }
    });
    count++;
  }
  console.log(`Updated ${count} categories with image URLs.`);
  await prisma.$disconnect();
}
updateCatImages();
