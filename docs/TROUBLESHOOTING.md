# Troubleshooting

> Gejala → penyebab → berkas mana yang harus dibuka.
>
> Disusun berdasarkan cara masalah **muncul di layar**, bukan berdasarkan lapisan
> teknis — karena saat sesuatu rusak, yang kamu tahu cuma gejalanya.

---

## Daftar Isi

- [A. Build & Kompilasi](#a-build--kompilasi)
- [B. Database & Prisma](#b-database--prisma)
- [C. Autentikasi & Admin](#c-autentikasi--admin)
- [D. Data Tidak Muncul / Salah](#d-data-tidak-muncul--salah)
- [E. Tampilan & Styling](#e-tampilan--styling)
- [F. Server Action & Form](#f-server-action--form)
- [G. Kalau Semua Buntu](#g-kalau-semua-buntu)

---

## A. Build & Kompilasi

### `npm run build` gagal dengan `P2024` / "Timed out fetching a new connection"

```
Timed out fetching a new connection from the connection pool.
(Current connection pool timeout: 10, connection limit: 1)
Error occurred prerendering page "/katalog/5"
```

**Penyebab:** `connection_limit=1` di `DATABASE_URL`. Next.js membangun halaman
statis dengan banyak worker paralel; semuanya berebut satu koneksi.

**Buka:** `.env` → `DATABASE_URL`

**Perbaiki:** Naikkan ke `connection_limit=5` atau lebih.
Detail: [HSM-001](./ISSUES.md#hsm-001)

---

### Build terlihat sukses padahal gagal

Kalau kamu menjalankan `npm run build 2>&1 | tail -60`, exit code yang kamu lihat
adalah milik `tail` — **selalu 0**. Build yang gagal terlihat sukses.

**Cara benar:**
```bash
npx next build > build.txt 2>&1; echo "EXIT=$?"
```

Jebakan ini nyata: selama audit, satu build yang gagal sempat terlaporkan sukses
karenanya.

---

### `npm run start` → `ENOENT: .next/prerender-manifest.json`

Bukan bug tersendiri. Artinya `next build` belum pernah selesai dengan sukses.
Beresi build-nya dulu ([HSM-001](./ISSUES.md#hsm-001)), atau pakai `npm run dev`.

---

### TypeScript mengeluh field yang jelas ada di skema

**Penyebab:** Prisma Client belum di-regenerate setelah skema berubah.

**Perbaiki:**
```bash
npx prisma generate
```

Kalau masih bermasalah, restart TypeScript server di editor. Di VS Code:
`Ctrl+Shift+P` → "TypeScript: Restart TS Server".

---

### `npm run lint` memuntahkan puluhan error

Itu memang kondisi awalnya: 25 error + 4 warning, semuanya sudah ada sebelum
kamu menyentuh apa pun. Lihat [HSM-010](./ISSUES.md#hsm-010) untuk rinciannya.

Untuk mengetahui apakah **perubahanmu** menambah error baru, catat jumlahnya
sebelum dan sesudah:
```bash
npx eslint . 2>&1 | tail -3
```

---

## B. Database & Prisma

### `PrismaClientInitializationError` saat menjalankan apa pun

**Urutan pemeriksaan:**

1. Apakah `.env` ada di root proyek? (bukan di `src/`)
2. Apakah `DATABASE_URL` terisi dan tidak terpotong?
3. Apakah project Supabase-nya aktif? Project gratis di-pause setelah lama
   menganggur — cek dashboard Supabase.
4. Ada di jaringan yang memblokir port 6543/5432?

**Buka:** `.env`, lalu `src/lib/prisma.ts`

---

### "prepared statement already exists" saat `db push` atau `migrate`

**Penyebab:** Perintah migrasi memakai URL pooler (`:6543`) padahal butuh koneksi
langsung.

**Buka:** `.env` → pastikan `DIRECT_URL` memakai port `5432` **tanpa** `pgbouncer=true`,
dan `prisma/schema.prisma` datasource memang menunjuk `directUrl = env("DIRECT_URL")`.

---

### `npx prisma db seed` jalan tapi database tetap kosong

**Penyebab:** Tidak ada konfigurasi seed. Perintah itu keluar dengan kode 0 tanpa
melakukan apa pun — kegagalan yang benar-benar senyap.

**Perbaiki:**
```bash
node prisma/seed.js
```

⚠️ Perintah ini **menghapus seluruh data katalog** lebih dulu. Jangan di produksi.

Detail: [HSM-019](./ISSUES.md#hsm-019)

---

### Data hilang setelah menjalankan sesuatu

Kemungkinan besar salah satu dari dua ini:

| Yang dijalankan | Yang terjadi |
|---|---|
| `node prisma/seed.js` | Menghapus **semua** produk, subkategori, kategori, manufakturer, lalu isi ulang dengan data dummy |
| `npx prisma db push` dengan skema yang berubah destruktif | Prisma bisa men-drop kolom/tabel; peringatannya cuma sekilas di terminal |

Tidak ada soft delete dan tidak ada audit trail di sistem ini
([DATA_MODEL.md §4](./DATA_MODEL.md)). Pemulihan hanya lewat backup Supabase
(Dashboard → Database → Backups).

---

### Kategori ada di database tapi tidak muncul di mana pun

**Penyebab:** Kategori itu **yatim** — `manufacturerId`-nya `NULL`, kemungkinan
karena manufakturer induknya dihapus (`onDelete: SetNull`).

**Cek lewat Prisma Studio** atau SQL:
```sql
SELECT id, name FROM categories WHERE "manufacturerId" IS NULL;
```

**Perbaiki:** Tetapkan ulang ke manufakturer yang ada, atau hapus. Tidak bisa
lewat UI — harus lewat Studio/SQL.

Detail: [HSM-004](./ISSUES.md#hsm-004)

---

## C. Autentikasi & Admin

### Login selalu gagal padahal password benar

**Urutan pemeriksaan:**

1. **Akun dibuat lewat skrip yang salah?** `scripts/create-admin.mjs` membuat user
   di Supabase Auth — sistem yang tidak dipakai. Akun itu tidak akan pernah bisa
   login. Pakai `node scripts/seed-admin.mjs`.
   ([HSM-012](./ISSUES.md#hsm-012))
2. **Akun benar-benar ada?** `npx prisma studio` → tabel `admins`
3. **Password-nya hash bcrypt?** Kalau kolom `password` berisi teks biasa (hasil
   edit manual di Studio), `bcrypt.compare` akan selalu gagal.

**Buka:** `src/app/actions/auth.ts`, `scripts/seed-admin.mjs`

---

### Login sukses tapi langsung dilempar balik ke `/login`

**Penyebab:** Cookie terpasang tapi verifikasi JWT gagal — biasanya karena
`JWT_SECRET` berbeda antara saat token dibuat dan saat diverifikasi.

Ini paling sering terjadi setelah menambahkan `JWT_SECRET` ke `.env`: cookie lama
ditandatangani dengan secret cadangan, sementara sekarang diverifikasi dengan
secret baru.

**Perbaiki:** Hapus cookie `hsm_session` di browser, lalu login ulang.

**Buka:** `src/proxy.ts:4`, `src/app/actions/auth.ts:10`

---

### Sesi tiba-tiba habis

Token berlaku **2 jam** (`exp: "2h"` di `auth.ts`), sementara cookie punya
`maxAge` 7200 detik. Tidak ada refresh token dan tidak ada peringatan sebelum
kedaluwarsa — admin akan tiba-tiba terlempar ke halaman login, kemungkinan
sambil kehilangan isian form.

**Buka:** `src/app/actions/auth.ts:26-31`

---

### `/admin` bisa diakses tanpa login

🔴 **Ini gawat.** Proteksi admin bergantung sepenuhnya pada satu berkas.

**Urutan pemeriksaan:**

1. Apakah `src/proxy.ts` masih ada, dengan nama persis itu? Next.js 16 memakai
   `proxy.ts` (bukan `middleware.ts` seperti versi sebelumnya). File harus di
   `src/proxy.ts` atau `proxy.ts` di root — **tidak ada tempat lain yang bekerja**,
   dan memindahkannya tidak menghasilkan error apa pun.
2. Apakah fungsinya masih di-export dengan nama `proxy`?
3. Apakah `config.matcher` masih mencakup `/admin`?
4. Sudah restart dev server? Perubahan pada proxy butuh restart.

**Buka:** `src/proxy.ts`

**Verifikasi:**
```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/admin
# Diharapkan: 307 http://localhost:3000/login?redirectTo=%2Fadmin
```

Kalau hasilnya `200`, proteksi mati dan **seluruh CRUD terbuka untuk publik** —
karena server action tidak punya pemeriksaan auth sendiri
([HSM-003](./ISSUES.md#hsm-003)).

---

## D. Data Tidak Muncul / Salah

### Landing page bilang "Belum ada data manufakturer"

Database kosong. Jalankan `node prisma/seed.js` (dev saja), atau tambahkan lewat
`/admin/katalog`.

**Buka:** `src/app/components/Katalog.tsx:11-20`

---

### Produk ditambahkan lewat admin tapi tidak muncul di halaman publik

**Dua kemungkinan, cek berurutan:**

1. **`isActive` bernilai `false`.** Halaman publik hanya menampilkan produk aktif.
   Cek di `/admin/katalog/[categoryId]`.
2. **Halaman publik masih versi statis lama.** Server action hanya memanggil
   `revalidatePath("/admin/...")` — tidak pernah untuk path publik. Halaman
   katalog di-prerender saat build, jadi tidak ikut berubah.
   ([HSM-009](./ISSUES.md#hsm-009))

Yang kedua ini menyesatkan justru karena di panel admin perubahannya **terlihat
berhasil**.

**Solusi sementara:** restart dev server, atau deploy ulang di produksi.

---

### Jumlah produk di kartu kategori tidak cocok dengan isi halaman

Ini bug yang sudah diketahui, bukan salahmu. Penghitung memakai `_count.products`
tanpa filter `isActive`, sementara halaman detail memfilternya. Label "produk
aktif" itu hardcoded.

**Buka:** `src/app/katalog/[manufacturerId]/page.tsx:55-64` dan `:149`

Detail: [HSM-005](./ISSUES.md#hsm-005)

---

### Gambar produk rusak / ikon patah

Semua gambar adalah **URL eksternal** — tidak ada upload. Kalau host aslinya
mengubah atau menghapus gambarnya, tampilannya rusak dan tidak ada penanganan
`onError`, jadi tidak ada gambar cadangan.

**Cek:** buka `imageUrl`-nya langsung di tab baru. Kalau 404, URL-nya memang mati.

**Buka:** form admin (field URL gambar)

Detail: [HSM-016](./ISSUES.md#hsm-016)

---

### Subkategori sudah dibuat tapi tidak jadi tingkat navigasi di publik

Ini **memang perilakunya**, bukan bug. Halaman kategori publik menampilkan semua
produk dari semua subkategori sekaligus; subkategori hanya jadi label teks di
kartu produk.

Detail: [HSM-013](./ISSUES.md#hsm-013)

---

### Pesan dari form kontak tidak pernah sampai

Form kontak **tidak mengirim apa pun**. Ia menunggu 1,5 detik lalu menampilkan
pesan sukses. Tidak ada request, tidak ada penyimpanan ke database.

**Buka:** `src/app/components/Kontak.tsx:24-42`

Detail: [HSM-007](./ISSUES.md#hsm-007) — ini Kritis, karena setiap prospek
penjualan hilang tanpa jejak.

---

## E. Tampilan & Styling

### Halaman admin tidak ikut berubah saat tema diganti

Memang begitu. Admin dan login memakai CSS Modules dengan warna hardcoded,
tidak memakai variabel tema dari `variables.css`.

**Buka:** `src/app/admin/admin.module.css`, `src/app/login/login.module.css`

---

### Tema kembali ke default setiap refresh

Pilihan tema tidak disimpan ke mana pun — `ThemeSwitcher` hanya mengubah kelas
di `<html>` dalam memori.

**Buka:** `src/app/components/ThemeSwitcher.tsx`

Detail: [HSM-008](./ISSUES.md#hsm-008)

---

### Ada tombol "⚙️ Theme" melayang di situs produksi

Itu tombol dev yang dirender tanpa kondisi. Bungkus dengan
`process.env.NODE_ENV === "development"` atau hapus.

**Buka:** `src/app/page.tsx:163`

---

### Menu navigasi hilang di ponsel

Memang disembunyikan di bawah 768px, dan **tidak ada penggantinya** — belum ada
tombol hamburger.

**Buka:** `src/app/styles/navbar.css:109-113`

Detail: [HSM-022](./ISSUES.md#hsm-022)

---

### Mengubah CSS tapi tidak ada efeknya

**Urutan pemeriksaan:**

1. **File CSS-nya sudah di-import?** CSS global harus masuk rantai import di
   `src/app/globals.css`. File `.css` di `styles/` yang tidak di-import tidak akan
   pernah dimuat.
2. **Salah sistem?** Landing page pakai CSS global (BEM: `.hero__heading`).
   Admin/login/katalog pakai CSS Modules (`styles.someClass`). Menambah kelas
   global untuk komponen yang memakai Modules tidak akan berpengaruh.
3. **Mengedit berkas yang mati?** `src/app/components/katalog/` berisi 4 komponen
   yang tidak diimpor siapa pun. Mengeditnya tidak mengubah apa pun.
   ([HSM-011](./ISSUES.md#hsm-011))

---

## F. Server Action & Form

### Submit form tidak melakukan apa-apa, tanpa error

Server action di repo ini **`return` diam-diam** saat validasi gagal:

```ts
if (!name || !num) return;
```

Tidak ada error, tidak ada pesan, tidak ada log. Dari sisi pengguna, tombolnya
seperti tidak berfungsi.

**Urutan pemeriksaan:**

1. Semua field wajib terisi?
2. Setiap `<input>` punya atribut `name` yang **persis sama** dengan yang dibaca
   `formData.get("...")`? Salah ketik di sini menghasilkan kegagalan senyap yang
   sama.
3. Buka Network tab — request `POST` dengan header `Next-Action` terkirim?

**Buka:** `src/app/actions/katalog.ts`

---

### "Slug sudah digunakan oleh manufakturer lain"

Kolom `slug` unik dan wajib diisi — meski nilainya **tidak pernah dipakai** untuk
apa pun (URL memakai ID numerik). Isi saja dengan sesuatu yang unik.

Detail: [HSM-014](./ISSUES.md#hsm-014)

---

### Menghapus manufakturer tapi kategorinya masih ada

Perilaku database adalah `SetNull`, bukan cascade — meski dialog konfirmasi
menjanjikan sebaliknya. Kategorinya jadi yatim dan tidak terlihat di UI mana pun.

Lihat [bagian B](#kategori-ada-di-database-tapi-tidak-muncul-di-mana-pun) untuk
cara menemukannya, dan [HSM-004](./ISSUES.md#hsm-004) untuk detailnya.

---

### `useState`/`useEffect` error "only works in a Client Component"

Komponen itu Server Component (default). Tambahkan `"use client"` di baris
pertama — **tapi** setelah itu komponen tidak boleh lagi memanggil Prisma atau
membaca environment variable rahasia.

Pola yang dipakai repo ini: Server Component mengambil data, lalu meneruskannya
sebagai props ke Client Component. Contoh:
`katalog/[manufacturerId]/[categoryId]/page.tsx` → `CategoryProductsClient.tsx`

---

## G. Kalau Semua Buntu

Reset menyeluruh untuk lingkungan lokal:

```bash
rm -rf .next node_modules
npm install
npx prisma generate
npm run dev
```

Kalau masih rusak, pastikan dulu masalahnya bukan salah satu dari yang sudah
diketahui:

```bash
npx tsc --noEmit                             # harus bersih
grep -c "JWT_SECRET" .env                    # harus ≥ 1
grep -o "connection_limit=[0-9]*" .env       # harus ≥ 5
ls src/proxy.ts                              # harus ada
```

Lalu bandingkan gejalamu dengan [ISSUES.md](./ISSUES.md) — 26 masalah di sana
sudah terverifikasi, dan besar kemungkinan yang kamu alami adalah salah satunya.

**Menemukan sesuatu yang baru?** Tambahkan ke [ISSUES.md](./ISSUES.md) dengan
nomor `HSM-027` dan seterusnya, lalu tambahkan gejalanya ke dokumen ini. Aturan
lengkap ada di [AI_RULES.md](./AI_RULES.md).
