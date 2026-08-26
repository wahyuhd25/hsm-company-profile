# Arsitektur Sistem

> Diverifikasi terhadap kode pada 5 Agustus 2026 (commit `d52ec54`).

---

## 1. Tumpukan Teknologi

| Lapisan | Teknologi | Versi | Catatan |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.9 | Bundler: **Turbopack** |
| UI | React | 19.2.4 | Server Components sebagai default |
| Bahasa | TypeScript | ^5 | `strict: true` |
| ORM | Prisma | ^6.19.3 | Client `prisma-client-js` |
| Database | PostgreSQL | — | Di-host di Supabase |
| Auth | Kustom (JWT + bcrypt) | `jose` ^6.2.3 | **Bukan** Supabase Auth |
| Styling | CSS global + CSS Modules | — | Tanpa Tailwind/CSS-in-JS |
| Font | Plus Jakarta Sans | via `next/font/google` | |

**Tidak ada framework testing yang terpasang.** Tidak ada Jest, Vitest, maupun
Playwright. Semua verifikasi saat ini manual. Lihat [HSM-018](./ISSUES.md#hsm-018).

---

## 2. Struktur Direktori

```
hsm-company-profile/
├── prisma/
│   ├── schema.prisma          # Sumber kebenaran skema database
│   └── seed.js                # Data dummy: 8 manufakturer + kategori + produk
├── scripts/
│   ├── seed-admin.mjs         # Buat akun admin (Prisma + bcrypt) ← DIPAKAI
│   └── create-admin.mjs       # Buat user Supabase Auth ← USANG, jangan dipakai
├── public/                    # Aset statis (hsm-building.png, svg bawaan Next)
├── docs/                      # Dokumentasi ini
└── src/
    ├── proxy.ts               # Middleware Next 16 — proteksi route
    ├── lib/
    │   ├── prisma.ts          # Singleton Prisma Client
    │   └── supabase/          # client.ts + server.ts ← TIDAK TERPAKAI
    └── app/
        ├── layout.tsx         # Root layout, font, metadata global
        ├── globals.css        # Titik masuk semua CSS global
        ├── page.tsx           # Landing page (/)
        ├── styles/            # 8 file CSS global, di-import globals.css
        ├── actions/
        │   ├── auth.ts        # login(), logout()
        │   └── katalog.ts     # 15 server action CRUD
        ├── components/        # Komponen landing page
        │   └── katalog/       # ← 4 file, TIDAK TERPAKAI (lihat HSM-011)
        ├── katalog/           # Katalog publik
        ├── login/             # Halaman login
        └── admin/             # Panel admin (dilindungi)
```

---

## 3. Peta Routing

### Route Publik

| Path | File | Render | Sumber data |
|---|---|---|---|
| `/` | `app/page.tsx` | Server | Prisma (via komponen `Katalog`) |
| `/katalog/[manufacturerId]` | `app/katalog/[manufacturerId]/page.tsx` | Server + `generateStaticParams` | Prisma |
| `/katalog/[manufacturerId]/[categoryId]` | `.../[categoryId]/page.tsx` | Server → Client | Prisma |
| `/login` | `app/login/page.tsx` | Client | — |

### Route Admin (dilindungi)

| Path | File | Fungsi |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Dashboard + menu |
| `/admin/katalog` | `app/admin/katalog/page.tsx` | CRUD Manufakturer & Kategori |
| `/admin/katalog/[categoryId]` | `.../[categoryId]/page.tsx` | CRUD Sub Kategori & Produk |

**Penting:** parameter URL memakai **`id` numerik**, bukan `slug` — walaupun
kolom `slug` ada dan unik di tabel `manufacturers`. Lihat [HSM-014](./ISSUES.md#hsm-014).

---

## 4. Arsitektur Autentikasi

Sistem ini memakai auth kustom. **Supabase Auth tidak dipakai sama sekali**,
meskipun paketnya masih terpasang dan file helper-nya masih ada.

### Alur login

```
1. User submit form            → src/app/login/page.tsx (Client Component)
2. Panggil server action       → login() di src/app/actions/auth.ts
3. Cari admin by email         → prisma.admin.findUnique()
4. Verifikasi password         → bcrypt.compare(plain, admin.password)
5. Terbitkan JWT (HS256, 2 jam)→ jose SignJWT, payload { id, email }
6. Set cookie                  → "hsm_session", httpOnly, sameSite lax
7. Redirect                    → /admin
```

### Tiga lapis pemeriksaan (dan satu yang bolong)

| Lapis | File | Yang diperiksa | Status |
|---|---|---|---|
| 1. Proxy/middleware | `src/proxy.ts` | Cookie valid sebelum request masuk `/admin/*` | ✅ Terverifikasi jalan |
| 2. Layout admin | `src/app/admin/layout.tsx` | Verifikasi ulang JWT, redirect kalau gagal | ✅ Ada |
| 3. Server action | `src/app/actions/katalog.ts` | — | ❌ **TIDAK ADA** |

Lapis 3 yang kosong itu adalah [HSM-003](./ISSUES.md#hsm-003) — server action
CRUD tidak memeriksa identitas pemanggil sama sekali. Saat ini yang menahannya
hanya proxy di lapis 1, jadi keamanan bergantung pada satu titik tunggal.

### Catatan soal `proxy.ts`

Next.js 16 mengganti nama konvensi `middleware.ts` menjadi `proxy.ts`. Sudah
diverifikasi lewat konstanta internal Next (`PROXY_FILENAME = 'proxy'`) dan lewat
pengujian runtime — `POST /admin/katalog` tanpa cookie menghasilkan
`307 → /login?redirectTo=%2Fadmin%2Fkatalog`.

File ini **wajib berada di `src/proxy.ts` atau `proxy.ts` di root**. Memindahkannya
ke tempat lain akan mematikan seluruh proteksi admin secara diam-diam — tanpa
error, tanpa peringatan.

---

## 5. Alur Data Katalog

Hierarki data punya empat tingkat:

```
Manufacturer  (merk/supplier, mis. "Marthys Orthopaedics")
    └── Category      (mis. "Bone Plates")
            └── SubCategory   (mis. "Locking Stainless Steel")
                    └── Product       (mis. "Clavicle Locking Hook Plate")
```

### Yang dilihat pengunjung

```
/ (landing)
  └─ Kartu manufakturer  ─── klik ──→  /katalog/[manufacturerId]
                                          └─ Kartu kategori ─ klik ──→ /katalog/[mfrId]/[catId]
                                                                          └─ Grid produk + lightbox
```

**Perhatikan asimetri ini:** SubCategory ada di database dan bisa dikelola di
admin, tapi di halaman publik ia **tidak pernah jadi tingkat navigasi**. Ia hanya
muncul sebagai label teks di kartu produk. Halaman kategori menampilkan seluruh
produk dari semua subkategori sekaligus, tanpa filter.

Ini keputusan desain yang belum pernah ditulis di mana pun, dan gampang disalahpahami
sebagai bug. Lihat [HSM-013](./ISSUES.md#hsm-013).

---

## 6. Batas Server / Client

Memahami batas ini penting, karena melanggarnya menyebabkan error yang
membingungkan.

### Server Component (default, tanpa direktif)
- `app/page.tsx`, `app/components/Katalog.tsx`
- Semua halaman `admin/**`, semua halaman `katalog/**`
- `app/admin/components/AdminHeader.tsx`
- **Boleh** memanggil Prisma, membaca `cookies()`, memakai `async/await`
- **Tidak boleh** memakai `useState`, `useEffect`, atau event handler

### Client Component (`"use client"`)
- `Navbar.tsx`, `ThemeSwitcher.tsx`, `Kontak.tsx`
- `login/page.tsx`, `CategoryProductsClient.tsx`, `DeleteConfirmButton.tsx`
- **Tidak boleh** menyentuh Prisma atau environment variable rahasia
- Berinteraksi dengan server hanya lewat server action

### Server Action (`"use server"`)
- `actions/auth.ts`, `actions/katalog.ts`
- Semua menerima `FormData` — **bukan** objek biasa
- Semua dipanggil lewat atribut `action` pada `<form>`, bukan lewat `fetch`

**Jebakan yang sering kena:** setiap fungsi yang di-export dari file `"use server"`
otomatis menjadi endpoint HTTP yang bisa diakses siapa pun yang tahu ID-nya. Ini
sudah dikonfirmasi lewat `server-reference-manifest.json` yang mendaftarkan 15
action. Karena itu, pemeriksaan auth harus ada **di dalam** action, bukan hanya
di halaman yang memanggilnya.

---

## 7. Arsitektur Styling

Ada dua sistem yang berjalan berdampingan:

**A. CSS global** — untuk landing page. Di-import berantai lewat `globals.css`:

```
globals.css
 ├── styles/variables.css   ← token desain + 3 tema
 ├── styles/reset.css
 ├── styles/animations.css
 ├── styles/navbar.css
 ├── styles/hero.css
 ├── styles/about.css
 ├── styles/katalog.css
 └── styles/kontak.css
```

Kelas memakai konvensi BEM: `.hero__heading`, `.catalog__mfr-card`.

**B. CSS Modules** — untuk admin, login, dan katalog publik:
`admin.module.css`, `katalog-admin.module.css`, `login.module.css`,
`katalog-page.module.css`.

Sudah diverifikasi: **tidak ada kelas CSS Module yang dipakai tapi tidak
didefinisikan.** Keempat file modul konsisten dengan pemakaiannya.

### Sistem tema

`variables.css` mendefinisikan tiga tema lewat kelas di elemen `<html>`:
default (Light Green), `.theme-dark` (Dark Slate), `.theme-emerald` (Dark Forest).

`ThemeSwitcher.tsx` menggilir ketiganya. Tapi pilihan tema **tidak disimpan**
dan tombolnya tampil di produksi. Lihat [HSM-008](./ISSUES.md#hsm-008).

Perlu diketahui juga: CSS Modules di admin/login **tidak** memakai variabel tema
ini — warnanya di-hardcode. Jadi mengganti tema tidak berpengaruh di sana.

---

## 8. Ketergantungan pada Layanan Eksternal

| Layanan | Dipakai untuk | Kalau mati? |
|---|---|---|
| Supabase Postgres | Semua data | Situs tidak bisa dirender sama sekali |
| Google Fonts | Plus Jakarta Sans | Font fallback ke system-ui |
| Google Maps embed | Peta di bagian kontak | Iframe kosong |
| `placehold.co` | Logo dummy dari seed | Logo rusak |
| `marthysorthopaedic.com` | Gambar produk dummy | Gambar rusak |

Perhatikan bahwa gambar produk di-simpan sebagai **URL eksternal** (kolom
`imageUrl`), bukan file yang di-upload. Tidak ada mekanisme upload sama sekali.
Konsekuensinya: kalau host eksternal itu mengganti atau menghapus gambarnya,
katalog HSM ikut rusak dan tidak ada yang tahu sampai ada yang membuka halamannya.
Lihat [HSM-016](./ISSUES.md#hsm-016).
