# LAPORAN TEKNIS & DOKUMENTASI FITUR SISTEM
## Pengembangan Website Company Profile & Katalog Medis Konsinyasi
### PT. Haditama Sinergi Mandiri (HSM)

---

## 1. PENDAHULUAN & LATAR BELAKANG PROYEK
* **Nama Proyek**: Website Profil Perusahaan & Sistem Informasi Katalog Medis PT. Haditama Sinergi Mandiri (HSM)
* **Kategori**: Web Application / Enterprise Company Profile & Medical Device Catalog
* **Target Pengguna**: Rumah Sakit, Klinik, Dokter/Tenaga Medis, Mitra Pengadaan Konsinyasi Alat Kesehatan, dan Tim Administrator Internal.
* **Tujuan Pengembangan**: 
  1. Mentransformasikan portofolio pengadaan alat kesehatan HSM dari sistem manual/katalog cetak menjadi platform digital interaktif.
  2. Menyediakan katalog hierarkis multi-level yang responsif dan berkecepatan tinggi untuk menunjang pencarian alkes secara instan.
  3. Mengamankan kanal komunikasi dan konsultasi dari bot/spam menggunakan teknologi verifikasi modern.
  4. Menyediakan sistem Content Management System (CMS) mandiri bagi admin internal untuk mengelola katalog dan pesan masuk tanpa keahlian coding.

---

## 2. ARSITEKTUR SISTEM & TEKNOLOGI (TECH STACK)

| Komponen | Teknologi | Keterangan / Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework Utama** | **Next.js (App Router)** | Framework React modern dengan dukungan Server-Side Rendering (SSR) dan Static Site Generation (SSG) untuk performa instan dan SEO optimal. |
| **Bahasa Pemrograman** | **TypeScript** | Memastikan type safety, meminimalkan bug runtime, dan memudahkan skalabilitas kode jangka panjang. |
| **Database** | **PostgreSQL (Supabase Cloud)** | Database relasional berstandar enterprise dengan performa tinggi dan data integrity yang terjamin. |
| **ORM (Object Relational Mapping)** | **Prisma ORM** | Mempermudah manipulasi data, migrasi skema database, dan query typesafe tanpa query SQL manual yang rawan injection. |
| **Keamanan & Captcha** | **Cloudflare Turnstile** | Proteksi anti-bot cerdas dan ramah pengguna (frictionless) tanpa teka-teki visual yang mengganggu pengguna. |
| **Otentikasi Admin** | **JWT (Jose) + Bcrypt + HTTP-Only Cookie** | Arsitektur stateless session yang aman dari serangan XSS (Cross-Site Scripting) dan pencurian token. |
| **Pemrosesan Gambar** | **Sharp** | Kompresi gambar otomatis di sisi server ke format WebP ultra-ringan untuk menghemat bandwidth server dan database. |
| **Styling & UI** | **Vanilla CSS & CSS Modules** | Zero-runtime CSS overhead, performa rendering murni, fleksibilitas styling tanpa dependensi framework UI berat. |
| **Hosting & CI/CD** | **Vercel Cloud Platform** | Deployment otomatis berbasis Git (CI/CD pipeline), edge caching global, dan serverless functions. |

---

## 3. RINCIAN FITUR SISTEM

### A. Fitur Publik (Frontend / User Facing)

#### 1. Beranda Interaktif & Navigasi Cepat (Hero & Navigation)
* **Dynamic Header & Mobile Responsive Menu**: Navigasi bersih dengan indikator status aktif dan menu drawer adaptif untuk perangkat mobile/tablet.
* **Hero Banner dengan CTA Ganda**: Tombol aksi cepat untuk langsung menjelajah katalog alat kesehatan atau menghubungi tim konsinyasi.
* **Top Loader Transition**: Progress bar mikro-animasi pada bagian paling atas halaman yang memberikan respons visual instan saat pengguna berpindah halaman.

