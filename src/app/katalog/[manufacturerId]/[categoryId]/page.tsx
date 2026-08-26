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
  const mfr = await prisma.manufacturer.findFirst({
    where: isNumericMfr ? { id: Number(manufacturerId) } : { slug: manufacturerId },
  });

  const cat = await prisma.category.findFirst({
    where: {
      OR: [
        { id: categoryId },
        { slug: categoryId }
      ]
    }
  });

  if (!mfr || !cat) notFound();

  // Fetch CategoryToProduct to get the fixationType for each product
  const catProducts = await prisma.categoryToProduct.findMany({
    where: {
      categoryId: cat.id,
      product: { isActive: true },
    },
    include: {
      product: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  // Map to a combined product object for the client component
  const products = catProducts.map((cp) => ({
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
