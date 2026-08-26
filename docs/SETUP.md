# Panduan Setup

> Dari nol sampai aplikasi jalan. Diverifikasi 5 Agustus 2026.

> ⚠️ **Baca ini dulu.** `README.md` di root memuat **dua instruksi yang tidak
> akan berhasil** — `.env.example` tidak ada di git, dan `npx prisma db seed`
> tidak melakukan apa pun. Dokumen ini yang benar. Lihat
> [HSM-019](./ISSUES.md#hsm-019) dan [HSM-026](./ISSUES.md#hsm-026).

---

## 1. Prasyarat

| Kebutuhan | Versi | Cara cek |
|---|---|---|
| Node.js | ≥ 20 (Next 16 mensyaratkan ini) | `node -v` |
| npm | ikut Node | `npm -v` |
| Akses database PostgreSQL | Supabase | dari tim lead |
| Git | apa saja | `git --version` |

---

## 2. Install Dependensi

```bash
npm install
```

Tambahkan satu paket yang hilang dari `package.json` tapi diimpor oleh
`prisma.config.ts`:

```bash
npm install --save-dev dotenv
```

Tanpa ini, semua perintah Prisma bergantung pada `dotenv` yang kebetulan ada
sebagai dependensi transitif — berfungsi hari ini, tapi bisa hilang kapan saja.
([HSM-026](./ISSUES.md#hsm-026))

---

## 3. Environment Variables

Buat file `.env` di root proyek. **Jangan cari `.env.example`** — file itu ada di
disk sebagian developer tapi tidak pernah masuk ke git (`.gitignore` baris 34
memblokir `.env*`), jadi hasil clone bersih tidak akan memilikinya.

Isinya:

```bash
# ── Database (dari Supabase → Project Settings → Database) ────────────
# Runtime: lewat connection pooler
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=5"

# Migrasi & db push: koneksi langsung
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

# ── Auth (WAJIB — jangan dikosongkan) ─────────────────────────────────
JWT_SECRET="<48 byte acak, lihat cara buat di bawah>"

# ── Supabase (saat ini TIDAK dipakai kode mana pun — lihat HSM-012) ────
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

### Membuat `JWT_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**Ini bukan opsional.** Kalau `JWT_SECRET` kosong, seluruh aplikasi jatuh ke
string cadangan yang tertulis terang-terangan di dalam repo, dan siapa pun yang
pernah melihat kode ini bisa membuat cookie admin sendiri.
Lihat [HSM-002](./ISSUES.md#hsm-002).

### Catatan soal `connection_limit`

Nilai bawaan yang beredar di tim adalah `connection_limit=1`. **Angka itu
membuat `npm run build` gagal** — Next.js membangun banyak halaman secara paralel
dan semuanya berebut satu koneksi sampai timeout. Pakai `5` atau lebih.
Lihat [HSM-001](./ISSUES.md#hsm-001).

### Kenapa dua URL berbeda?

| Variabel | Port | Untuk apa |
|---|---|---|
| `DATABASE_URL` | `6543` | Query runtime — lewat pgbouncer, tahan banyak koneksi singkat |
| `DIRECT_URL` | `5432` | `db push` / `migrate` — pgbouncer tidak mendukung DDL |

Menukar keduanya menyebabkan error yang membingungkan ("prepared statement
already exists").

---

## 4. Siapkan Database

```bash
npx prisma generate    # buat TypeScript client — WAJIB, jangan dilewat
npx prisma db push     # sinkronkan skema ke database
```

`prisma generate` sering terlewat. Kalau dilewat, TypeScript memakai tipe basi
dan error yang muncul akan menyesatkan — misalnya field yang jelas-jelas ada di
skema dilaporkan tidak ada.

---

## 5. Isi Data Dummy (opsional)

> 🔴 **Seed menghapus data.** `prisma/seed.js` baris 11-14 menjalankan
> `deleteMany()` pada **semua** produk, subkategori, kategori, dan manufakturer
> sebelum mengisi ulang. **Jangan pernah menjalankannya di database produksi.**

`npx prisma db seed` — yang disebut di README — **tidak berfungsi**. Perintah itu
keluar dengan kode 0 tanpa melakukan apa pun, karena tidak ada konfigurasi seed
di `package.json` maupun `prisma.config.ts`. Kegagalannya senyap, jadi mudah
mengira database sudah terisi padahal kosong.

Jalankan langsung:

```bash
node prisma/seed.js
```

Ini membuat 8 manufakturer beserta kategori, subkategori, dan produk contohnya.

Agar `npx prisma db seed` benar-benar bekerja, tambahkan ke `package.json`:

```json
"prisma": { "seed": "node prisma/seed.js" }
```

---

## 6. Buat Akun Admin

```bash
node scripts/seed-admin.mjs
```

Skrip ini membuat akun dengan kredensial **hardcoded**:
`manager@hartindo.local` / `testing`.

> ❌ **Jangan pakai ini di produksi.** Edit skripnya agar mengambil dari
> environment variable lebih dulu. Lihat [HSM-006](./ISSUES.md#hsm-006).

> ❌ **Jangan jalankan `scripts/create-admin.mjs`.** Skrip itu membuat user di
> **Supabase Auth** — sistem yang tidak dipakai aplikasi ini sama sekali. User
> yang dihasilkan tidak akan pernah bisa login, dan penyebabnya sulit ditebak.
> Lihat [HSM-012](./ISSUES.md#hsm-012).

Tidak ada cara mereset password lewat UI. Untuk mengganti password, edit dan
jalankan ulang `seed-admin.mjs` (skrip ini memakai `upsert`, jadi aman diulang).

---

## 7. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000

Port dipakai proses lain? `npx next dev -p 3111`

### Verifikasi cepat bahwa semuanya jalan

| Cek | Diharapkan |
|---|---|
| Buka `/` | Landing page tampil, bagian katalog berisi kartu manufakturer |
| Buka `/admin` | Dialihkan ke `/login?redirectTo=%2Fadmin` |
| Login dengan akun admin | Masuk ke `/admin` |
| Katalog kosong | Seed belum jalan — lihat langkah 5 |

---

## 8. Perintah yang Sering Dipakai

```bash
npm run dev                  # dev server
npm run build                # build produksi (saat ini GAGAL — HSM-001)
npm run start                # jalankan hasil build (perlu build sukses dulu)
npm run lint                 # ESLint (saat ini 25 error — HSM-010)
npx tsc --noEmit             # typecheck (saat ini bersih)

npx prisma studio            # GUI database
npx prisma generate          # regenerate client setelah ubah skema
npx prisma db push           # sinkronkan skema
node prisma/seed.js          # isi data dummy (DESTRUKTIF)
node scripts/seed-admin.mjs  # buat/reset akun admin
```

### Menguji build dengan benar

```bash
npx next build > build.txt 2>&1; echo "EXIT=$?"
```

**Jangan** `npm run build 2>&1 | tail -60`. Exit code yang dilaporkan adalah milik
`tail`, bukan milik build — build yang gagal akan terlihat sukses. Kesalahan ini
pernah terjadi selama audit dan sempat menyembunyikan [HSM-001](./ISSUES.md#hsm-001).

---

## 9. Deploy ke Vercel

> ❌ **Belum siap deploy.** Build gagal ([HSM-001](./ISSUES.md#hsm-001)) dan ada
> tiga isu Kritis lain yang belum beres. Bagian ini untuk nanti.

Ketika sudah siap:

1. Set **semua** environment variable di Vercel → Project Settings →
   Environment Variables. Termasuk `JWT_SECRET` — kalau terlewat, produksi akan
   memakai secret cadangan yang publik.
2. Pastikan `connection_limit` di `DATABASE_URL` ≥ 5, atau build akan gagal di
   Vercel dengan cara yang sama seperti di lokal.
3. Build memerlukan **akses database yang hidup**, karena `generateStaticParams`
   melakukan query saat build. Database yang down = build gagal.
4. Setelah deploy pertama, ganti password admin default.
5. Ingat: perubahan data lewat panel admin **tidak** memperbarui halaman publik
   yang statis sampai ada deploy ulang. Lihat [HSM-009](./ISSUES.md#hsm-009).

---

## 10. Masalah Setup yang Umum

| Gejala | Kemungkinan penyebab |
|---|---|
| `PrismaClientInitializationError` | `.env` tidak ada atau `DATABASE_URL` salah |
| Tipe Prisma tidak dikenali TypeScript | Lupa `npx prisma generate` |
| Build gagal dengan `P2024` | `connection_limit=1` — [HSM-001](./ISSUES.md#hsm-001) |
| "Belum ada data manufakturer" | Seed belum jalan — pakai `node prisma/seed.js` |
| Login selalu gagal | Akun dibuat lewat `create-admin.mjs` (Supabase Auth) — pakai `seed-admin.mjs` |
| `npm run start` → ENOENT `prerender-manifest.json` | Build belum pernah sukses |
| `/admin` tidak diproteksi | `src/proxy.ts` dipindah/di-rename — harus di `src/proxy.ts` |

Daftar lengkap ada di [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
