const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '..', 'crawling', 'Marthys_Catalog_Import_Ready.xlsx');
  console.log(`Reading Excel file from: ${filePath}`);
  const workbook = xlsx.readFile(filePath);

  // 1. Create Manufacturer
  const manufacturer = await prisma.manufacturer.upsert({
    where: { slug: 'marthys' },
    update: {},
    create: {
      name: 'MARTHYS',
      slug: 'marthys',
      desc: 'Marthys Orthopaedic',
      logoUrl: 'https://marthysorthopaedic.com/assets/images/logo%20web.png'
    },
  });
  console.log(`Manufacturer created/found: ${manufacturer.name}`);

  // 2. Categories
  const catSheet = workbook.Sheets['Categories'];
  if (catSheet) {
    const categories = xlsx.utils.sheet_to_json(catSheet);
    for (const row of categories) {
      await prisma.category.upsert({
        where: { slug: row.slug },
        update: {
            name: row.category_name,
            sortOrder: row.sort_order,
            isActive: row.is_active,
            manufacturerId: manufacturer.id,
            imageUrl: `https://marthysorthopaedic.com/dist/tipe_produk/${row.sort_order}.png`
        },
        create: {
          id: row.category_id,
          slug: row.slug,
          name: row.category_name,
          sortOrder: row.sort_order || 0,
          isActive: row.is_active ?? true,
          manufacturerId: manufacturer.id,
          imageUrl: `https://marthysorthopaedic.com/dist/tipe_produk/${row.sort_order}.png`
        },
      });
    }
    console.log(`Inserted ${categories.length} categories.`);
  }

  // 3. Products
  const prodSheet = workbook.Sheets['Products'];
  let validProductIds = new Set();
  if (prodSheet) {
    const products = xlsx.utils.sheet_to_json(prodSheet);
    for (const row of products) {
      validProductIds.add(row.product_id);
      await prisma.product.upsert({
        where: { slug: row.slug },
        update: {
            name: row.name,
            description: row.description,
            productKind: row.product_kind,
            materialDisplay: row.material_display,
            tableType: row.table_type,
            showTable: row.show_table,
            showInfoBlock: row.show_info_block,
            showBrand: row.show_brand,
            isActive: row.is_active,
            imageUrl: row.source_image_url,
        },
        create: {
          id: row.product_id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          productKind: row.product_kind,
          materialDisplay: row.material_display,
          tableType: row.table_type,
          showTable: row.show_table ?? true,
          showInfoBlock: row.show_info_block ?? false,
          showBrand: row.show_brand ?? true,
          isActive: row.is_active ?? true,
          imageUrl: row.source_image_url,
        },
      });
    }
    console.log(`Inserted ${products.length} products.`);
  }

  // 4. Product_Categories
  const pcSheet = workbook.Sheets['Product_Categories'];
  if (pcSheet) {
    const pcData = xlsx.utils.sheet_to_json(pcSheet);
    let count = 0;
    for (const row of pcData) {
      if (row.is_visible && validProductIds.has(row.product_id)) {
         try {
             await prisma.categoryToProduct.upsert({
                where: {
                    productId_categoryId: {
                        productId: row.product_id,
                        categoryId: row.category_id,
                    }
                },
                update: {
                    fixationType: row.fixation_type,
                    sortOrder: row.sort_order
                },
                create: {
                    productId: row.product_id,
                    categoryId: row.category_id,
                    fixationType: row.fixation_type,
                    sortOrder: row.sort_order || 0
                }
             });
             count++;
         } catch(e) {
             console.log(`Warning: Failed linking Product ${row.product_id} to Category ${row.category_id}`, e);
         }
      }
    }
    console.log(`Inserted ${count} Product-Category relations.`);
  }

  // 5. Implant_Specs
  const specSheet = workbook.Sheets['Implant_Specs'];
  if (specSheet) {
    const specs = xlsx.utils.sheet_to_json(specSheet);
    const validSpecs = specs.filter(r => r.is_visible && validProductIds.has(r.product_id)).map(row => ({
        productId: row.product_id,
        sortOrder: row.sort_order || 0,
        catalogNumber: String(row.catalog_number_ss || row.source_catalog_number || ''),
        material: String(row.material_display || row.source_material || ''),
        size: String(row.size || ''),
        tkdn: String(row.tkdn_ss || row.source_tkdn || ''),
        eCatalog: String(row.e_catalog_ss || ''),
        isVisible: true
    }));
    await prisma.implantSpec.createMany({
        data: validSpecs,
        skipDuplicates: true
    });
    console.log(`Inserted ${validSpecs.length} Implant Specs.`);
  }

  // 6. Components
  const compSheet = workbook.Sheets['Components'];
  if (compSheet) {
    const comps = xlsx.utils.sheet_to_json(compSheet);
    const validComps = comps.filter(r => r.is_visible && validProductIds.has(r.product_id)).map(row => ({
        productId: row.product_id,
        sortOrder: row.sort_order || 0,
        productNumber: String(row.product_number || ''),
        catalogNumber: String(row.catalog_number || ''),
        componentName: String(row.component_name || ''),
        specification: String(row.specification || ''),
        qty: String(row.qty || ''),
        isVisible: true
    }));
    await prisma.productComponent.createMany({
        data: validComps,
        skipDuplicates: true
    });
    console.log(`Inserted ${validComps.length} Components.`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
