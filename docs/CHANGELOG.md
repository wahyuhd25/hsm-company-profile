# Riwayat & Log Perkembangan

> Dokumen ini melacak perkembangan proyek dari waktu ke waktu — supaya jelas
> apa yang sudah dikerjakan, apa yang sedang berjalan, dan apa yang belum.
>
> **Setiap kali memperbaiki isu dari [ISSUES.md](./ISSUES.md), catat di sini.**

---

## Cara Menulis Entri

Format:

```markdown
## [Belum dirilis] — YYYY-MM-DD

### Diperbaiki
- **HSM-005** — Penghitung produk sekarang memfilter `isActive`. (`abc1234`)

### Ditambahkan
- Deskripsi singkat fitur baru. (`abc1234`)

### Diubah
- Perubahan perilaku yang perlu diketahui orang lain. (`abc1234`)

### Dihapus
- Kode/berkas yang dibuang beserta alasannya. (`abc1234`)
```

Kategori: **Ditambahkan**, **Diubah**, **Diperbaiki**, **Dihapus**, **Keamanan**.
Selalu sertakan hash commit dan nomor `HSM-0XX` kalau ada.

---

## [Belum dirilis]

### Diperbaiki — 6 Agustus 2026

Semua isu dari [ISSUES.md](./ISSUES.md) yang **tidak memerlukan keputusan**
produk/desain/data telah diperbaiki:

- **HSM-001** — `connection_limit` di `DATABASE_URL` dinaikkan ke `5`; `npx next build` sekarang exit 0.
- **HSM-002** — `JWT_SECRET` diset; seluruh nilai cadangan (fallback) dihapus, sumber tunggal dipindah ke `src/lib/auth.ts`.
- **HSM-003** — `requireAdmin()` ditambahkan ke seluruh 15 server action di `actions/katalog.ts`.
- **HSM-005** — Filter `isActive: true` ditambahkan pada `_count` produk di halaman katalog manufakturer.
- **HSM-006** — `scripts/seed-admin.mjs` sekarang wajib `ADMIN_EMAIL`/`ADMIN_PASSWORD` dari environment.
- **HSM-008** — `ThemeSwitcher` dibungkus kondisi `NODE_ENV === "development"`.
- **HSM-009** — Semua action di `actions/katalog.ts` merevalidasi path publik, bukan hanya admin.
- **HSM-010** — Lint dibersihkan total: 0 error, 0 warning (sebelumnya 25 error, 4 warning).
- **HSM-011** — 4 berkas komponen katalog mati (`components/katalog/`) dihapus.
- **HSM-012** — Sisa Supabase Auth dihapus: `lib/supabase/`, `scripts/create-admin.mjs`, dependensi `@supabase/*`, dan penanganan error Supabase di halaman login.
- **HSM-016** — *Sebagian*: komponen `SafeImage` (fallback `onError`) dipasang di semua titik render gambar eksternal. Migrasi hosting gambar tetap belum dikerjakan (butuh keputusan).
- **HSM-019** — Blok `"prisma": { "seed": "..." }` ditambahkan ke `package.json`; `npx prisma db seed` kini berfungsi.
- **HSM-021** — Klaim SEO yang tidak terverifikasi ("133K+ produk terjual") dihapus dari metadata.
- **HSM-023** — Verifikasi JWT dipusatkan ke `verifySession()` yang mencatat kegagalan lewat `console.warn`.
- **HSM-026** — `dotenv` ditambahkan eksplisit ke `devDependencies`.

Selain itu, seluruh `<a>` untuk navigasi internal (termasuk di `Katalog.tsx`
yang tidak ditandai lint) diganti `<Link>` dari `next/link`, dan tipe
kembalian server action di `actions/katalog.ts` diubah dari
`Promise<{error: string} | undefined>` ke `Promise<void>` agar sesuai dengan
tipe `<form action={fn}>` bawaan React (kesalahan validasi kini dicatat lewat
`console.error`, bukan dikembalikan ke form — belum ada UI yang membacanya).

