const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOldData() {
  try {
    const categories = await prisma.$queryRaw`SELECT * FROM categories`;
    const products = await prisma.$queryRaw`SELECT * FROM products LIMIT 5`; // limit to 5 so it's not too long
    console.log(JSON.stringify({
        totalCategories: categories.length,
        categories: categories,
        totalProductsSample: products.length,
        productsSample: products
    }, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkOldData();
