/**
 * Script untuk membuat user admin di Supabase Auth
 * Jalankan sekali: node scripts/create-admin.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load .env
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env");
  process.exit(1);
}

// Gunakan service role key untuk operasi admin
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const adminUser = {
  email: "manager@hartindo.local",
  password: "testing",
};

async function createAdminUser() {
  console.log(`🔧 Membuat user admin: ${adminUser.email}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminUser.email,
    password: adminUser.password,
    email_confirm: true, // Langsung confirm tanpa perlu verifikasi email
  });

  if (error) {
    if (error.message.includes("already been registered") || error.message.includes("already exists")) {
      console.log("⚠️  User sudah ada sebelumnya.");
    } else {
      console.error("❌ Gagal membuat user:", error.message);
      process.exit(1);
    }
    return;
  }

  console.log("✅ User admin berhasil dibuat!");
  console.log("   Email   :", adminUser.email);
  console.log("   Password:", adminUser.password);
  console.log("   User ID :", data.user.id);
}

createAdminUser();