Diverifikasi: `npx tsc --noEmit` (0 error), `npx eslint .` (0 masalah),
`npx next build` (exit 0).

**Sengaja tidak disentuh** (butuh keputusan produk, desain, atau data bisnis
asli): HSM-004, HSM-007, HSM-013, HSM-014, HSM-015, HSM-017, HSM-018,
HSM-020, HSM-022, HSM-024, HSM-025.

### Ditambahkan — 5 Agustus 2026

- **Dokumentasi lengkap di `docs/`** — hasil audit penuh seluruh repositori
  (59 berkas terlacak, 15.603 baris) pada commit `d52ec54`:

  | Dokumen | Isi |
  |---|---|
  | `README.md` | Indeks & status proyek |
  | `ARCHITECTURE.md` | Peta sistem, routing, boundary server/client |
  | `DATA_MODEL.md` | Skema, relasi, perilaku cascade |
  | `SETUP.md` | Setup dari nol (mengoreksi README root) |
  | `ISSUES.md` | 26 bug & ambiguitas terverifikasi |
  | `TROUBLESHOOTING.md` | Gejala → penyebab → berkas |
  | `AI_RULES.md` | Aturan wajib untuk kontributor & AI |
  | `CHANGELOG.md` | Dokumen ini |

- **26 isu terverifikasi terdokumentasi** — 4 Kritis, 7 Tinggi, 8 Sedang,
  7 Rendah. Setiap temuan disertai berkas + nomor baris dan cara verifikasinya.

> Belum ada perbaikan kode pada tahap ini. Audit ini **mendokumentasikan**
> keadaan repositori, tidak mengubahnya.

---

## Temuan Utama Audit — 5 Agustus 2026

### Yang sudah berfungsi ✅

| Aspek | Bukti |
|---|---|
| `npm run dev` | Diuji di port 3111; `/`, `/login` → 200 |
| `npx tsc --noEmit` | 0 error |
| Proteksi route `/admin` | `307 → /login?redirectTo=%2Fadmin` |
| Konsistensi CSS Modules | 4 berkas modul, nol kelas tak terdefinisi |
| Alur login | JWT HS256 + bcrypt, cookie httpOnly |
| Panel admin CRUD | 15 server action, semua terdaftar & berfungsi |

### Yang rusak ❌ (kondisi saat audit 5 Agustus 2026)

> Lihat status terkini di bawah tabel — sebagian besar sudah diperbaiki
> 6 Agustus 2026.

