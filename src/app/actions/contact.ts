"use server";

import { prisma } from "@/lib/prisma";

export async function submitContactMessage(formData: FormData, turnstileToken: string) {
  try {
    // 1. Verifikasi Cloudflare Turnstile
    const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA"; // Use dummy test key if not set

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${SECRET_KEY}&response=${turnstileToken}`,
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return { success: false, error: "Gagal memverifikasi captcha. Silakan coba lagi." };
    }

    // 2. Ambil data dari FormData
    const name = formData.get("nama") as string;
    const email = formData.get("email") as string;
    const institusi = formData.get("institusi") as string;
    const telepon = formData.get("telepon") as string;
    const pesan = formData.get("pesan") as string;

    if (!name || !email || !telepon || !pesan) {
      return { success: false, error: "Data form tidak lengkap." };
    }

    // 3. Simpan ke database
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        institusi,
        phone: telepon,
        message: pesan,
      },
    });

    // TODO: Send email notification via Resend/SMTP here (Optional / Future enhancement)

    return { success: true };
  } catch (error) {
    console.error("Gagal mengirim pesan kontak:", error);
    return { success: false, error: "Terjadi kesalahan internal server." };
  }
}
