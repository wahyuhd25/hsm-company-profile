"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import sharp from "sharp";

/** Mengubah file upload gambar menjadi WebP Data URI terkompresi atau memakai URL jika diisi */
async function processImage(file: File | null, fallbackUrl: string | null): Promise<string | null> {
  if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const compressed = await sharp(buffer)
        .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      return `data:image/webp;base64,${compressed.toString("base64")}`;
    } catch (err) {
      console.error("[katalog] Error compressing image with sharp:", err);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      return `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
    }
  }
  return fallbackUrl?.trim() || null;
}

/** Manufacturer induk dari sebuah kategori — dibutuhkan untuk revalidasi halaman publik. */
async function getManufacturerIdOfCategory(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { manufacturerId: true },
  });
  return category?.manufacturerId ?? null;
}

// ── MANUFACTURER ACTIONS ──────────────────────────────────────────────

export async function createManufacturer(formData: FormData): Promise<void> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const logoFile = formData.get("logoFile") as File | null;
  const rawLogoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const logoUrl = await processImage(logoFile, rawLogoUrl);
  const desc = (formData.get("desc") as string)?.trim() || null;

  if (!name || !slug) {
    console.error("[katalog]", "Nama dan Slug wajib diisi.");
    return;
  }

  try {
    await prisma.manufacturer.create({
      data: { name, slug, logoUrl, desc },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      console.error("[katalog]", "Slug sudah digunakan oleh manufakturer lain.");
      return;
    }
    console.error("[katalog]", "Terjadi kesalahan saat membuat manufakturer.");
    return;
  }

  revalidatePath("/admin/katalog");
  revalidatePath("/");
}

export async function updateManufacturer(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const logoFile = formData.get("logoFile") as File | null;
  const rawLogoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const logoUrl = await processImage(logoFile, rawLogoUrl);
  const desc = (formData.get("desc") as string)?.trim() || null;

  if (!id || !name || !slug) {
    console.error("[katalog]", "Data tidak valid.");
    return;
  }

  try {
    await prisma.manufacturer.update({
      where: { id },
      data: { name, slug, logoUrl, desc },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      console.error("[katalog]", "Slug sudah digunakan oleh manufakturer lain.");
      return;
    }
    console.error("[katalog]", "Terjadi kesalahan saat memperbarui manufakturer.");
    return;
  }

  revalidatePath("/admin/katalog");
  revalidatePath("/");
  revalidatePath(`/katalog/${id}`);
  redirect("/admin/katalog");
}

export async function deleteManufacturer(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.manufacturer.delete({ where: { id } });

  revalidatePath("/admin/katalog");
  revalidatePath("/");
  revalidatePath(`/katalog/${id}`);
}

// ── CATEGORY ACTIONS ──────────────────────────────────────────────────

export async function createCategory(formData: FormData): Promise<void> {
  await requireAdmin();

  const manufacturerId = Number(formData.get("manufacturerId"));
  const name = (formData.get("name") as string)?.trim();
  const desc = (formData.get("desc") as string)?.trim();
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const imageFile = formData.get("imageFile") as File | null;
  const rawImageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const imageUrl = await processImage(imageFile, rawImageUrl);

  if (!manufacturerId || !name) {
    console.error("[katalog]", "Nama dan manufakturer wajib diisi.");
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await prisma.category.create({
    data: { id: `CAT-${slug.toUpperCase()}`, slug, name, desc: desc || "", sortOrder, imageUrl, manufacturerId },
  });

  revalidatePath("/admin/katalog");
  revalidatePath(`/katalog/${manufacturerId}`);
}

export async function updateCategory(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const manufacturerId = Number(formData.get("manufacturerId"));
  const name = (formData.get("name") as string)?.trim();
  const desc = (formData.get("desc") as string)?.trim();
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const imageFile = formData.get("imageFile") as File | null;
  const rawImageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const imageUrl = await processImage(imageFile, rawImageUrl);

  if (!id || !name) {
    console.error("[katalog]", "Data tidak valid.");
    return;
  }

  await prisma.category.update({
    where: { id },
    data: { name, desc: desc || "", sortOrder, imageUrl },
  });

  revalidatePath("/admin/katalog");
  if (manufacturerId) revalidatePath(`/katalog/${manufacturerId}`);
  redirect("/admin/katalog");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return;

  const manufacturerId = await getManufacturerIdOfCategory(id);

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/katalog");
  if (manufacturerId) revalidatePath(`/katalog/${manufacturerId}`);
}

// ── PRODUCT ACTIONS ───────────────────────────────────────────────────

export async function createProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const categoryId = formData.get("categoryId") as string;
  const id = (formData.get("id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const imageFile = formData.get("imageFile") as File | null;
  const rawImageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const imageUrl = await processImage(imageFile, rawImageUrl);
  const productKind = (formData.get("productKind") as string)?.trim() || null;
  const fixationType = (formData.get("fixationType") as string)?.trim() || null;

  if (!id || !name || !categoryId) {
    console.error("[katalog]", "ID, Nama produk, dan kategori wajib diisi.");
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  try {
    await prisma.product.create({
      data: {
        id,
        slug,
        name,
        description,
        imageUrl,
        productKind,
        categories: {
          create: {
            categoryId,
            fixationType
          }
        }
      },
    });
  } catch (err) {
    console.error("[katalog]", "Gagal membuat produk:", err);
    return;
  }

  const manufacturerId = await getManufacturerIdOfCategory(categoryId);
  revalidatePath(`/admin/katalog/${categoryId}`);
  if (manufacturerId) {
    revalidatePath(`/katalog/${manufacturerId}`);
    revalidatePath(`/katalog/${manufacturerId}/${categoryId}`);
  }
}

export async function updateProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const categoryId = formData.get("categoryId") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const imageFile = formData.get("imageFile") as File | null;
  const rawImageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const imageUrl = await processImage(imageFile, rawImageUrl);
  const productKind = (formData.get("productKind") as string)?.trim() || null;
  const fixationType = (formData.get("fixationType") as string)?.trim() || null;

  if (!id || !name || !categoryId) {
    console.error("[katalog]", "Data tidak valid.");
    return;
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { 
        name, 
        description, 
        imageUrl,
        productKind
      },
    });

    // Update fixationType in CategoryToProduct
    await prisma.categoryToProduct.update({
      where: {
        productId_categoryId: {
          productId: id,
          categoryId
        }
      },
      data: {
        fixationType
      }
    });

  } catch (err) {
    console.error("[katalog]", "Gagal mengupdate produk:", err);
    return;
  }

  const manufacturerId = await getManufacturerIdOfCategory(categoryId);
  revalidatePath(`/admin/katalog/${categoryId}`);
  if (manufacturerId) {
    revalidatePath(`/katalog/${manufacturerId}`);
    revalidatePath(`/katalog/${manufacturerId}/${categoryId}`);
  }
  redirect(`/admin/katalog/${categoryId}`);
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const categoryId = formData.get("categoryId") as string;
  if (!id) return;

  const manufacturerId = await getManufacturerIdOfCategory(categoryId);

  // We could just delete the link, but since it was created here we might want to delete the product?
  // Let's just delete the product. Cascade will remove CategoryToProduct.
  await prisma.product.delete({ where: { id } });

  revalidatePath(`/admin/katalog/${categoryId}`);
  if (manufacturerId) {
    revalidatePath(`/katalog/${manufacturerId}`);
    revalidatePath(`/katalog/${manufacturerId}/${categoryId}`);
  }
}

export async function toggleProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";
  const categoryId = formData.get("categoryId") as string;
  if (!id) return;

  await prisma.product.update({
    where: { id },
    data: { isActive: !isActive },
  });

  const manufacturerId = await getManufacturerIdOfCategory(categoryId);
  revalidatePath(`/admin/katalog/${categoryId}`);
  if (manufacturerId) {
    revalidatePath(`/katalog/${manufacturerId}`);
    revalidatePath(`/katalog/${manufacturerId}/${categoryId}`);
  }
}
