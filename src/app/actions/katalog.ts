"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// ── MANUFACTURER ACTIONS ──────────────────────────────────────────────

export async function createManufacturer(formData: FormData): Promise<any> {
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const desc = (formData.get("desc") as string)?.trim() || null;

  if (!name || !slug) return { error: "Nama dan Slug wajib diisi." };

  try {
    await prisma.manufacturer.create({
      data: { name, slug, logoUrl, desc },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "Slug sudah digunakan oleh manufakturer lain." };
    }
    return { error: "Terjadi kesalahan saat membuat manufakturer." };
  }

  revalidatePath("/admin/katalog");
}

export async function updateManufacturer(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const desc = (formData.get("desc") as string)?.trim() || null;

  if (!id || !name || !slug) return { error: "Data tidak valid." };

  try {
    await prisma.manufacturer.update({
      where: { id },
      data: { name, slug, logoUrl, desc },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "Slug sudah digunakan oleh manufakturer lain." };
    }
    return { error: "Terjadi kesalahan saat memperbarui manufakturer." };
  }

  revalidatePath("/admin/katalog");
  redirect("/admin/katalog");
}

export async function deleteManufacturer(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.manufacturer.delete({ where: { id } });
  revalidatePath("/admin/katalog");
}

// ── CATEGORY ACTIONS ──────────────────────────────────────────────────

export async function createCategory(formData: FormData): Promise<any> {
  const manufacturerId = Number(formData.get("manufacturerId"));
  const name = (formData.get("name") as string)?.trim();
  const desc = (formData.get("desc") as string)?.trim();
  const num = (formData.get("num") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;

  if (!manufacturerId || !name || !num) return { error: "Nama, nomor, dan manufakturer wajib diisi." };

  await prisma.category.create({
    data: { name, desc: desc || "", num, imageUrl, manufacturerId },
  });

  revalidatePath("/admin/katalog");
}

export async function updateCategory(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  const desc = (formData.get("desc") as string)?.trim();
  const num = (formData.get("num") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;

  if (!id || !name || !num) return { error: "Data tidak valid." };

  await prisma.category.update({
    where: { id },
    data: { name, desc: desc || "", num, imageUrl },
  });

  revalidatePath("/admin/katalog");
  redirect("/admin/katalog");
}

export async function deleteCategory(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  if (!id) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/katalog");
}

// ── SUBCATEGORY ACTIONS ───────────────────────────────────────────────

export async function createSubCategory(formData: FormData): Promise<any> {
  const categoryId = Number(formData.get("categoryId"));
  const name = (formData.get("name") as string)?.trim();
  const desc = (formData.get("desc") as string)?.trim();
  const num = (formData.get("num") as string)?.trim();

  if (!categoryId || !name || !num) return { error: "Nama dan nomor wajib diisi." };

  await prisma.subCategory.create({
    data: { name, desc: desc || "", num, categoryId },
  });

  revalidatePath(`/admin/katalog/${categoryId}`);
}

export async function updateSubCategory(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  const categoryId = Number(formData.get("categoryId"));
  const name = (formData.get("name") as string)?.trim();
  const desc = (formData.get("desc") as string)?.trim();
  const num = (formData.get("num") as string)?.trim();

  if (!id || !name || !num || !categoryId) return { error: "Data tidak valid." };

  await prisma.subCategory.update({
    where: { id },
    data: { name, desc: desc || "", num },
  });

  revalidatePath(`/admin/katalog/${categoryId}`);
  redirect(`/admin/katalog/${categoryId}`);
}

export async function deleteSubCategory(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  const categoryId = Number(formData.get("categoryId"));
  if (!id) return;

  await prisma.subCategory.delete({ where: { id } });
  revalidatePath(`/admin/katalog/${categoryId}`);
}

// ── PRODUCT ACTIONS ───────────────────────────────────────────────────

export async function createProduct(formData: FormData): Promise<any> {
  const categoryId = Number(formData.get("categoryId"));
  const subCategoryId = Number(formData.get("subCategoryId"));
  const name = (formData.get("name") as string)?.trim();
  const kodeBarang = (formData.get("kodeBarang") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;

  if (!subCategoryId || !name || !categoryId) return { error: "Nama produk wajib diisi." };

  await prisma.product.create({
    data: { subCategoryId, name, kodeBarang, description, imageUrl },
  });

  revalidatePath(`/admin/katalog/${categoryId}`);
}

export async function updateProduct(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  const categoryId = Number(formData.get("categoryId"));
  const subCategoryId = Number(formData.get("subCategoryId"));
  const name = (formData.get("name") as string)?.trim();
  const kodeBarang = (formData.get("kodeBarang") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;

  if (!id || !name || !categoryId || !subCategoryId) return { error: "Data tidak valid." };

  await prisma.product.update({
    where: { id },
    data: { name, subCategoryId, kodeBarang, description, imageUrl },
  });

  revalidatePath(`/admin/katalog/${categoryId}`);
  redirect(`/admin/katalog/${categoryId}`);
}

export async function deleteProduct(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  const categoryId = Number(formData.get("categoryId"));
  if (!id) return;

  await prisma.product.delete({ where: { id } });
  revalidatePath(`/admin/katalog/${categoryId}`);
}

export async function toggleProduct(formData: FormData): Promise<any> {
  const id = Number(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  const categoryId = Number(formData.get("categoryId"));

  await prisma.product.update({
    where: { id },
    data: { isActive: !isActive },
  });

  revalidatePath(`/admin/katalog/${categoryId}`);
}
