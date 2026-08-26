import { jwtVerify, type JWTPayload } from "jose";

/**
 * Sumber tunggal untuk JWT_SECRET.
 *
 * Tidak ada nilai cadangan. Kalau JWT_SECRET tidak diset, aplikasi harus gagal
 * menyala — jauh lebih baik daripada menyala dengan secret yang tertulis di
 * dalam repositori dan bisa dipakai siapa pun untuk memalsukan sesi admin.
 * Lihat docs/ISSUES.md#hsm-002.
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET wajib diset di environment. Lihat docs/SETUP.md bagian 3."
    );
  }
  return new TextEncoder().encode(secret);
}

export const JWT_SECRET = getSecret();

/** Nama cookie sesi. Mengubahnya akan mematikan semua sesi yang sedang aktif. */
export const SESSION_COOKIE = "hsm_session";

/**
 * Verifikasi token sesi. Mengembalikan payload kalau sah, `null` kalau tidak.
 * Kegagalan dicatat ke log server agar percobaan pemalsuan token meninggalkan
 * jejak (docs/ISSUES.md#hsm-023).
 */
export async function verifySession(
  token: string | undefined
): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    console.warn(
      "[auth] Verifikasi sesi gagal:",
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}

import { cookies } from "next/headers";

/**
 * Server action / Route Handler protector.
 * Throws an error if the user is not authenticated.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const user = await verifySession(token);
  
  if (!user) {
    throw new Error("Tidak terautentikasi.");
  }
  
  return user;
}
