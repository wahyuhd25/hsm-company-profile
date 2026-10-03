import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hartindosuryamedika.com";

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  try {
    // 2. Dynamic Manufacturers
    const manufacturers = await prisma.manufacturer.findMany({
      select: { slug: true, updatedAt: true },
    });
    const mfrRoutes: MetadataRoute.Sitemap = manufacturers.map((mfr) => ({
      url: `${baseUrl}/katalog/${mfr.slug}`,
      lastModified: mfr.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 3. Dynamic Categories
    const categories = await prisma.category.findMany({
      where: {
        manufacturer: { isNot: null },
      },
      select: {
        slug: true,
        updatedAt: true,
        manufacturer: { select: { slug: true } },
      },
    });
    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter((cat) => cat.manufacturer !== null)
      .map((cat) => ({
        url: `${baseUrl}/katalog/${cat.manufacturer!.slug}/${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    // 4. Dynamic Products
    const catProducts = await prisma.categoryToProduct.findMany({
      where: {
        product: { isActive: true },
        category: { manufacturer: { isNot: null } },
      },
      select: {
        productId: true,
        product: { select: { updatedAt: true } },
        category: {
          select: {
            slug: true,
            manufacturer: { select: { slug: true } },
          },
        },
      },
    });
    const productRoutes: MetadataRoute.Sitemap = catProducts
      .filter((cp) => cp.category.manufacturer !== null)
      .map((cp) => ({
        url: `${baseUrl}/katalog/${cp.category.manufacturer!.slug}/${cp.category.slug}/${cp.productId}`,
        lastModified: cp.product.updatedAt,
        changeFrequency: "monthly",
        priority: 0.9,
      }));

    return [...staticRoutes, ...mfrRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