| Aspek | Isu | Status |
|---|---|---|
| `npm run build` | Exit 1 — [HSM-001](./ISSUES.md#hsm-001) | ✅ Diperbaiki |
| `npm run lint` | 25 error, 4 warning — [HSM-010](./ISSUES.md#hsm-010) | ✅ Diperbaiki |
| `JWT_SECRET` | Tidak diset, fallback publik — [HSM-002](./ISSUES.md#hsm-002) | ✅ Diperbaiki |
| Form kontak | Palsu — [HSM-007](./ISSUES.md#hsm-007) | 🤔 Butuh keputusan |
| Konfirmasi hapus manufakturer | Menyatakan hal yang salah — [HSM-004](./ISSUES.md#hsm-004) | 🤔 Butuh keputusan |
| `npx prisma db seed` | Tidak melakukan apa pun — [HSM-019](./ISSUES.md#hsm-019) | ✅ Diperbaiki |
| Tes otomatis | Tidak ada sama sekali — [HSM-018](./ISSUES.md#hsm-018) | 🤔 Butuh keputusan |

### Kode mati yang teridentifikasi

- `src/app/components/katalog/` — 4 berkas, nol importer ([HSM-011](./ISSUES.md#hsm-011))
- `src/lib/supabase/` — 2 berkas, tidak dipakai ([HSM-012](./ISSUES.md#hsm-012))
- `scripts/create-admin.mjs` — memakai Supabase Auth yang tidak aktif
- Model `ContactMessage` — nol penulis ([HSM-007](./ISSUES.md#hsm-007))
- Variabel `loginTime` di `admin/page.tsx:30` — dihitung, tidak dipakai

---

## Riwayat Pengembangan (dari Git)

> Direkonstruksi dari 25 commit, 26 Juni – 13 Juli 2026.
> Kontributor: **wahyuhidayat / wahyuhd25**, **Fathy Said10**.

### Fase 4 — Data & Persiapan Deploy (13 Juli 2026)

| Commit | Isi |
|---|---|
| `d52ec54` | 8 produk dummy, `.env.example`, instruksi setup di README |

Fase inilah yang memperkenalkan `connection_limit=1` dan instruksi
`npx prisma db seed` yang tidak berfungsi — keduanya jadi
[HSM-001](./ISSUES.md#hsm-001) dan [HSM-019](./ISSUES.md#hsm-019).

### Fase 3 — Katalog & Panel Admin (7–8 Juli 2026)

| Commit | Isi |
|---|---|
| `925b836` | Penyesuaian visual: background grid, about editorial, hero & map |
| `16f3c73` | Halaman katalog publik (`/katalog/**`) |
| `fca8612` | Panel CRUD katalog di admin |
| `38ca172` | Perbarui skema Prisma + skrip seed |
| `ed15dfd` | Panel admin + tombol login di navbar |

Ini fase terbesar. Halaman katalog publik yang lahir di sini menggantikan
komponen `components/katalog/` dari Fase 1 — tapi berkas lamanya tidak dihapus,
sehingga menjadi [HSM-011](./ISSUES.md#hsm-011).

Bug penghitung produk ([HSM-005](./ISSUES.md#hsm-005)) dan ketiadaan revalidasi
path publik ([HSM-009](./ISSUES.md#hsm-009)) juga berasal dari fase ini.

### Fase 2 — Database & Autentikasi (7 Juli 2026)

| Commit | Isi |
|---|---|
| `2c958c2` | Halaman login & alur auth |
| `8edfd37` | Skrip seed admin |
| `9c59aec` | Skema Prisma & setup database |
| `d5381f2` | Setup database & dependensi auth |

Di sinilah muncul dua pendekatan auth sekaligus: Supabase Auth
(`scripts/create-admin.mjs`, `lib/supabase/`) dan JWT kustom
(`actions/auth.ts`). Yang kedua menang, tapi yang pertama tidak pernah
dibersihkan — jadi [HSM-012](./ISSUES.md#hsm-012).

Fallback `JWT_SECRET` ([HSM-002](./ISSUES.md#hsm-002)) juga lahir di sini,
kemungkinan sebagai kemudahan saat pengembangan awal.

### Fase 1 — Landing Page (26–29 Juni 2026)

| Commit | Isi |
|---|---|
| `67599c2` | Perbaikan lint theme switcher |
| `a917691` | Bagian kontak + integrasi ke home |
| `7c03b89` | Penyesuaian kontras navbar & hero stats |
| `7d71523` | Sederhanakan desain drawer katalog |
| `fc734ce` | Modularisasi komponen katalog |
| `a3c4975` | Bagian katalog interaktif dengan grid expansion |
| `e8b64f1` | Optimasi kontras tombol & hover |
| `e66d1a8` | Dev Theme Switcher dengan 3 skema warna |
| `ebfed9d` | Bagian About Us |
| `b250d3f` | Commit awal |

Theme switcher dari `e66d1a8` memang diniatkan sebagai alat pengembangan —
namanya sendiri bilang "Dev". Ia tidak pernah dilepas sebelum bagian lain naik,
jadi [HSM-008](./ISSUES.md#hsm-008).

Form kontak dari `a917691` sejak awal memakai `setTimeout` sebagai simulasi,
menunggu backend yang belum pernah dibuat — [HSM-007](./ISSUES.md#hsm-007).

### Pola yang terlihat dari riwayat

Sebagian besar isu di [ISSUES.md](./ISSUES.md) bukan kesalahan penulisan kode.
Semuanya adalah **hal sementara yang tidak pernah dipermanenkan**: placeholder
yang menunggu data asli, simulasi yang menunggu backend, fallback yang menunggu
konfigurasi, dan pendekatan lama yang tidak dibersihkan setelah diganti.

Itu wajar untuk proyek yang bergerak cepat. Yang perlu dilakukan sekarang adalah
menutup jarak antara "sementara" dan "produksi" — dan itu persis daftar di
bawah ini.

---

## Peta Jalan

### Sebelum bisa deploy 🔴

- [x] [HSM-001](./ISSUES.md#hsm-001) — Perbaiki build (naikkan `connection_limit`)
- [x] [HSM-002](./ISSUES.md#hsm-002) — Set `JWT_SECRET`, hapus semua fallback
- [x] [HSM-003](./ISSUES.md#hsm-003) — Tambah cek auth di 15 server action
- [ ] [HSM-004](./ISSUES.md#hsm-004) — Selaraskan perilaku hapus dengan pesan UI *(butuh keputusan)*
- [x] [HSM-006](./ISSUES.md#hsm-006) — Ganti kredensial admin default
- [ ] [HSM-007](./ISSUES.md#hsm-007) — Perbaiki atau nonaktifkan form kontak *(butuh keputusan)*

### Sebelum dianggap layak publik 🟠

- [x] [HSM-008](./ISSUES.md#hsm-008) — Sembunyikan theme switcher di produksi
- [x] [HSM-005](./ISSUES.md#hsm-005) — Perbaiki penghitung produk
- [x] [HSM-009](./ISSUES.md#hsm-009) — Revalidasi path publik
- [ ] [HSM-024](./ISSUES.md#hsm-024) — Ganti data kontak placeholder *(butuh data asli)*
- [ ] [HSM-025](./ISSUES.md#hsm-025) — Bersihkan teks dummy tidak profesional *(butuh data asli)*
- [x] [HSM-021](./ISSUES.md#hsm-021) — Perbaiki klaim di metadata SEO
- [ ] [HSM-022](./ISSUES.md#hsm-022) — Tambah menu navigasi mobile *(butuh keputusan desain)*

### Kesehatan jangka panjang 🟡

- [x] [HSM-010](./ISSUES.md#hsm-010) — Bersihkan 25 error lint
- [x] [HSM-011](./ISSUES.md#hsm-011) — Hapus komponen katalog mati
- [x] [HSM-012](./ISSUES.md#hsm-012) — Hapus sisa-sisa Supabase Auth
- [ ] [HSM-016](./ISSUES.md#hsm-016) — Upload gambar sendiri (Supabase Storage) *(fallback `onError` minimal sudah dipasang; migrasi hosting butuh keputusan)*
- [ ] [HSM-017](./ISSUES.md#hsm-017) — Beralih ke migrasi Prisma *(butuh keputusan)*
- [ ] [HSM-018](./ISSUES.md#hsm-018) — Pasang framework tes *(butuh keputusan)*
- [x] [HSM-019](./ISSUES.md#hsm-019) — Perbaiki konfigurasi seed
- [x] [HSM-023](./ISSUES.md#hsm-023) — Catat kegagalan verifikasi JWT, jangan ditelan diam-diam
- [x] [HSM-026](./ISSUES.md#hsm-026) — Tambahkan `dotenv` ke dependencies

### Perlu keputusan, bukan sekadar perbaikan 🤔

Empat isu ini tidak punya jawaban yang "benar secara teknis" — perlu keputusan
produk lebih dulu:

- [HSM-013](./ISSUES.md#hsm-013) — Apakah subkategori jadi tingkat navigasi publik?
- [HSM-014](./ISSUES.md#hsm-014) — Pakai slug di URL, atau hapus kolomnya?
- [HSM-015](./ISSUES.md#hsm-015) — Format `num` divalidasi, atau dibuat otomatis?
- [HSM-020](./ISSUES.md#hsm-020) — `kodeBarang` dibuat unik?

Apa pun keputusannya, tulis di [DATA_MODEL.md](./DATA_MODEL.md) atau
[ARCHITECTURE.md](./ARCHITECTURE.md) — supaya orang berikutnya tidak
mempertanyakannya lagi dari nol.