#### 2. Profil Perusahaan & Skema Konsinyasi Medis (Company Profile)
* **Tentang Kami (About Section)**: Penjelasan profil, sejarah singkat, visi, misi, dan nilai-nilai integritas perusahaan.
* **Legalitas & Sertifikasi**: Penegasan kredibilitas perizinan distribusi alat kesehatan (CDAKB / Izin Edar Kemenkes).
* **Layanan Unggulan Konsinyasi**: Penjelasan alur kerja konsinyasi medis untuk rumah sakit (penempatan alkes, fleksibilitas stok, pemeliharaan berkala, hingga sistem bagi hasil).

#### 3. Katalog Alat Kesehatan 3-Tingkat (Hierarchical Medical Catalog)
Katalog disusun dengan struktur hirarki standar industri:
$$\text{Pabrikan / Principal (Manufacturer)} \longrightarrow \text{Kategori Alkes (Category)} \longrightarrow \text{Detail Produk (Product)}$$
* **Static Site Generation (SSG)**: Seluruh rute katalog di-prerender saat proses build menggunakan `generateStaticParams()`, menghasilkan waktu muat halaman mendekati 0 detik.
* **Filter & Pencarian Real-time (Client-Side Instant Search)**: Kolom pencarian di halaman kategori yang menyaring nama dan deskripsi alkes secara langsung per ketikan tanpa memuat ulang halaman.
* **Skeleton Loading UI**: Tampilan transisi berupa placeholder abu-abu beranimasi saat data sedang dimuat, mencegah Layout Shift (CLS).

#### 4. Detail Produk & Direct WhatsApp CTA
* **Spesifikasi Lengkap**: Penjelasan fungsi medis, spesifikasi teknis, pabrikan pembuat, dan gambar resolusi tinggi.
* **Direct WhatsApp Integration (One-Click Inquiry)**: Tombol konsultasi cepat yang secara otomatis membuka WhatsApp Customer Service HSM lengkap dengan pesan template berisi nama produk dan tautan halaman yang sedang dilihat.

#### 5. Formulir Kontak & Proteksi Anti-Bot (Turnstile Protected Contact Form)
* **Input Data Lengkap**: Nama, Email, Instansi/Rumah Sakit, Nomor Telepon/WA, dan Pesan Kebutuhan.
* **Cloudflare Turnstile Verification**: Sistem otomatis memvalidasi token captcha ke server Cloudflare sebelum data disimpan ke database, mencegah pengiriman spam/brute-force.
* **Feedback Interaktif**: Notifikasi visual status pengiriman (loading, sukses dengan centang hijau, atau pesan peringatan jika gagal).

#### 6. Optimasi SEO & Metadata Otomatis
* **Dynamic `sitemap.xml`**: Generator dinamis yang secara otomatis mendaftarkan seluruh rute publik dan ratusan URL produk alkes ke mesin pencari Google.
* **Dynamic `robots.txt`**: Pengaturan indeks mesin pencari yang memblokir akses bot ke area sensitif (`/admin/*`) dan membuka area publik.
* **OpenGraph & Twitter Cards**: Tampilan pratinjau kartu yang rapi dan profesional saat link dibagikan di WhatsApp, LinkedIn, atau media sosial.
* **JSON-LD Schema.org**: Data terstruktur dengan tipe `MedicalBusiness` / `Organization` untuk meningkatkan peringkat pencarian lokal.

---

### B. Fitur Administrator (Backend / CMS Panel)

#### 1. Keamanan & Otentikasi Akses (Authentication & Security)
* **Login Form Terproteksi**: Menggunakan hashing password satu arah dengan algoritma `bcrypt` (10 rounds salt).
* **HTTP-Only Secure Cookie Session**: Token sesi tidak dapat dibaca oleh script browser jahat via JavaScript (`document.cookie`), mencegah pembajakan sesi.
* **Middleware Route Guarding**: Proteksi server-side menyeluruh; pengguna tanpa sesi sah otomatis ditolak dan dialihkan ke `/login`.

#### 2. Dashboard Ringkasan (Admin Dashboard)
* Menampilkan ringkasan statistik terkini: total pabrikan mitra, total kategori, total produk aktif, dan jumlah pesan kontak yang belum dibaca (*unread count*).
* Navigasi header seragam dengan tombol *Cepat Kembali ke Dashboard* di seluruh sub-halaman admin.

