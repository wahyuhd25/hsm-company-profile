# Model Data

> Sumber kebenaran: `prisma/schema.prisma`. Dokumen ini menjelaskan **konsekuensi**
> dari skema itu — hal-hal yang tidak terlihat dari membaca file skema saja.

---

## 1. Diagram Relasi

```
┌─────────────────┐
│  Manufacturer   │  manufacturers
│  id, name, slug │
│  logoUrl, desc  │
└────────┬────────┘
         │ 1 : N   (onDelete: SetNull)
         ▼
┌─────────────────┐
│    Category     │  categories
│  id, num, name  │
│  desc, imageUrl │
│  manufacturerId?│  ← NULLABLE
└────────┬────────┘
         │ 1 : N   (onDelete: Cascade)
         ▼
┌─────────────────┐
│   SubCategory   │  sub_categories
│  id, num, name  │
│  desc,categoryId│
└────────┬────────┘
         │ 1 : N   (onDelete: Cascade)
         ▼
┌─────────────────┐
│     Product     │  products
│  id, name       │
│  kodeBarang?    │
│  description?   │
│  imageUrl?      │
│  isActive       │
│  subCategoryId  │
└─────────────────┘

Berdiri sendiri (tanpa relasi):
┌─────────────────┐   ┌─────────────────┐
│ ContactMessage  │   │      Admin      │
│ contact_messages│   │     admins      │
│  ← TIDAK DIPAKAI│   │  email, password│
└─────────────────┘   └─────────────────┘
```

---

## 2. Perilaku Penghapusan — Baca Ini Sebelum Menghapus Apa Pun

Ini bagian paling berbahaya dari skema, karena perilakunya **tidak konsisten**
antar-tingkat.

### Hapus Manufacturer → `SetNull`

Kategori-kategorinya **tidak ikut terhapus**. Kolom `manufacturerId` mereka
diubah menjadi `NULL`.

Akibatnya kategori-kategori itu menjadi **yatim**: masih ada di database, produknya
masih ada, tapi:
- Tidak muncul di `/admin/katalog` mana pun (halaman itu selalu memfilter
  berdasarkan `manufacturerId`)
- Tidak muncul di halaman publik mana pun
- Tidak bisa dihapus atau diedit lewat UI
- Tetap memakan ruang dan tetap muncul di query mentah

Yang membuatnya lebih berbahaya: dialog konfirmasi di
`src/app/admin/katalog/page.tsx:152` **menjanjikan hal yang sebaliknya** —
"Semua kategori, subkategori, dan produk di dalamnya akan ikut terhapus."

