"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function getAdmins() {
  await requireAdmin();
  return await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
      // explicitly DO NOT select password
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addAdmin(formData: FormData) {
  await requireAdmin();
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Email dan password wajib diisi." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return { success: false, error: "Email tersebut sudah terdaftar sebagai admin." };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to database
    await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error) {
    console.error("Gagal menambah admin:", error);
    return { success: false, error: "Terjadi kesalahan internal server saat menambah admin." };
  }
}

export async function deleteAdmin(id: number) {
  await requireAdmin();
  try {
    // Check if trying to delete the last admin
    const adminCount = await prisma.admin.count();
    if (adminCount <= 1) {
      return { success: false, error: "Tidak dapat menghapus admin terakhir." };
    }

    await prisma.admin.delete({
      where: { id },
    });
    
    revalidatePath("/admin/admins");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus admin:", error);
    return { success: false, error: "Terjadi kesalahan internal server saat menghapus admin." };
  }
}
