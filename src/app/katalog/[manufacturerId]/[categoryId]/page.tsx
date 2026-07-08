import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/app/components/Navbar";
import CategoryProductsClient from "./CategoryProductsClient";
import styles from "../../katalog-page.module.css";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ manufacturerId: string; categoryId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  const cat = await prisma.category.findUnique({
    where: { id: Number(categoryId) },
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
      id: true,
      manufacturerId: true,
    },
  });
  return categories
    .filter((cat) => cat.manufacturerId !== null)
    .map((cat) => ({
      manufacturerId: String(cat.manufacturerId),
      categoryId: String(cat.id),
    }));
}

export const dynamicParams = true; // Support dynamic parameters for runtime additions

export default async function CategoryProductsPage({ params }: Props) {
  const { manufacturerId, categoryId } = await params;

  const mfrId = Number(manufacturerId);
  const catId = Number(categoryId);

  const mfr = await prisma.manufacturer.findUnique({
    where: { id: mfrId },
  });

  const cat = await prisma.category.findUnique({
    where: { id: catId },
  });

  if (!mfr || !cat) notFound();

  // Fetch all active products under this category
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      subCategory: {
        categoryId: cat.id,
      },
    },
    include: {
      subCategory: true,
    },
    orderBy: { id: "asc" },
  });

  return (
    <div className={styles.page}>
      <Navbar />
      <CategoryProductsClient mfr={mfr} cat={cat} products={products} />
    </div>
  );
}