Admin mengklik "OK" sambil percaya datanya bersih, padahal yang terjadi adalah
data tersembunyi. Ini [HSM-004](./ISSUES.md#hsm-004) — severity Kritis.

### Hapus Category → `Cascade`

Semua SubCategory ikut terhapus, dan karena SubCategory juga cascade, semua Product
di bawahnya ikut terhapus. **Tidak bisa dibatalkan.** Pesan konfirmasinya akurat.

### Hapus SubCategory → `Cascade`

Semua Product di bawahnya terhapus. Pesan konfirmasinya akurat.

### Ringkasan

| Aksi | Perilaku DB | Pesan konfirmasi di UI | Cocok? |
|---|---|---|---|
| Hapus Manufacturer | `SetNull` — kategori jadi yatim | "semua akan ikut terhapus" | ❌ **BOHONG** |
| Hapus Category | `Cascade` | "beserta seluruh subkategori dan produk" | ✅ |
| Hapus SubCategory | `Cascade` | "Semua produk di dalamnya akan ikut terhapus" | ✅ |
| Hapus Product | — | "Hapus produk X?" | ✅ |

---

## 3. Catatan Per-Model

### Manufacturer

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `Int` autoincrement | **Ini yang dipakai di URL**, bukan slug |
| `name` | `String` | Wajib |
| `slug` | `String` **@unique** | Wajib diisi, unik — tapi **tidak pernah dibaca kode mana pun** |
| `logoUrl` | `String?` | URL eksternal |
| `desc` | `String?` | Nullable — bisa tampil sebagai teks kosong di publik |

Soal `slug`: admin dipaksa mengisinya dan akan ditolak kalau bentrok
(`P2002` → "Slug sudah digunakan"), padahal nilainya tidak berpengaruh apa pun
terhadap URL atau tampilan. Ini kerja sia-sia yang membingungkan.
Lihat [HSM-014](./ISSUES.md#hsm-014).

Soal `desc` nullable: `Katalog.tsx:68` merender `{mfr.desc}` tanpa fallback.
Kalau `null`, paragrafnya kosong dan kartu terlihat rusak.

### Category

| Kolom | Tipe | Catatan |
|---|---|---|
| `num` | `String` | Nomor tampilan, mis. `"[ 01 ]"` — **format tidak divalidasi** |
| `desc` | `String` | **Wajib di DB**, tapi form admin tidak menandainya `required` |
| `manufacturerId` | `Int?` | Nullable — inilah yang memungkinkan kategori yatim |

Soal `desc`: server action menutupi ketidakcocokan ini dengan `desc: desc || ""`
(`katalog.ts:76`). Jadi tidak error, tapi kategori bisa tersimpan dengan deskripsi
kosong dan tampil sebagai ruang kosong di halaman publik.

Soal `num`: formatnya cuma konvensi. Seed memakai `"[ 01 ]"`, placeholder form
memakai `"[ 01 ]"`, tapi admin bisa mengetik apa saja — `"1"`, `"satu"`, atau
dikosongkan-lalu-diisi-spasi. Tidak ada yang mencegah. Lihat [HSM-015](./ISSUES.md#hsm-015).

### SubCategory

Tingkat ini **hanya hidup di admin**. Di halaman publik ia tidak pernah menjadi
tingkat navigasi — hanya label teks di kartu produk. Lihat [HSM-013](./ISSUES.md#hsm-013).

### Product

| Kolom | Tipe | Catatan |
|---|---|---|
| `kodeBarang` | `String?` | **Tidak unik** — dua produk boleh punya kode sama |
| `imageUrl` | `String?` | URL eksternal, tidak ada upload |
| `isActive` | `Boolean` default `true` | Filter tampil/tidak di publik |

Soal `isActive`: halaman publik memfilter `isActive: true`, tapi **penghitung
jumlah produk tidak**. Di `/katalog/[manufacturerId]` kartu kategori menghitung
`sub._count.products` — semua produk, termasuk yang nonaktif.

Jadi sebuah kategori bisa tertulis "12 produk aktif" padahal saat dibuka hanya
ada 5. Teks "aktif" itu di-hardcode di `page.tsx:149`, jadi label-nya secara aktif
menyatakan sesuatu yang salah. Lihat [HSM-005](./ISSUES.md#hsm-005).

Soal `kodeBarang` tidak unik: untuk distributor alat medis, kode barang duplikat
bisa menyebabkan salah pesan. Lihat [HSM-020](./ISSUES.md#hsm-020).

### ContactMessage — **model mati**

Tabel ini ada di skema dengan struktur lengkap (`name`, `email`, `phone`,
`message`, `isRead`), tapi:

- Tidak ada satu baris kode pun yang menulis ke sana (sudah diverifikasi dengan
  grep ke seluruh `src/`, `scripts/`, `prisma/`)
- Tidak ada UI admin untuk membacanya
- Form kontak di landing page **memalsukan** pengiriman dengan
  `setTimeout(1500)` lalu menampilkan "Pesan Anda berhasil terkirim"

Setiap pesan dari calon pembeli hilang begitu saja, sambil situs meyakinkan mereka
bahwa pesannya diterima. Ini [HSM-007](./ISSUES.md#hsm-007) — severity Kritis,
karena dampaknya bisnis, bukan cuma teknis.

### Admin

| Kolom | Catatan |
|---|---|
| `email` | `@unique` |
| `password` | Hash bcrypt (10 rounds) |

Tidak ada kolom `role`, `lastLogin`, atau `isActive`. Semua admin punya kuasa
identik. Tidak ada cara mereset password lewat UI — harus lewat `scripts/seed-admin.mjs`
atau langsung ke database.

Kredensial default di `scripts/seed-admin.mjs` adalah
`manager@hartindo.local` / `testing`. **Harus diganti sebelum produksi.**
Lihat [HSM-006](./ISSUES.md#hsm-006).

---

## 4. Yang Tidak Ada di Skema

Hal-hal ini absen dan patut disadari sebelum merancang fitur baru:

- **Tidak ada indeks** selain primary key dan `@unique`. Query yang memfilter
  `manufacturerId`, `categoryId`, `subCategoryId`, atau `isActive` melakukan
  scan penuh. Belum terasa di skala sekarang, akan terasa saat produk mencapai ribuan.
- **Tidak ada kolom urutan.** Semua diurutkan `orderBy: { id: "asc" }`, artinya
  urutan tampilan = urutan pembuatan. Admin tidak bisa mengatur ulang urutan
  tanpa menghapus dan membuat ulang.
- **Tidak ada soft delete.** Semua penghapusan permanen.
- **Tidak ada audit trail.** Tidak ada catatan siapa mengubah apa dan kapan.
  Kalau data hilang, tidak ada cara menelusurinya.
- **Tidak ada direktori `prisma/migrations/`.** Walaupun `prisma.config.ts`
  menunjuk ke sana, alur kerja yang dipakai adalah `prisma db push` — tanpa
  riwayat migrasi. Lihat [HSM-017](./ISSUES.md#hsm-017).

---

## 5. Aturan Wajib Saat Mengubah Skema

1. Ubah `prisma/schema.prisma`
2. Jalankan `npx prisma generate` — **wajib**, kalau tidak, tipe TypeScript basi
   dan error-nya akan menyesatkan
3. Jalankan `npx prisma db push`
4. Periksa apakah `prisma/seed.js` masih valid
5. Perbarui dokumen ini
6. Jalankan `npx tsc --noEmit` untuk menangkap kerusakan tipe

**Jangan pernah** mengedit database langsung lewat Supabase Studio untuk perubahan
struktur — skema Prisma akan berbeda dari kenyataan, dan `db push` berikutnya bisa
menghapus perubahan itu tanpa peringatan.
