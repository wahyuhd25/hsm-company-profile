"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { JWT_SECRET, SESSION_COOKIE } from "@/lib/auth";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  // Find admin in the custom database table
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return { error: "Email atau password salah. Silakan coba lagi." };
  }

  // Verify hashed password using bcrypt
  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return { error: "Email atau password salah. Silakan coba lagi." };
  }

  // Generate session token (JWT)
  const token = await new SignJWT({ id: admin.id, email: admin.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);

  // Set HTTP-only secure session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
  });

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
  redirect("/login");
}
