const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');
const prisma = new PrismaClient();

async function updateImages() {
  const filePath = path.join(__dirname, '..', 'crawling', 'Marthys_Catalog_Import_Ready.xlsx');
  const workbook = xlsx.readFile(filePath);
  const prodSheet = workbook.Sheets['Products'];
  
  if (prodSheet) {
    const products = xlsx.utils.sheet_to_json(prodSheet);
    let count = 0;
    
    for (const row of products) {
      if (row.source_image_url) {
        try {
          await prisma.product.update({
            where: { id: row.product_id },
            data: { imageUrl: row.source_image_url }
          });
          count++;
        } catch (e) {
          console.log(`Failed to update ${row.product_id}`);
        }
      }
    }
    console.log(`Successfully updated ${count} products with image URLs.`);
  }
  
  await prisma.$disconnect();
}

updateImages();
