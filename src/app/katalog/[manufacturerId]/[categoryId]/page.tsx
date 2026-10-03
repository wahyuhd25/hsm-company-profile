import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/app/components/Navbar";
import CategoryProductsClient from "./CategoryProductsClient";
import styles from "../../katalog-page.module.css";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ manufacturerId: string; categoryId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  const cat = await prisma.category.findFirst({
    where: {
      OR: [
        { id: categoryId },
        { slug: categoryId }
      ]
    }
  });
  return {
    title: cat
      ? `${cat.name} — Produk | PT. Hartindo Surya Medika`
      : "Produk | PT. Hartindo Surya Medika",
    description: cat?.desc,
  };
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      manufacturer: { select: { slug: true } },
    },
  });
  return categories
    .filter((cat) => cat.manufacturer !== null)
    .map((cat) => ({
      manufacturerId: cat.manufacturer!.slug,
      categoryId: cat.slug,
    }));
}

export const dynamicParams = true; // Support dynamic parameters for runtime additions

export default async function CategoryProductsPage({ params }: Props) {
  const { manufacturerId, categoryId } = await params;
  const isNumericMfr = !isNaN(Number(manufacturerId));

  // Fetch manufacturer and category with its products in parallel
  const [mfr, cat] = await Promise.all([
    prisma.manufacturer.findFirst({
      where: isNumericMfr ? { id: Number(manufacturerId) } : { slug: manufacturerId },
    }),
    prisma.category.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { slug: categoryId },
        ],
      },
      include: {
        products: {
          where: { product: { isActive: true } },
          include: { product: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  ]);

  if (!mfr || !cat) notFound();

  // Map to a combined product object for the client component
  const products = cat.products.map((cp) => ({
    ...cp.product,
    fixationType: cp.fixationType,
  }));

  return (
    <div className={styles.page}>
      <Navbar />
      <CategoryProductsClient mfr={mfr} cat={cat} products={products} />
    </div>
  );
}
