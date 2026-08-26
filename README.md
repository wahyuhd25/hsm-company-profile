# HSM Company Profile

This is a Next.js project for PT. Hartindo Surya Medika (HSM).

## Persiapan untuk Developer (Setup)

Jika Anda baru saja melakukan pull/clone repository ini, ikuti langkah-langkah berikut agar aplikasi bisa berjalan normal di komputer Anda:

### 1. Install Dependencies
Buka terminal dan jalankan:
```bash
npm install
```

### 2. Setup Environment Variables (.env)
File `.env` tidak dimasukkan ke dalam Git untuk alasan keamanan. Anda harus membuatnya sendiri secara lokal:
- Copy file `.env.example` dan ubah namanya menjadi `.env`
- Minta nilai untuk `DATABASE_URL`, `DIRECT_URL`, dan variabel Supabase lainnya kepada developer utama atau tim lead, lalu isi ke dalam file `.env` yang baru Anda buat.

### 3. Setup Database (Prisma)
Setelah `.env` disiapkan, Anda harus men-generate Prisma Client dan menyinkronkan database lokal:
```bash
npx prisma generate
npx prisma db push
```

**(Opsional)** Jika Anda menggunakan database lokal/baru dan masih kosong, Anda bisa menjalankan script seed untuk mengisi data dummy (termasuk 8 katalog produk) dengan perintah:
```bash
npx prisma db seed
```

### 4. Jalankan Aplikasi
Jalankan development server:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

## Deploy

Aplikasi ini bisa dengan mudah di-deploy di platform seperti Vercel. Pastikan Anda menyertakan seluruh Environment Variables yang ada di `.env` ke settingan Vercel saat melakukan deployment.

---

## Buku Panduan Pemeliharaan (Maintenance Guide)

Dokumen di bawah ini berisi informasi tingkat lanjut untuk memelihara (*maintenance*), mengelola sistem, dan mengembangkan website ini di masa depan.

### 1. Tumpukan Teknologi (Tech Stack) Utama
Website ini dibangun menggunakan teknologi web modern dan berkinerja tinggi:
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18)
- **Bahasa**: TypeScript (sepenuhnya diketik dengan ketat demi keamanan)
- **Styling**: CSS Modules (`.module.css`) untuk UI khusus, memastikan gaya tidak saling bertabrakan.
- **Database**: PostgreSQL yang di-hosting di **Supabase**.
- **ORM (Penghubung Database)**: [Prisma](https://www.prisma.io/)

### 2. Struktur Folder Penting (`src/`)

- `app/` → Berisi seluruh halaman website (rute).
  - `app/admin/` → Folder rahasia untuk Dasbor Admin. Seluruh folder ini otomatis diproteksi oleh file `layout.tsx`.
  - `app/actions/` → **Sangat Penting!** Berisi *Server Actions* (Logika backend/API). Semua mutasi (Tambah, Ubah, Hapus) terjadi di sini.
  - `app/katalog/` → Halaman publik untuk melihat daftar produk.
- `app/components/` → Berisi komponen UI yang bisa dipakai ulang (seperti Header, Footer, Form Kontak).
- `lib/` → File konfigurasi utilitas.
  - `lib/prisma.ts` → Koneksi utama ke Supabase.
  - `lib/auth.ts` → Pengatur *login*, pembuat sesi (JWT), dan verifikator keamanan.
- `prisma/` → Pengaturan *database*.
  - `schema.prisma` → Cetak biru/struktur tabel database.

### 3. Variabel Lingkungan Rahasia (Environment Variables)

Untuk *deployment*, pastikan variabel krusial ini terisi:
- **`DATABASE_URL`**: Link Pooler Supabase (Port 6543) untuk koneksi yang stabil & cepat.
- **`DIRECT_URL`**: Link Direct Supabase (Port 5432) khusus untuk perintah `npx prisma db push`.
- **`JWT_SECRET`**: Kunci kriptografi (bebas teks panjang acak) untuk enkripsi sesi login Admin. Jangan pernah diubah kecuali Anda ingin me-logout paksa semua admin yang sedang aktif!
- **`TURNSTILE_SECRET_KEY`**: Kunci dari Cloudflare untuk memblokir spam pada Form Kontak.

### 4. Keamanan dan Autentikasi (WAJIB DIBACA!)

**ATURAN EMAS SERVER ACTIONS:**
Jika Anda (atau developer lain) membuat fungsi baru di dalam folder `src/app/actions/` untuk mengubah atau membaca data sensitif, Anda **WAJIB** menaruh baris ini di baris paling atas fungsi tersebut:
```typescript
await requireAdmin();
```
*(Tanpa `requireAdmin()`, peretas dapat mengakses fungsi tersebut lewat script luar dan menembus keamanan tanpa login).*

- **Password Admin**: Password admin selalu di-*hash* menggunakan `bcryptjs`. Jika semua admin lupa password, satu-satunya cara me-resetnya adalah dengan memodifikasi langsung di tabel Supabase.

### 5. Mengubah Struktur Database (Prisma)
Jika Anda ingin menambah tabel baru di masa depan, alurnya adalah:
1. Buka file `prisma/schema.prisma` dan tambahkan blok model baru.
2. Sinkronkan dengan database Supabase (pastikan `DIRECT_URL` benar):
   ```bash
   npx prisma db push
   ```
3. Anda bisa melihat isi database melalui UI lokal menggunakan perintah:
   ```bash
   npx prisma studio
   ```

### 6. Penanganan Error Umum (Troubleshooting)

**1. Hydration Mismatch Error (Layar Error Merah)**
- **Penyebab**: Perbedaan zona waktu (timezone) saat *server* me-render tanggal versus zona waktu di browser klien.
- **Solusi**: Jangan merender tanggal secara langsung. Bungkus *render* tanggal dengan State `isMounted`, pastikan tanggal hanya dicetak setelah klien memuat halaman sepenuhnya (`useEffect`).

**2. Prisma Client - "Can't reach database server"**
- **Penyebab**: Koneksi internet yang memblokir port Supabase, atau Supabase sedang *idle* (mode tidur).
- **Solusi**: Coba refresh/jalankan ulang *server* lokal, atau periksa kembali kebenaran `DATABASE_URL` di file `.env`.

**3. Gagal Login (Sesi Ditolak)**
- **Penyebab**: `JWT_SECRET` kosong atau baru saja diubah.
- **Solusi**: Isi kembali rahasia di `.env`, matikan server, jalankan ulang, lalu bersihkan (*Clear*) Cookies pada *browser* Anda.
