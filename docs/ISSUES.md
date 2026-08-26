# Daftar Bug & Ambiguitas

> Hasil audit penuh 5 Agustus 2026 — commit `d52ec54`, branch `feature/add-dummy-products`.
>
> Setiap temuan di bawah ini **sudah diverifikasi terhadap kode atau runtime**, bukan
> dugaan. Metode verifikasi dicantumkan agar bisa diuji ulang.

## Ringkasan

| Severity | Jumlah | Arti |
|---|---|---|
| 🔴 Kritis | 4 | Menghalangi deploy, atau merusak data / kepercayaan pengguna |
| 🟠 Tinggi | 7 | Salah perilaku yang terlihat pengguna |
| 🟡 Sedang | 8 | Membingungkan, rawan salah paham |
| 🔵 Rendah | 7 | Kebersihan kode & pemeliharaan |

**Total: 26 temuan.**

> **Status per 2026-08-06:** 14 dari 26 sudah ✅ SELESAI (semua yang tidak
> memerlukan keputusan produk/desain — lihat daftar lengkap di
> [CHANGELOG.md](./CHANGELOG.md)). HSM-013, 014, 015, 020 sengaja belum
> disentuh karena butuh keputusan. HSM-004, 007, 017, 018, 022, 024, 025 juga
> belum disentuh — masing-masing butuh keputusan bisnis/desain atau data
> asli yang tidak bisa diasumsikan.

### Urutan pengerjaan yang disarankan

1. **HSM-001** — build gagal (tanpa ini, tidak bisa deploy sama sekali)
2. **HSM-002** — `JWT_SECRET` tidak diset (siapa pun bisa memalsukan sesi admin)
3. **HSM-003** — server action tanpa cek auth
4. **HSM-004** — konfirmasi hapus yang berbohong
5. **HSM-007** — form kontak palsu
6. Sisanya sesuai prioritas bisnis

---

# 🔴 KRITIS

## HSM-001 ✅ SELESAI (2026-08-06)
### `npm run build` gagal — connection pool Prisma habis saat prerender

**Perbaikan diterapkan:** `connection_limit` di `DATABASE_URL` dinaikkan dari
`1` ke `5`. Diverifikasi lewat `npx next build > out.txt 2>&1; echo "EXIT=$?"`
→ exit 0, seluruh halaman katalog ter-prerender tanpa timeout.

**Berkas:** `.env` (`DATABASE_URL`), `src/app/katalog/[manufacturerId]/page.tsx:23-30`

**Verifikasi:** Menjalankan `npx next build` → **exit code 1**.

```
prisma:error
Invalid `prisma.manufacturer.findUnique()` invocation:
Timed out fetching a new connection from the connection pool.
(Current connection pool timeout: 10, connection limit: 1)
Error occurred prerendering page "/katalog/5"
Export encountered an error on /katalog/[manufacturerId]/page: /katalog/5, exiting the build.
⨯ Next.js build worker exited with code: 1
```

**Penyebab:** `DATABASE_URL` mengandung `connection_limit=1`. Next.js membangun
halaman statis dengan **11 worker paralel**, dan `generateStaticParams` menghasilkan
8 halaman manufakturer + 8 halaman kategori. Semua worker berebut satu koneksi
tunggal, lalu timeout setelah 10 detik.

**Kenapa mudah terlewat:** `npm run dev` jalan normal, karena dev merender satu
halaman pada satu waktu. Kegagalan hanya muncul saat build produksi.

> ⚠️ **Catatan penting soal cara menguji.** Menjalankan `npm run build 2>&1 | tail -60`
> akan menampilkan **exit code milik `tail`, bukan milik build**, sehingga build yang
> gagal terlihat seolah sukses. Selalu periksa dengan
> `npx next build > out.txt 2>&1; echo "EXIT=$?"`.

**Perbaikan:** Naikkan batas koneksi di `DATABASE_URL` (mis. `connection_limit=5`),
atau jadikan halaman katalog render dinamis dengan menghapus `generateStaticParams`.

---

## HSM-002 ✅ SELESAI (2026-08-06)
### `JWT_SECRET` tidak diset — sesi admin bisa dipalsukan siapa pun

**Perbaikan diterapkan:** `JWT_SECRET` diset di `.env`, dan sumber tunggalnya
dipindah ke `src/lib/auth.ts` (`getSecret()`) yang melempar error saat startup
kalau variabelnya kosong — tidak ada nilai cadangan lagi di berkas mana pun.

**Berkas:** `src/proxy.ts:4-6`, `src/app/actions/auth.ts:10-12`,
`src/app/admin/layout.tsx:6-8`, `src/app/admin/page.tsx:6-8`,
`src/app/admin/components/AdminHeader.tsx:6-8`

