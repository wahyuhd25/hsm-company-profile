const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const LOGO_MARTHYS = "https://marthysorthopaedic.com/dist/logo/marthys1.png";
const CAT_IMG = "https://marthysorthopaedic.com/dist/tipe_produk/4.png";
const PROD_IMG = "https://marthysorthopaedic.com/dist/produk/10.%20CLAVICLE%20HOOK%20LOCKING%20PLATE.png";

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.product.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.manufacturer.deleteMany({});

  // 2. Create Marthys Manufacturer
  const marthys = await prisma.manufacturer.create({
    data: {
      name: "Marthys Orthopaedics",
      slug: "marthys",
      logoUrl: LOGO_MARTHYS,
      desc: "Spesialis produk implan ortopedi & instrumen bedah berkualitas tinggi",
    },
  });

  // 3. Create Categories
  const categoriesData = [
    {
      num: "[ 01 ]",
      name: "Implan Ortopedi — Bone Plates",
      desc: "Semua jenis plat tulang (termasuk Straight Plate, Tubular Plate, DCP, LCP) dari sistem Mini, Small, Large, hingga Titanium.",
      imageUrl: CAT_IMG,
      manufacturerId: marthys.id,
    },
    {
      num: "[ 02 ]",
      name: "Implan Ortopedi — Bone Screws",
      desc: "Cortical Screw, Cancellous Screw, Locking Screw, Ring Washer",
      imageUrl: CAT_IMG,
      manufacturerId: marthys.id,
    },
    {
      num: "[ 03 ]",
      name: "Instrumen Bedah",
      desc: "Hand Instruments, Instrument Sets, Power Tools & Accessories",
      imageUrl: CAT_IMG,
      manufacturerId: marthys.id,
    },
    {
      num: "[ 04 ]",
      name: "Fiksasi Eksternal",
      desc: "Pins & Wires untuk fiksasi eksternal tulang",
      imageUrl: CAT_IMG,
      manufacturerId: marthys.id,
    },
    {
      num: "[ 05 ]",
      name: "Joint Replacement",
      desc: "Bipolar Prosthesis, Total Hip Replacement, Total Knee Replacement",
      imageUrl: CAT_IMG,
      manufacturerId: marthys.id,
    },
    {
      num: "[ 06 ]",
      name: "Aksesoris",
      desc: "Kotak penyimpanan dan aksesori pendukung produk ortopedi",
      imageUrl: CAT_IMG,
      manufacturerId: marthys.id,
    },
    {
      num: "[ 07 ]",
      name: "Intramedullary Nails",
      desc: "Batang paku intramedullary: Femur, Tibia, Humeral",
      imageUrl: CAT_IMG,
      manufacturerId: marthys.id,
    },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories.push(created);
  }

  // 4. Create Subcategories & Products
  const catBonePlates = categories.find(c => c.name.includes("Bone Plates"));
  const catBoneScrews = categories.find(c => c.name.includes("Bone Screws"));
  const catInstrumen = categories.find(c => c.name.includes("Instrumen"));
  const catFiksasi = categories.find(c => c.name.includes("Fiksasi"));
  const catJoint = categories.find(c => c.name.includes("Joint"));
  const catAksesoris = categories.find(c => c.name.includes("Aksesoris"));
  const catNails = categories.find(c => c.name.includes("Nails"));

  // Bone Plates
  if (catBonePlates) {
    const subLSS = await prisma.subCategory.create({
      data: { num: "01.A", name: "Locking Stainless Steel", desc: "Locking Stainless Steel Plates", categoryId: catBonePlates.id }
    });
    const subLT = await prisma.subCategory.create({
      data: { num: "01.B", name: "Locking Titanium", desc: "Locking Titanium Plates", categoryId: catBonePlates.id }
    });
    const subNLM = await prisma.subCategory.create({
      data: { num: "01.E", name: "Non-Locking Mini", desc: "Non-Locking Mini Plates", categoryId: catBonePlates.id }
    });

    await prisma.product.createMany({
      data: [
        { name: "MINI STRAIGHT PLATE 4H", kodeBarang: "MNI-001", description: "Mini straight plate with 4 holes", imageUrl: PROD_IMG, subCategoryId: subNLM.id },
        { name: "MINI STRAIGHT PLATE 6H", kodeBarang: "MNI-002", description: "Mini straight plate with 6 holes", imageUrl: PROD_IMG, subCategoryId: subNLM.id },
        { name: "MINI T-PLATE", kodeBarang: "MNI-003", description: "Mini T-shaped plate", imageUrl: PROD_IMG, subCategoryId: subNLM.id },
        { name: "LCP PROXIMAL HUMERUS PLATE", kodeBarang: "LSS-001", description: "Proximal humerus locking plate", imageUrl: PROD_IMG, subCategoryId: subLSS.id },
        { name: "LCP DISTAL FEMUR PLATE", kodeBarang: "LSS-002", description: "Distal femur locking plate", imageUrl: PROD_IMG, subCategoryId: subLSS.id },
      ]
    });
  }

  // Bone Screws
  if (catBoneScrews) {
    const subCortical = await prisma.subCategory.create({
      data: { num: "02.A", name: "Cortical Screw", desc: "Cortical Screws", categoryId: catBoneScrews.id }
    });
    const subLocking = await prisma.subCategory.create({
      data: { num: "02.B", name: "Locking Screw", desc: "Locking Screws", categoryId: catBoneScrews.id }
    });

    await prisma.product.createMany({
      data: [
        { name: "CORTICAL SCREW 3.5MM x 10MM", kodeBarang: "COR-001", description: "Cortical screw diameter 3.5mm length 10mm", imageUrl: PROD_IMG, subCategoryId: subCortical.id },
        { name: "CORTICAL SCREW 3.5MM x 16MM", kodeBarang: "COR-002", description: "Cortical screw diameter 3.5mm length 16mm", imageUrl: PROD_IMG, subCategoryId: subCortical.id },
        { name: "LOCKING SCREW 3.5MM x 12MM", kodeBarang: "LOK-001", description: "Locking screw diameter 3.5mm length 12mm", imageUrl: PROD_IMG, subCategoryId: subLocking.id },
      ]
    });
  }

  // Instrumen Bedah
  if (catInstrumen) {
    const subHand = await prisma.subCategory.create({
      data: { num: "03.A", name: "Hand Instruments", desc: "Hand-held surgical instruments", categoryId: catInstrumen.id }
    });
    await prisma.product.createMany({
      data: [
        { name: "BONE CURRETE SET", kodeBarang: "INS-001", description: "Bone curette surgical set", imageUrl: PROD_IMG, subCategoryId: subHand.id },
        { name: "BONE HOLDING FORCEPS", kodeBarang: "INS-002", description: "Bone holding forceps", imageUrl: PROD_IMG, subCategoryId: subHand.id },
      ]
    });
  }

  // Fiksasi Eksternal
  if (catFiksasi) {
    const subPins = await prisma.subCategory.create({
      data: { num: "04.A", name: "Pins & Wires", desc: "Pins and wires for external fixation", categoryId: catFiksasi.id }
    });
    await prisma.product.createMany({
      data: [
        { name: "K-WIRE 1.0MM", kodeBarang: "PIN-001", description: "Kirschner wire 1.0mm", imageUrl: PROD_IMG, subCategoryId: subPins.id },
        { name: "K-WIRE 1.5MM", kodeBarang: "PIN-002", description: "Kirschner wire 1.5mm", imageUrl: PROD_IMG, subCategoryId: subPins.id },
      ]
    });
  }

  // Joint Replacement
  if (catJoint) {
    const subBipolar = await prisma.subCategory.create({
      data: { num: "05.A", name: "Bipolar Prosthesis", desc: "Bipolar hip replacement prosthesis", categoryId: catJoint.id }
    });
    await prisma.product.createMany({
      data: [
        { name: "BIPOLAR HEAD 22MM", kodeBarang: "BIP-001", description: "Bipolar prosthesis head size 22mm", imageUrl: PROD_IMG, subCategoryId: subBipolar.id },
        { name: "BIPOLAR HEAD 26MM", kodeBarang: "BIP-002", description: "Bipolar prosthesis head size 26mm", imageUrl: PROD_IMG, subCategoryId: subBipolar.id },
      ]
    });
  }

  // Aksesoris
  if (catAksesoris) {
    const subBox = await prisma.subCategory.create({
      data: { num: "06.A", name: "Kotak Penyimpanan", desc: "Storage boxes for implants and instruments", categoryId: catAksesoris.id }
    });
    await prisma.product.createMany({
      data: [
        { name: "INSTRUMENT STORAGE BOX SMALL", kodeBarang: "BOX-001", description: "Small storage container", imageUrl: PROD_IMG, subCategoryId: subBox.id },
        { name: "INSTRUMENT STORAGE BOX MEDIUM", kodeBarang: "BOX-002", description: "Medium storage container", imageUrl: PROD_IMG, subCategoryId: subBox.id },
      ]
    });
  }

  // Intramedullary Nails
  if (catNails) {
    const subNails = await prisma.subCategory.create({
      data: { num: "07.A", name: "Interlocking Nails", desc: "Interlocking intramedullary nails", categoryId: catNails.id }
    });
    await prisma.product.createMany({
      data: [
        { name: "FEMORAL INTERLOCKING NAIL 9MM", kodeBarang: "INL-001", description: "Femoral intramedullary nail 9mm", imageUrl: PROD_IMG, subCategoryId: subNails.id },
        { name: "TIBIAL INTERLOCKING NAIL 8MM", kodeBarang: "INL-002", description: "Tibial intramedullary nail 8mm", imageUrl: PROD_IMG, subCategoryId: subNails.id },
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
