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