**Verifikasi:** `.env` hanya berisi `DATABASE_URL`, `DIRECT_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. **Tidak ada `JWT_SECRET`.** Tidak ada juga di
`.env.example`.

Artinya kelima berkas di atas semuanya jatuh ke nilai cadangan yang sama:

```ts
process.env.JWT_SECRET || "fallback-secret-for-hsm-company-profile-auth-12345"
```

**Dampak:** String cadangan itu ada di repositori dalam bentuk teks biasa. Siapa
pun yang bisa membaca kode ini dapat menandatangani JWT-nya sendiri, memasangnya
sebagai cookie `hsm_session`, dan **masuk sebagai admin tanpa perlu password**.
Proxy akan menerimanya karena tanda tangannya sah.

Ini bukan risiko teoretis — nilainya sudah diketahui, tinggal dipakai.

**Perbaikan:**
1. Buat secret acak: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
2. Tambahkan `JWT_SECRET=...` ke `.env` dan ke environment variable Vercel
3. Tambahkan `JWT_SECRET=` ke `.env.example`
4. **Hapus seluruh nilai cadangan** — ganti dengan gagal-cepat:
   ```ts
   const secret = process.env.JWT_SECRET;
   if (!secret) throw new Error("JWT_SECRET wajib diset");
   ```
   Aplikasi yang menolak menyala jauh lebih baik daripada aplikasi yang menyala
   tanpa keamanan.

---

## HSM-003 ✅ SELESAI (2026-08-06)
### Server action CRUD tidak memeriksa autentikasi sama sekali

**Perbaikan diterapkan:** `requireAdmin()` ditambahkan di `src/app/actions/katalog.ts`
dan dipanggil sebagai baris pertama di seluruh 15 action, sehingga tidak lagi
bergantung semata pada `src/proxy.ts`.

**Berkas:** `src/app/actions/katalog.ts` — seluruh 15 fungsi

**Verifikasi:** Grep untuk `jwtVerify`, `cookies()`, `hsm_session` di
`src/app/actions/katalog.ts` → **nol hasil**. Sementara
`.next/server/server-reference-manifest.json` mendaftarkan 15 action, masing-masing
dengan ID publik:

```
40d22c45f12e04f2ff89a0905ca3ecfb892a2f961f  createManufacturer
40d7398646afcbe2e9e296a04dd5ff8a4294e34878  deleteManufacturer
404a736843817a9a996c6427222d2992a16a79395a  deleteProduct
...
```

**Situasi saat ini:** Pengujian runtime menunjukkan `POST /admin/katalog` tanpa
cookie tetap ditolak (`307 → /login`), karena `src/proxy.ts` mencegat lebih dulu.
Jadi celah ini **belum bisa dieksploitasi hari ini**.

**Kenapa tetap Kritis:** seluruh keamanan CRUD bergantung pada satu berkas tunggal.
Kalau `src/proxy.ts` dipindah, di-rename, atau `matcher`-nya diubah — misalnya
seseorang menambahkan pengecualian route — maka semua operasi hapus/ubah data
langsung terbuka untuk publik, **tanpa error dan tanpa peringatan apa pun**.

Ini persis jenis kegagalan yang tidak ketahuan sampai sudah terlambat.

**Perbaikan:** Tambahkan penjaga di setiap action:

```ts
async function requireAdmin() {
  const token = (await cookies()).get("hsm_session")?.value;
  if (!token) throw new Error("Tidak terautentikasi");
  try {
    return (await jwtVerify(token, JWT_SECRET)).payload;
  } catch {
    throw new Error("Sesi tidak valid");
  }
}
```

Panggil di baris pertama tiap fungsi CRUD. Pertahanan berlapis: proxy sebagai
lapis pertama, action sebagai lapis terakhir.

---

## HSM-004
### Dialog konfirmasi hapus manufakturer menyatakan hal yang salah

**Berkas:** `src/app/admin/katalog/page.tsx:152`, `prisma/schema.prisma:39`

**Verifikasi:** Skema mendefinisikan `onDelete: SetNull` untuk relasi
Category → Manufacturer. Tapi UI memberi tahu admin:

> "Hapus manufakturer **X**? Semua kategori, subkategori, dan produk di dalamnya
> akan ikut terhapus."

**Yang sebenarnya terjadi:** kategori-kategori itu **tidak terhapus**. Kolom
`manufacturerId`-nya diubah jadi `NULL`, dan mereka menjadi **data yatim** —
masih ada di database, produknya masih utuh, tapi:

- Tidak muncul di halaman admin mana pun (semua query memfilter `manufacturerId`)
- Tidak muncul di halaman publik mana pun
- Tidak bisa diedit maupun dihapus lewat UI
- Diam-diam menumpuk seiring waktu

**Dampak:** Admin mengira sudah membersihkan data, padahal justru menciptakan data
tersembunyi yang tidak bisa dijangkau. Kalau ini terjadi berulang kali, database
terisi sampah tak terlihat, dan **satu-satunya cara memulihkannya adalah akses SQL
langsung**.

**Perbaikan** — pilih salah satu, jangan setengah-setengah:

- **(a)** Ubah skema ke `onDelete: Cascade` agar sesuai janji UI. Paling sederhana,
  tapi penghapusan jadi lebih destruktif — pastikan itu memang yang diinginkan.
- **(b)** Perbaiki teks konfirmasinya agar jujur, dan buat halaman admin untuk
  mengelola kategori yatim.
- **(c)** Tolak penghapusan selama masih ada kategori, dan minta admin
  memindahkan atau menghapusnya lebih dulu. Paling aman.

Apa pun yang dipilih, catat keputusannya di [DATA_MODEL.md](./DATA_MODEL.md).

---

# 🟠 TINGGI

## HSM-005 ✅ SELESAI (2026-08-06)
### Penghitung "produk aktif" menghitung produk nonaktif juga

**Perbaikan diterapkan:** Filter `isActive: true` ditambahkan pada `_count`
di `src/app/katalog/[manufacturerId]/page.tsx`, persis seperti saran perbaikan.

**Berkas:** `src/app/katalog/[manufacturerId]/page.tsx:55-64` dan `:149`

**Verifikasi:** Penghitung dibangun dari `sub._count.products` — **tanpa filter
`isActive`**. Sementara halaman detail (`[categoryId]/page.tsx:60-63`) memfilter
`isActive: true`. Label di UI berbunyi `{cat.productCount} produk aktif`.

**Dampak:** Kategori bisa menampilkan "12 produk aktif", lalu saat dibuka hanya
ada 5. Kata "aktif" membuat ini bukan sekadar angka meleset, tapi klaim yang
salah. Setiap kali admin menonaktifkan produk, ketidakcocokan ini bertambah.

**Perbaikan:** Filter penghitungnya:
```ts
_count: { select: { products: { where: { isActive: true } } } }
```

---

## HSM-006 ✅ SELESAI (2026-08-06)
### Kredensial admin default lemah dan ada di repositori

**Perbaikan diterapkan:** `scripts/seed-admin.mjs` sekarang membaca
`ADMIN_EMAIL`/`ADMIN_PASSWORD` dari environment dan menolak berjalan kalau
kosong. `scripts/create-admin.mjs` (jalur Supabase Auth yang mati) dihapus —
lihat [HSM-012](#hsm-012).

**Berkas:** `scripts/seed-admin.mjs:7-8`, `scripts/create-admin.mjs:28-31`

**Verifikasi:** Keduanya berisi hardcoded:
```js
const email = "manager@hartindo.local";
const plainPassword = "testing";
```

**Dampak:** Password `testing` bisa ditebak dalam hitungan detik. Kalau akun ini
ikut terbawa ke produksi — dan tidak ada apa pun yang mencegahnya — panel admin
praktis terbuka. Digabung dengan [HSM-002](#hsm-002), ada dua jalan masuk sekaligus.

**Perbaikan:** Ambil dari environment variable, dan tolak berjalan kalau kosong:
```js
const email = process.env.ADMIN_EMAIL;
const plainPassword = process.env.ADMIN_PASSWORD;
if (!email || !plainPassword) {
  console.error("Set ADMIN_EMAIL dan ADMIN_PASSWORD dulu.");
  process.exit(1);
}
```
Lalu ganti password akun yang sudah terlanjur dibuat.

---

## HSM-007
### Form kontak memalsukan pengiriman — semua pesan hilang

**Berkas:** `src/app/components/Kontak.tsx:24-42`

**Verifikasi:**
```ts
// Simulasi pengiriman data form (API Call)
try {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  setStatus("success");
```

Tidak ada `fetch`, tidak ada server action, tidak ada penulisan ke database.
Model `ContactMessage` ada di skema tapi grep ke seluruh `src/`, `scripts/`, dan
`prisma/seed.js` menghasilkan **nol** referensi.

**Dampak:** Setiap calon pembeli yang mengisi formulir akan melihat:

> "Pesan Anda berhasil terkirim. Tim kami akan segera menghubungi Anda kembali."

Padahal tidak ada yang terkirim ke mana pun. Untuk distributor alat medis yang
melayani rumah sakit, ini bukan bug kecil — ini kehilangan prospek penjualan
secara diam-diam, ditambah janji yang tidak ditepati.

**Perbaikan (jangka pendek, hari ini juga):** Nonaktifkan formulirnya, atau ganti
jadi tautan `mailto:` / WhatsApp yang benar-benar berfungsi. Lebih baik tidak ada
formulir daripada formulir yang berbohong.

**Perbaikan (sebenarnya):** Buat server action yang menulis ke `ContactMessage`,
tambahkan halaman admin untuk membacanya, dan idealnya notifikasi email.
Pertimbangkan juga rate limiting — form publik tanpa pembatasan akan jadi sasaran spam.

---

## HSM-008 ✅ SELESAI (2026-08-06)
### Tombol pengganti tema developer tampil di situs produksi

**Perbaikan diterapkan:** Dibungkus `{process.env.NODE_ENV === "development" && <ThemeSwitcher />}`
di `src/app/page.tsx`, sesuai opsi pertama di saran perbaikan.

**Berkas:** `src/app/components/ThemeSwitcher.tsx`, dipasang di `src/app/page.tsx:163`

**Verifikasi:** Dirender tanpa kondisi apa pun. Gayanya: `position: fixed`,
`bottom: 24px`, `right: 24px`, `zIndex: 99999`, dengan label `⚙️ Theme: Light Green`.
Komentar di `page.tsx` sendiri menyebutnya "Dev Theme Switcher Button".

**Dampak:** Pengunjung — termasuk calon klien rumah sakit — melihat tombol debug
melayang di atas segalanya. Terlihat belum jadi.

Ada masalah kedua: tema yang dipilih **tidak disimpan**. Refresh halaman
mengembalikannya ke default, jadi bahkan sebagai fitur pun ia tidak utuh.
Dan karena admin/login memakai CSS Modules dengan warna hardcoded, tema tidak
berpengaruh di sana.

**Perbaikan:** Bungkus dengan `{process.env.NODE_ENV === "development" && <ThemeSwitcher />}`,
atau hapus. Kalau tema memang mau jadi fitur nyata, simpan ke `localStorage` dan
terapkan sebelum paint pertama untuk menghindari kedipan.

---

## HSM-009 ✅ SELESAI (2026-08-06)
### Halaman statis tidak diperbarui setelah admin mengubah data

**Perbaikan diterapkan:** Semua 15 action di `src/app/actions/katalog.ts` sekarang
juga memanggil `revalidatePath` ke path publik yang relevan (`/`, `/katalog/[mfrId]`,
`/katalog/[mfrId]/[catId]`), bukan hanya path admin.

**Berkas:** `src/app/actions/katalog.ts` (semua `revalidatePath`),
`src/app/katalog/**/page.tsx` (`generateStaticParams`)

**Verifikasi:** Kedua halaman katalog publik memakai `generateStaticParams`,
sehingga di-prerender saat build. Tapi setiap `revalidatePath` di
`actions/katalog.ts` hanya menunjuk ke path **admin**:

```ts
revalidatePath("/admin/katalog");
revalidatePath(`/admin/katalog/${categoryId}`);
```

Tidak ada satu pun yang menyebut `/`, `/katalog/[manufacturerId]`, atau
`/katalog/[mfrId]/[catId]`.

**Dampak:** Admin menambah produk, melihatnya muncul di panel admin, dan mengira
selesai. Tapi halaman publik masih menampilkan versi lama hasil build. Perubahan
baru terlihat setelah deploy ulang.

Ini menyesatkan justru karena admin **melihat bukti** perubahannya berhasil.

**Perbaikan:** Tambahkan revalidasi untuk path publik di setiap action:
```ts
revalidatePath("/");
revalidatePath(`/katalog/${manufacturerId}`);
revalidatePath(`/katalog/${manufacturerId}/${categoryId}`);
```
Perhatikan bahwa beberapa action saat ini tidak punya `manufacturerId` di
`FormData`-nya — perlu ditambahkan.

---

## HSM-010 ✅ SELESAI (2026-08-06)
### Lint gagal: 25 error, 4 warning

**Perbaikan diterapkan:** `npx eslint .` sekarang bersih (0 error, 0 warning).
`any` di `actions/katalog.ts` hilang karena action diketik ulang jadi `Promise<void>`;
seluruh `<a>` navigasi internal diganti `<Link>`; `loginTime` yang tidak dipakai
di `admin/page.tsx` dihapus.

**Verifikasi:** `npx eslint .` → `✖ 29 problems (25 errors, 4 warnings)`

Rinciannya:

| Aturan | Jumlah | Lokasi |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 16 | `actions/katalog.ts` (15), `DeleteConfirmButton.tsx` (1) |
| `@next/next/no-html-link-for-pages` | 8 | admin & katalog & login |
| `@typescript-eslint/no-require-imports` | 1 | `prisma/seed.js:1` |
| `no-unused-vars` (warning) | 4 | `proxy.ts:16`, `admin/layout.tsx:27`, `admin/page.tsx:24,30` |

**Dampak:** Karena lint sudah merah sejak awal, error **baru** akan tenggelam di
antara yang lama dan tidak ada yang menyadarinya. Lint yang selalu gagal sama
saja dengan tidak ada lint.

Yang `no-html-link-for-pages` juga punya efek nyata: `<a href>` menyebabkan
full page reload, bukan navigasi client-side, sehingga terasa lebih lambat.

`loginTime` di `admin/page.tsx:30` dihitung lengkap dengan format lokal Indonesia
lalu tidak pernah dipakai — kemungkinan sisa fitur yang belum selesai.

**Perbaikan:** Ganti `Promise<any>` dengan tipe hasil yang benar
(`Promise<{ error: string } | void>`), ganti `err: any` dengan `err: unknown` +
penyempitan tipe, ganti `<a>` internal dengan `<Link>` dari `next/link`, ubah
`seed.js` ke ESM atau kecualikan dari lint.

---

## HSM-011 ✅ SELESAI (2026-08-06)
### Empat berkas komponen katalog sepenuhnya mati

**Perbaikan diterapkan:** Keempat berkas dihapus (dengan konfirmasi pengguna
lebih dulu, karena berkas sudah ada sebelum sesi ini) setelah diverifikasi
ulang lewat grep bahwa tidak ada importer sama sekali. Direktori
`src/app/components/katalog/` yang kosong ikut dihapus.

**Berkas:** `src/app/components/katalog/` — `CatalogCard.tsx`, `SubCategoryDrawer.tsx`,
`data.ts`, `types.ts`

**Verifikasi:** Grep untuk `CatalogCard`, `SubCategoryDrawer`, `CATEGORIES_DATA`,
`katalog/types`, `katalog/data` di seluruh `src/` → hanya menemukan definisinya
sendiri. **Nol tempat yang mengimpor.**

`data.ts` berisi data placeholder "Kategori 1", "Sub Kategori 1", dan seterusnya.

**Dampak:** Ini jebakan bagi siapa pun yang baru masuk. Seseorang bisa menghabiskan
waktu memperbaiki `CatalogCard.tsx` dan bingung kenapa tidak ada yang berubah di
browser. `SubCategoryDrawer.tsx` bahkan punya logika yang meng-hardcode ID kategori
2 dan 4 — peninggalan desain lama yang sudah tidak relevan.

**Perbaikan:** Hapus keempatnya. Riwayat git menyimpannya kalau suatu saat
dibutuhkan lagi.

---

# 🟡 SEDANG

## HSM-012 ✅ SELESAI (2026-08-06)
### Berkas helper Supabase tidak terpakai — membingungkan soal auth mana yang aktif

**Perbaikan diterapkan:** `src/lib/supabase/` (2 berkas) dan
`scripts/create-admin.mjs` dihapus (dengan konfirmasi pengguna lebih dulu).
`@supabase/ssr` dan `@supabase/supabase-js` dicopot dari `package.json`.
Penanganan error khas Supabase di `login/page.tsx` disederhanakan jadi
pass-through langsung dari `login()`.

**Berkas:** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`,
`scripts/create-admin.mjs`

**Verifikasi:** Grep `supabase` di `src/` hanya menemukan kedua berkas itu sendiri.
Tidak ada yang mengimpornya. Autentikasi nyata memakai JWT kustom di `actions/auth.ts`.

**Dampak:** Repo ini terlihat seperti memakai Supabase Auth padahal tidak.
Yang paling berbahaya adalah `scripts/create-admin.mjs`, yang membuat user di
**Supabase Auth** — sistem yang tidak dipakai. Menjalankannya menghasilkan user
yang **tidak akan pernah bisa login**, dan penyebabnya sulit ditebak.

Menambah kebingungan: `login/page.tsx:20-25` menangani pesan error khas Supabase
("invalid login credentials", "email not confirmed", "too many requests") yang
tidak akan pernah dihasilkan oleh `actions/auth.ts`.

**Perbaikan:** Hapus `src/lib/supabase/`, hapus `scripts/create-admin.mjs`, dan
copot `@supabase/ssr` + `@supabase/supabase-js` dari `package.json`. Bersihkan juga
penanganan error Supabase di halaman login. Kalau Supabase Auth memang direncanakan
untuk nanti, catat rencananya — jangan tinggalkan kodenya menggantung.

---

## HSM-013
### SubCategory tidak pernah jadi tingkat navigasi publik

**Berkas:** `src/app/katalog/[manufacturerId]/[categoryId]/page.tsx:59-70`

**Verifikasi:** Halaman kategori mengambil **semua** produk di bawah kategori
tersebut dari seluruh subkategori sekaligus, tanpa pengelompokan maupun filter.
SubCategory hanya muncul sebagai label teks di kartu produk.

**Dampak:** Ada ketidakcocokan konseptual. Admin dengan susah payah menata produk
ke dalam subkategori, lalu di sisi publik struktur itu menguap. Kategori dengan
200 produk menghasilkan satu grid raksasa tanpa cara menyaring.

Ini mungkin memang keputusan desain yang disengaja — tapi tidak tertulis di mana
pun, sehingga mudah dilaporkan sebagai bug.

**Perbaikan:** Putuskan dan tulis keputusannya. Kalau subkategori memang penting,
tambahkan filter atau pengelompokan di halaman kategori. Kalau tidak penting,
pertimbangkan menyederhanakan admin agar tidak memaksa admin membuat tingkat
yang tidak berguna.

---

## HSM-014
### Kolom `slug` diwajibkan dan unik, tapi tidak pernah dibaca

**Berkas:** `prisma/schema.prisma:22`, `src/app/admin/katalog/page.tsx:103`

**Verifikasi:** URL memakai ID numerik (`/katalog/5`), bukan slug. Grep `slug` di
`src/` hanya menemukan operasi tulis di form admin dan server action. **Tidak ada
yang membacanya untuk routing atau tampilan.**

**Dampak:** Admin wajib mengisi field ini, bisa ditolak dengan pesan "Slug sudah
digunakan oleh manufakturer lain", tapi nilainya tidak berpengaruh sama sekali.
Kerja sia-sia yang membingungkan — dan bikin admin ragu apakah dia salah isi.

**Perbaikan:** Pakai slug di URL (`/katalog/marthys` lebih baik untuk SEO dan
lebih mudah dibaca manusia), atau hapus field-nya. Yang sekarang adalah pilihan
terburuk: biaya tanpa manfaat.

---

## HSM-015
### Field `num` tidak divalidasi formatnya

**Berkas:** `prisma/schema.prisma:34,48`, form admin

**Verifikasi:** Bertipe `String` polos tanpa constraint. Seed memakai `"[ 01 ]"`
untuk kategori dan `"01.A"` untuk subkategori, tapi form menerima teks apa pun.

**Dampak:** Nomor tampilan bisa jadi campur aduk — `"[ 01 ]"`, `"1"`, `"01"`,
`"satu"` — dan karena `num` ditampilkan mentah di halaman publik, katalog terlihat
tidak konsisten. Ini juga menyulitkan pengurutan yang benar nantinya.

**Perbaikan:** Tambahkan `pattern` di input HTML plus validasi di server action,
atau buat nomornya otomatis dari urutan.

---

## HSM-016 🟡 SEBAGIAN SELESAI (2026-08-06)
### Gambar disimpan sebagai URL eksternal tanpa validasi

**Perbaikan minimal diterapkan:** Komponen `src/app/components/SafeImage.tsx`
dibuat — `<img>` dengan `onError` yang jatuh ke fallback masing-masing lokasi
pemanggilnya. Dipasang di seluruh titik render gambar eksternal (admin katalog,
halaman katalog publik, komponen produk, lightbox, kartu manufakturer landing
page).

**Belum dikerjakan (butuh keputusan):** migrasi ke Supabase Storage /
`next/image` + `remotePatterns` — ini pilihan hosting/arsitektur, bukan
perbaikan mekanis, jadi sengaja tidak disentuh di sesi ini.

**Berkas:** `prisma/schema.prisma` (`logoUrl`, `imageUrl`), semua form admin

**Verifikasi:** Tidak ada mekanisme upload di mana pun. Seed memakai URL ke
`placehold.co` dan `marthysorthopaedic.com`. Semua dirender dengan `<img>` biasa
plus `eslint-disable` untuk `@next/next/no-img-element`.

**Dampak:**
- Kalau host eksternal mengubah atau menghapus gambar, katalog HSM rusak, dan
  tidak ada yang tahu sampai ada pengunjung yang membukanya
- Tidak ada penanganan `onError`, jadi gambar rusak muncul sebagai ikon patah
- Melewatkan optimasi `next/image` — gambar besar dimuat apa adanya, memperlambat
  halaman
- Tidak ada validasi bahwa URL benar-benar menunjuk ke gambar

**Perbaikan:** Idealnya, pakai Supabase Storage untuk meng-host gambar sendiri.
Minimal, tambahkan handler `onError` dengan gambar cadangan, dan konfigurasikan
`remotePatterns` di `next.config.ts` agar bisa memakai `next/image`.

---

## HSM-017
### Tidak ada riwayat migrasi database

**Berkas:** `prisma.config.ts:9-11` menunjuk ke `prisma/migrations`, tapi direktori
itu **tidak ada**.

**Verifikasi:** `git ls-files` tidak menampilkan berkas migrasi apa pun. README
menginstruksikan `npx prisma db push`, yang memang tidak membuat migrasi.

**Dampak:** Tidak ada catatan bagaimana skema berevolusi, tidak ada cara memutar
balik perubahan, dan tidak ada jalur yang aman untuk mengubah skema produksi.
`db push` bisa **menghapus data** kalau perubahannya destruktif, dan ia hanya
memberi peringatan singkat di terminal.

**Perbaikan:** Beralih ke `npx prisma migrate dev` untuk pengembangan dan
`npx prisma migrate deploy` untuk produksi. Untuk memulai dari kondisi sekarang,
buat baseline dengan `prisma migrate diff`.

---

## HSM-018
### Tidak ada tes sama sekali

**Verifikasi:** `package.json` tidak punya script `test`, tidak ada dependensi
testing framework, tidak ada berkas `*.test.*` atau `*.spec.*` di seluruh repo.

**Dampak:** Setiap perubahan diverifikasi manual. Tidak ada jaring pengaman
terhadap regresi. Bug seperti [HSM-005](#hsm-005) (penghitung salah) adalah
persis jenis yang akan ketahuan oleh satu tes sederhana.

**Perbaikan:** Mulai dari yang paling berisiko, jangan mengejar cakupan penuh:
1. Alur autentikasi (login sukses, login gagal, sesi kedaluwarsa)
2. Server action CRUD (validasi, penanganan error)
3. Perilaku cascade penghapusan
4. Ketepatan penghitung produk

Vitest cocok untuk proyek Next.js seukuran ini.

---

## HSM-019 ✅ SELESAI (2026-08-06)
### README menjanjikan `npx prisma db seed` yang tidak berfungsi

**Perbaikan diterapkan:** Blok `"prisma": { "seed": "node prisma/seed.js" }`
ditambahkan ke `package.json`. `npx prisma db seed` sekarang benar-benar
menjalankan `prisma/seed.js`.

**Berkas:** `README.md:27-30`, `package.json`, `prisma.config.ts`

**Verifikasi:** README menyatakan seed bisa dijalankan dengan `npx prisma db seed`.
Tapi:
- `package.json` **tidak punya** blok `"prisma": { "seed": "..." }`
- `prisma.config.ts` tidak punya kunci `seed` (sudah diperiksa di
  `node_modules/prisma/config.d.ts` → tidak ada)
- Menjalankan `npx prisma db seed` → keluar dengan kode 0 **tanpa melakukan apa pun**

Kegagalan senyap: pengguna baru mengira database sudah terisi, padahal kosong,
lalu bingung kenapa situsnya menampilkan "Belum ada data manufakturer".

Ada juga masalah kedua: `prisma/seed.js` **menghapus seluruh data katalog** di
baris 11-14 sebelum mengisi ulang. Menjalankannya di database yang sudah berisi
data asli akan menghapus semuanya. README tidak memperingatkan hal ini.

**Perbaikan:** Tambahkan ke `package.json`:
```json
"prisma": { "seed": "node prisma/seed.js" }
```
Dan tambahkan peringatan mencolok di README bahwa seed bersifat destruktif.

---

# 🔵 RENDAH

## HSM-020
### `kodeBarang` tidak unik

**Berkas:** `prisma/schema.prisma:63`

Dua produk berbeda bisa punya kode barang yang sama. Untuk distributor alat medis,
kode barang duplikat bisa berujung pada kesalahan pemesanan. Pertimbangkan
`@unique` — tapi periksa dulu data yang ada, karena menambahkannya akan gagal
kalau sudah ada duplikat.

---

## HSM-021 ✅ SELESAI (2026-08-06)
### Metadata SEO memuat klaim yang tidak didukung

**Perbaikan diterapkan:** Kalimat "Telah melayani lebih dari 133K+ produk
terjual dan 2800+ pesanan terselesaikan." dihapus dari `metadata.description`
di `src/app/layout.tsx`, karena angkanya tidak didukung apa pun di situs.

**Berkas:** `src/app/layout.tsx:13-15`

Deskripsi meta berbunyi: *"Telah melayani lebih dari 133K+ produk terjual dan
2800+ pesanan terselesaikan."*

Angka-angka ini tidak muncul di mana pun di situs. Bagian hero dulunya menampilkan
statistik, tapi sudah diganti menjadi proposisi nilai ("Terpercaya", "Cepat Tanggap",
"Mutu Premium") — komentar di `page.tsx:64` mengonfirmasi ini.

Untuk perusahaan alat kesehatan, klaim numerik yang tidak dapat diverifikasi di
metadata pencarian adalah risiko kredibilitas. Hapus atau ganti dengan yang bisa
dibuktikan.

---

## HSM-022
### Tidak ada menu navigasi di layar kecil

**Berkas:** `src/app/styles/navbar.css:109-113`

```css
@media (max-width: 768px) {
  .navbar__nav { display: none; }
}
```

Menu disembunyikan di bawah 768px **tanpa pengganti** — tidak ada tombol hamburger,
tidak ada drawer. Pengguna ponsel kehilangan akses ke Beranda, Tentang Kami,
Katalog, dan Kontak. Yang tersisa hanya logo dan tombol Login Admin.

Karena banyak dokter dan staf rumah sakit membuka situs dari ponsel, ini lebih
berdampak daripada kelihatannya. Mereka masih bisa scroll, tapi tidak bisa
melompat antar bagian.

---

## HSM-023 ✅ SELESAI (2026-08-06)
### Blok `catch` kosong menelan error diam-diam

**Perbaikan diterapkan:** Verifikasi JWT dipusatkan ke `verifySession()` di
`src/lib/auth.ts`, yang mencatat kegagalan lewat `console.warn` sebelum
mengembalikan `null`. Keempat pemanggil (`proxy.ts`, `admin/layout.tsx`,
`admin/page.tsx`, `AdminHeader.tsx`) memakai fungsi ini, jadi tidak ada lagi
blok `catch` kosong yang menelan error.

**Berkas:** `src/proxy.ts:16-18`, `src/app/admin/layout.tsx:27-29`,
`src/app/admin/page.tsx:24-26`, `src/app/admin/components/AdminHeader.tsx:27-29`

Keempatnya menangkap kegagalan verifikasi JWT lalu tidak melakukan apa-apa.
Tiga di antaranya bahkan mengikat variabel `e` yang tidak dipakai (muncul sebagai
warning lint).

Dampaknya: sesi kedaluwarsa dan token yang dirusak menghasilkan perilaku yang
sama persis, dan tidak ada jejak di log kalau ada yang mencoba memalsukan token.
Minimal catat penyebabnya di sisi server.

---

## HSM-024
### Data kontak berisi placeholder

**Berkas:** `src/app/components/Kontak.tsx:112`

Nomor telepon tertulis `+62 (411) 894-XXXX` — dengan `XXXX` yang jelas placeholder,
tampil di halaman produksi.

Alamat (`Jl. Jenderal Sudirman No. 120`), email, dan koordinat peta juga perlu
dipastikan keasliannya. Peta saat ini menunjuk ke **pusat kota Makassar secara
umum**, bukan ke alamat kantor.

Untuk halaman kontak perusahaan, detail palsu langsung merusak kepercayaan.

---

## HSM-025
### Data dummy tidak profesional masih ada di seed

**Berkas:** `prisma/seed.js:28`

Deskripsi manufakturer Mario Orthopedics berbunyi:
*"Manufakturer alat ortopedi terbaik di ambon kiri"*

"Ambon kiri" bukan lokasi yang nyata — ini jelas teks bercanda. Kalau seed
dijalankan di produksi, teks ini akan tampil di situs perusahaan alat kesehatan.

Enam dari delapan manufakturer juga memakai logo `placehold.co` dan semua produknya
bernama "Produk A"/"Produk B".

**Perbaikan:** Bersihkan sebelum produksi, atau pastikan seed hanya dijalankan di
lingkungan pengembangan.

---

## HSM-026 ✅ SELESAI (2026-08-06)
### Import `dotenv` tidak tercantum di dependencies

**Perbaikan diterapkan:** `npm install --save-dev dotenv` dijalankan; `dotenv`
sekarang tercantum eksplisit di `devDependencies`.

**Berkas:** `prisma.config.ts:4`, `scripts/create-admin.mjs:7`

Keduanya mengimpor `dotenv`, tapi paket itu **tidak ada** di `dependencies` maupun
`devDependencies`. Saat ini berfungsi hanya karena `dotenv` kebetulan terpasang
sebagai dependensi transitif — sudah diverifikasi ada di `node_modules/dotenv/`.

Komentar di `prisma.config.ts` bahkan menginstruksikan `npm install --save-dev prisma dotenv`,
yang belum dilakukan.

Ini rapuh: kalau paket induk berhenti memerlukan `dotenv`, semua perintah Prisma
akan gagal di instalasi bersih. Jalankan `npm install --save-dev dotenv`.

---

## Lampiran: Cara Verifikasi Ulang

```bash
# Build (perhatikan: JANGAN pipe ke tail — exit code jadi salah)
npx next build > build.txt 2>&1; echo "EXIT=$?"

# Typecheck
npx tsc --noEmit

# Lint
npx eslint .

# Proteksi route (jalankan dev server lebih dulu)
npx next dev -p 3111 &
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3111/admin
# Diharapkan: 307 http://localhost:3111/login?redirectTo=%2Fadmin

# Daftar server action yang terekspos
node -e "const m=require('./.next/server/server-reference-manifest.json');\
for(const [id,v] of Object.entries(m.node||{}))console.log(id,v.exportedName)"

# Cek kode mati
grep -rn "CatalogCard\|SubCategoryDrawer\|CATEGORIES_DATA" src/
grep -rn "supabase" src/ --include=*.ts --include=*.tsx
grep -rn "ContactMessage\|contactMessage" src/
```
