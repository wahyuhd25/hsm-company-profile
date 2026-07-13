const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PROD_IMG = "https://marthysorthopaedic.com/dist/produk/10.%20CLAVICLE%20HOOK%20LOCKING%20PLATE.png";
const CAT_IMG = "https://marthysorthopaedic.com/dist/tipe_produk/4.png";

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.product.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.manufacturer.deleteMany({});

  // 2. Data Manufakturer
  const manufacturers = [
    {
      name: "Marthys Orthopaedics",
      slug: "marthys",
      logoUrl: "https://marthysorthopaedic.com/dist/logo/marthys1.png",
      desc: "Spesialis produk implan ortopedi & instrumen bedah berkualitas tinggi",
    },
    {
      name: "Mario Orthopedics",
      slug: "mario",
      logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVScqf1ukt17-tRGuuRxstfQelOCL25y_LQWZhFQzots4NoOti-gE7-z0&s=10",
      desc: "Manufakturer alat ortopedi terbaik di ambon kiri",
    },
    {
      name: "Apex Surgical Solutions",
      slug: "apex-surgical",
      logoUrl: "https://placehold.co/200x200/2563eb/ffffff?text=Apex",
      desc: "Solusi bedah inovatif untuk pemulihan optimal dengan presisi tinggi.",
    },
    {
      name: "TitanMed Implants",
      slug: "titanmed",
      logoUrl: "https://placehold.co/200x200/0f172a/ffffff?text=TitanMed",
      desc: "Implan titanium premium berstandar internasional untuk trauma tulang.",
    },
    {
      name: "Global Ortho Systems",
      slug: "global-ortho",
      logoUrl: "https://placehold.co/200x200/16a34a/ffffff?text=GOS",
      desc: "Sistem instrumen dan fiksasi ortopedi terintegrasi untuk rumah sakit.",
    },
    {
      name: "BioCore Solutions",
      slug: "biocore",
      logoUrl: "https://placehold.co/200x200/ef4444/ffffff?text=BioCore",
      desc: "Inovasi biomaterial untuk ortopedi regeneratif dan implan tulang yang mutakhir.",
    },
    {
      name: "OrthoSpine Dynamics",
      slug: "orthospine",
      logoUrl: "https://placehold.co/200x200/8b5cf6/ffffff?text=OSD",
      desc: "Solusi bedah tulang belakang dengan tingkat presisi dan keamanan terbaik.",
    },
    {
      name: "Zenith Medical",
      slug: "zenith",
      logoUrl: "https://placehold.co/200x200/f59e0b/ffffff?text=Zenith",
      desc: "Manufakturer alat kesehatan global dengan standar mutu ISO 13485.",
    }
  ];

  // 3. Insert loop
  for (const [idx, mfrData] of manufacturers.entries()) {
    const mfr = await prisma.manufacturer.create({
      data: mfrData
    });
    console.log(`Created manufacturer: ${mfr.name}`);

    // Create 1 category per manufacturer (for dummy data purposes)
    const cat = await prisma.category.create({
      data: {
        num: `[ 0${idx + 1} ]`,
        name: "Kategori Unggulan - " + mfr.name,
        desc: "Koleksi produk unggulan dari " + mfr.name,
        imageUrl: CAT_IMG,
        manufacturerId: mfr.id
      }
    });

    // Create 1 subcategory
    const subCat = await prisma.subCategory.create({
      data: {
        num: `0${idx + 1}.A`,
        name: "Seri Utama",
        desc: "Seri implan dan instrumen utama",
        categoryId: cat.id
      }
    });

    // Create 2 products per subcategory
    await prisma.product.createMany({
      data: [
        {
          name: `Produk A - ${mfr.name}`,
          kodeBarang: `PRD-${idx}-A`,
          description: `Deskripsi produk contoh A untuk ${mfr.name}`,
          imageUrl: PROD_IMG,
          subCategoryId: subCat.id
        },
        {
          name: `Produk B - ${mfr.name}`,
          kodeBarang: `PRD-${idx}-B`,
          description: `Deskripsi produk contoh B untuk ${mfr.name}`,
          imageUrl: PROD_IMG,
          subCategoryId: subCat.id
        }
      ]
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