#### 3. Manajemen Pesan Masuk (Inbox System)
* **Daftar Pesan Interaktif**: Tampilan split-view (sidebar daftar pesan dan panel detail isi pesan).
* **Penanda Status Baca**: Otomatis menandai pesan menjadi "Telah Dibaca" (*isRead: true*) saat admin membukanya.
* **Aksi Cepat Respon**: Tautan satu klik untuk membalas email pengirim atau langsung chat via WhatsApp.
* **Hapus Pesan Bersih (Clean Delete)**: Konfirmasi penghapusan yang langsung mengeksekusi penghapusan data secara permanen dari tabel database PostgreSQL.

#### 4. Manajemen Katalog Produk (CRUD System)
* **Kelola Pabrikan (Manufacturer)**: Tambah, edit nama/slug, deskripsi, dan logo prinsipal.
* **Kelola Kategori**: Pengelompokan alkes berdasarkan bidang spesialisasi (misal: Bedah, Radiologi, Ortopedi).
* **Kelola Produk**: Pengisian data alkes lengkap dengan deskripsi klinis dan penugasan kategori.
* **Fitur Dual-Mode Image Input**:
  * *Metode 1 (URL Eksternal)*: Memasukkan tautan gambar web langsung.
  * *Metode 2 (Upload File Lokal)*: Mengunggah file dari komputer/HP admin, di mana server secara otomatis mengompresi gambar menjadi format WebP berbobot kecil dan menyimpannya sebagai Data URI langsung di database PostgreSQL tanpa memerlukan storage cloud berbayar terpisah.

#### 5. Manajemen Akun Admin (User Management)
* Mengelola daftar akun staf yang memiliki hak akses administratif ke CMS.
* Menambah akun baru dengan enkripsi kata sandi otomatis.

---

## 4. SKEMA STRUKTUR DATABASE (ENTITY RELATIONSHIP)

Database relasional dikelola melalui Prisma ORM dengan entitas utama:

1. **`Admin`**: Menyimpan kredensial admin (`id`, `name`, `email`, `password_hash`, `role`, `createdAt`).
2. **`Manufacturer`**: Data prinsipal/pabrikan alkes (`id`, `name`, `slug`, `country`, `logoUrl`, `description`).
3. **`Category`**: Kategori alat kesehatan (`id`, `name`, `slug`, `manufacturerId`, `description`).
4. **`Product`**: Data detail produk alkes (`id`, `name`, `slug`, `categoryId`, `description`, `imageUrl`, `specs`).
5. **`ContactMessage`**: Pesan masuk dari form kontak (`id`, `name`, `email`, `institusi`, `phone`, `message`, `isRead`, `createdAt`).

---

## 5. ANALISIS PERFORMA & KEUNGGULAN SISTEM

1. **Kecepatan Akses & Efisiensi Bandwidth**:
   * Implementasi komponen `next/image` modern melayani format WebP/AVIF dengan ukuran berkas hingga 70% lebih kecil dibanding JPEG konvensional.
   * `Promise.all` paralel query pada server components memangkas waktu tunggu database hingga 50% dibandingkan query sekuensial (waterfall).
2. **Zero Bot Spam**:
   * Cloudflare Turnstile membendung bot otomatis tanpa menurunkan konversi pengunjung nyata.
3. **Penyimpanan Gambar Efisien**:
   * Fitur kompresi Sharp memastikan gambar yang diunggah staf admin tidak membebani ukuran database atau kuota hosting.
4. **CI/CD Berkelanjutan**:
   * Perubahan kode pada Git repository secara otomatis diuji, dibuild, dan dideploy ke jaringan global Vercel Edge Network dalam hitungan detik.

---

## 6. KESIMPULAN

Sistem profil perusahaan dan katalog konsinyasi medis **PT. Haditama Sinergi Mandiri** berhasil dikembangkan dengan memadukan standar rekayasa perangkat lunak modern: arsitektur serverless, database relasional terpusat, keamanan sesi tingkat lanjut, proteksi anti-spam pintar, dan optimasi mesin pencari (SEO). Platform ini siap digunakan sebagai media branding korporat yang kredibel sekaligus alat operasional pengadaan alat kesehatan yang efektif.
