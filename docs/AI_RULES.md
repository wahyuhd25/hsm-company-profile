# Aturan Kerja untuk AI & Kontributor Baru

> Dokumen ini adalah **patokan wajib** bagi siapa pun — manusia maupun AI — yang
> akan mengubah kode di repositori ini.
>
> Repo ini punya beberapa jebakan yang tidak terlihat dari membaca kode saja.
> Melanggar aturan di bawah tidak selalu menghasilkan error — kadang justru
> menghasilkan kerusakan senyap, dan itu yang membuatnya berbahaya.

---

## 0. Baca Ini Sebelum Menyentuh Apa Pun

Empat menit membaca daftar ini akan menghemat berjam-jam debugging.

| # | Hal yang wajib diketahui |
|---|---|
| 1 | Proteksi admin ada di **`src/proxy.ts`** (Next 16 mengganti nama `middleware.ts`). Memindahkannya **mematikan seluruh keamanan tanpa error apa pun.** |
| 2 | Server action di `actions/katalog.ts` **tidak punya cek auth**. Semuanya bergantung pada proxy. |
| 3 | `npm run build` **saat ini gagal** ([HSM-001](./ISSUES.md#hsm-001)) — itu bukan karenamu. |
| 4 | `node prisma/seed.js` **menghapus seluruh data katalog**. |
| 5 | `src/app/components/katalog/` (4 berkas) adalah **kode mati** — mengeditnya tidak berpengaruh apa pun. |
| 6 | Menghapus manufakturer **tidak** menghapus kategorinya (`SetNull`), meski UI bilang begitu. |
| 7 | Form kontak **palsu** — tidak menyimpan apa pun. |
| 8 | Ubah `schema.prisma` → **wajib** `npx prisma generate`, kalau tidak error TypeScript-nya akan menyesatkan. |

---

## 1. Aturan Absolut — Jangan Dilanggar

### 🚫 JANGAN pindahkan atau ganti nama `src/proxy.ts`

Next.js 16 mengenali berkas ini lewat konvensi nama. Sudah diverifikasi lewat
konstanta internal Next (`PROXY_FILENAME = 'proxy'`). Lokasi sah hanya
`src/proxy.ts` atau `proxy.ts` di root.

Memindahkannya ke `src/lib/proxy.ts` atau me-rename-nya jadi `middleware.ts`
akan **membuat seluruh route `/admin` terbuka untuk publik** — tanpa error,
tanpa peringatan, tanpa apa pun yang terlihat di terminal. Digabung dengan
[HSM-003](./ISSUES.md#hsm-003), artinya semua operasi CRUD termasuk penghapusan
massal bisa dipanggil siapa saja.

### 🚫 JANGAN menambahkan nilai cadangan (fallback) untuk secret

Pola ini sudah ada di 5 berkas dan merupakan [HSM-002](./ISSUES.md#hsm-002):

```ts
// ❌ JANGAN — ini yang harus dihapus, bukan ditiru
process.env.JWT_SECRET || "fallback-secret-for-hsm-company-profile-auth-12345"
```

```ts
// ✅ Yang benar
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET wajib diset");
```

Aplikasi yang menolak menyala jauh lebih baik daripada aplikasi yang menyala
tanpa keamanan.

### 🚫 JANGAN menjalankan `prisma/seed.js` di database yang berisi data asli

Baris 11-14 menjalankan `deleteMany()` pada semua produk, subkategori, kategori,
dan manufakturer. Tidak ada soft delete, tidak ada audit trail. Yang hilang,
hilang.

### 🚫 JANGAN mengubah struktur database lewat Supabase Studio

Sumber kebenaran adalah `prisma/schema.prisma`. Perubahan langsung di Studio akan
membuat skema Prisma berbeda dari kenyataan, dan `db push` berikutnya bisa
menghapusnya tanpa peringatan.

### 🚫 JANGAN commit `.env` atau nilai secret apa pun

Termasuk di dalam dokumentasi, komentar kode, pesan commit, atau contoh. Kalau
perlu memberi contoh, tulis nama variabelnya saja.

### 🚫 JANGAN pipe hasil build ke `tail` lalu percaya exit code-nya

```bash
# ❌ Melaporkan exit code milik tail — build gagal terlihat sukses
npm run build 2>&1 | tail -60

# ✅
npx next build > build.txt 2>&1; echo "EXIT=$?"
```

Jebakan ini nyata dan sudah pernah menyembunyikan kegagalan build selama audit.

---

## 2. Alur Kerja Wajib

### Sebelum mulai

```bash
git status                # pastikan bersih
npx tsc --noEmit          # catat kondisi awal (seharusnya bersih)
npx eslint . 2>&1 | tail -3   # catat jumlah error awal (25 error, 4 warning)
```

Kenapa mencatat kondisi awal: lint sudah merah sejak awal. Tanpa angka
pembanding, kamu tidak bisa tahu apakah errormu baru atau lama.

### Setelah mengubah kode

| Yang diubah | Yang wajib dijalankan |
|---|---|
| Berkas `.ts` / `.tsx` apa pun | `npx tsc --noEmit` |
| `prisma/schema.prisma` | `npx prisma generate` → `npx prisma db push` → `npx tsc --noEmit` |
| Server action | Uji manual lewat UI — tidak ada tes otomatis |
| `src/proxy.ts` | **Restart dev server**, lalu uji `curl` (lihat §5) |
| Berkas CSS | Cek visual di ketiga tema |
| Apa pun yang menyentuh auth | Uji: login sukses, login gagal, akses `/admin` tanpa cookie |

### Sebelum menyatakan selesai

1. `npx tsc --noEmit` → tetap bersih
2. `npx eslint .` → **tidak lebih buruk** dari kondisi awal
3. Perubahan sudah diuji manual di browser
4. Dokumentasi diperbarui (lihat §4)

Jangan pernah melaporkan "selesai" untuk pekerjaan yang belum diverifikasi.
Kalau ada bagian yang tidak bisa diuji, katakan bagian mana dan kenapa.

---

## 3. Pola Kode yang Berlaku di Repo Ini

### Server Action

Semua menerima `FormData`, bukan objek biasa:

```ts
export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const num = formData.get("num") as string;
  if (!name || !num) return;   // ⚠️ pola lama: gagal senyap
  await prisma.category.create({ data: { name, num, desc: "" } });
  revalidatePath("/admin/katalog");
}
```

Dua hal yang harus kamu **perbaiki**, bukan tiru:

- **`return` tanpa pesan.** Dari sisi pengguna, tombolnya seperti rusak.
  Untuk action baru, kembalikan `{ error: "..." }` dan tampilkan di UI.
- **`revalidatePath` hanya ke path admin.** Halaman publik tidak ikut diperbarui
  ([HSM-009](./ISSUES.md#hsm-009)). Untuk action baru, revalidasi keduanya.

Untuk action **baru**, wajib ada pemeriksaan auth di dalamnya. Jangan mengandalkan
proxy saja:

```ts
export async function someAction(formData: FormData) {
  await requireAdmin();   // wajib untuk kode baru
  // ...
}
```

### Server vs Client Component

| | Server (default) | Client (`"use client"`) |
|---|---|---|
| Prisma | ✅ | ❌ |
| `cookies()` | ✅ | ❌ |
| `useState` / `useEffect` | ❌ | ✅ |
| Event handler | ❌ | ✅ |
| Env var rahasia | ✅ | ❌ |

Pola yang dipakai repo: Server Component ambil data → oper sebagai props ke
Client Component. Contoh: `katalog/[manufacturerId]/[categoryId]/page.tsx` →
`CategoryProductsClient.tsx`.

Batasi `"use client"` sedekat mungkin ke daun. Menaruhnya di halaman akan
menjadikan seluruh subtree jadi client.

### Styling

Ada dua sistem — pilih yang sesuai dengan bagiannya, jangan dicampur:

| Bagian | Sistem | Contoh |
|---|---|---|
| Landing page | CSS global BEM lewat `globals.css` | `.hero__heading` |
| Admin, login, katalog | CSS Modules | `styles.catCard` |

Menambah CSS global untuk komponen yang memakai Modules tidak akan berpengaruh —
ini penyebab umum "sudah diedit tapi tidak berubah".

Untuk warna, pakai variabel dari `styles/variables.css` supaya ketiga tema tetap
konsisten. Warna hardcoded akan rusak di tema gelap.

### TypeScript

`strict: true` aktif. Jangan menambah `any` baru — sudah ada 16 dan itu
[HSM-010](./ISSUES.md#hsm-010). Pakai `unknown` + penyempitan tipe untuk error.

---

## 4. Kewajiban Memperbarui Dokumentasi

Dokumentasi yang basi lebih berbahaya daripada tidak ada dokumentasi, karena
orang tetap mempercayainya.

| Yang kamu lakukan | Yang wajib diperbarui |
|---|---|
| Ubah `schema.prisma` | [DATA_MODEL.md](./DATA_MODEL.md) |
| Tambah/hapus route | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Perbaiki isu dari ISSUES.md | Tandai selesai di [ISSUES.md](./ISSUES.md) + catat di [CHANGELOG.md](./CHANGELOG.md) |
| Tambah environment variable | [SETUP.md](./SETUP.md) **dan** `.env.example` |
| Temukan bug baru | [ISSUES.md](./ISSUES.md) dengan nomor `HSM-0XX` berikutnya |
| Tambah dependensi | Tabel tumpukan teknologi di [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Ubah alur setup | [SETUP.md](./SETUP.md) |

### Cara menandai isu selesai

Jangan hapus entri isunya. Ubah judulnya:

```markdown
## HSM-005 ✅ SELESAI (2026-08-12)
### Penghitung "produk aktif" menghitung produk nonaktif juga

**Perbaikan:** Menambahkan filter `isActive` pada `_count`. Commit `abc1234`.
```

Riwayat isu punya nilai: ia menjelaskan **kenapa** kode terlihat seperti sekarang.

### Cara menambah isu baru

Pakai format yang sama dengan yang sudah ada — **berkas + nomor baris**, cara
verifikasi, dampak, saran perbaikan. Tanpa langkah verifikasi, temuannya tidak
bisa dipercaya orang berikutnya.

---

## 5. Perintah Verifikasi

```bash
# Typecheck
npx tsc --noEmit

# Lint (bandingkan dengan baseline: 25 error, 4 warning)
npx eslint . 2>&1 | tail -3

# Build — perhatikan cara menangkap exit code
npx next build > build.txt 2>&1; echo "EXIT=$?"

# Proteksi admin masih hidup? (dev server harus jalan)
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/admin
# Diharapkan: 307 http://localhost:3000/login?redirectTo=%2Fadmin
# Kalau 200 → proteksi mati, HENTIKAN dan perbaiki

# Server action apa saja yang terekspos sebagai endpoint publik
node -e "const m=require('./.next/server/server-reference-manifest.json');\
for(const [id,v] of Object.entries(m.node||{}))console.log(id,v.exportedName)"

# Kategori yatim
npx prisma studio   # → tabel categories, cari manufacturerId NULL
```

---

## 6. Aturan Khusus untuk AI

### Verifikasi, jangan berasumsi

Repo ini punya banyak hal yang berlawanan dengan intuisi. Beberapa contoh nyata
yang ditemukan saat audit:

- `middleware.ts` **tidak ada** — Next 16 memakai `proxy.ts`
- Supabase Auth **tidak dipakai** meski paketnya terpasang dan helper-nya ada
- `ContactMessage` ada di skema tapi **tidak pernah ditulis**
- `slug` unik dan wajib tapi **tidak pernah dibaca**
- `npx prisma db seed` **tidak melakukan apa pun**
- Empat komponen di `components/katalog/` **tidak diimpor siapa pun**

Kalau kesimpulanmu berasal dari nama berkas atau pola yang biasa, **jalankan
grep dulu**. Setiap temuan di [ISSUES.md](./ISSUES.md) mencantumkan cara
verifikasinya — tiru pendekatan itu.

### Laporkan hasil dengan jujur

- Build gagal → tunjukkan output errornya
- Ada langkah yang dilewat → sebutkan mana dan kenapa
- Tidak bisa menguji sesuatu → katakan, jangan diam
- Tidak yakin → bilang tidak yakin

Jangan pernah menyatakan sesuatu "sudah diperbaiki" berdasarkan pembacaan kode
saja. Repo ini tidak punya tes otomatis sama sekali
([HSM-018](./ISSUES.md#hsm-018)) — verifikasi manual adalah satu-satunya jaring
pengaman yang ada.

### Kerjakan yang diminta, sesuai lingkupnya

Repo ini punya 26 isu yang sudah diketahui. Godaan untuk "sekalian membereskan"
hal lain akan menghasilkan diff besar yang sulit direview dan sulit dibatalkan.

- Diminta perbaiki satu bug → perbaiki bug itu
- Menemukan bug lain → catat di [ISSUES.md](./ISSUES.md), laporkan, jangan
  langsung kerjakan
- Perbaikan menuntut perubahan lain agar konsisten → jelaskan dulu kenapa,
  lalu kerjakan

### Bahasa

Dokumentasi, komentar kode, dan teks UI memakai **Bahasa Indonesia** — mengikuti
konvensi yang sudah ada. Nama variabel dan fungsi tetap Bahasa Inggris, sesuai
kode yang ada sekarang.

### Sebelum menghapus apa pun

Repo ini punya kode mati yang memang layak dihapus, tapi periksa dulu:

```bash
grep -rn "NamaKomponen" src/
```

Nol hasil selain definisinya sendiri = aman dihapus. Yang sudah terverifikasi
mati: `components/katalog/` (4 berkas), `lib/supabase/` (2 berkas),
`scripts/create-admin.mjs`.

---

## 7. Kalau Kamu Menyentuh Ini, Ekstra Hati-hati

| Berkas | Kenapa |
|---|---|
| `src/proxy.ts` | Satu-satunya penjaga route admin. Rusak = seluruh admin terbuka, tanpa error. |
| `src/app/actions/katalog.ts` | 15 endpoint HTTP publik tanpa cek auth. |
| `prisma/schema.prisma` | Perilaku cascade tidak konsisten antar-tingkat. Salah ubah = kehilangan data. |
| `prisma/seed.js` | Menghapus semua data katalog saat dijalankan. |
| `src/app/actions/auth.ts` | Ubah `JWT_SECRET` atau nama cookie = semua sesi mati. |
| `src/app/layout.tsx` | Metadata SEO — memuat klaim yang belum diverifikasi ([HSM-021](./ISSUES.md#hsm-021)). |

---

## 8. Daftar Periksa Sebelum Commit

- [ ] `npx tsc --noEmit` bersih
- [ ] `npx eslint .` tidak lebih buruk dari baseline (25 error, 4 warning)
- [ ] Diuji manual di browser — bukan cuma dibaca
- [ ] Tidak ada secret di kode, komentar, atau pesan commit
- [ ] Tidak ada `any` baru
- [ ] Tidak ada `console.log` sisa debugging
- [ ] Dokumentasi terkait sudah diperbarui (§4)
- [ ] Kalau menyentuh auth: `/admin` tanpa cookie masih 307 ke `/login`
- [ ] Kalau menyentuh skema: `npx prisma generate` sudah dijalankan
- [ ] Pesan commit menjelaskan **kenapa**, bukan cuma **apa**

---

## 9. Konteks Bisnis yang Perlu Diingat

PT. Hartindo Surya Medika adalah **distributor implan ortopedi dan instrumen
bedah**. Pelanggannya rumah sakit dan dokter bedah.

Konsekuensinya untuk pekerjaan teknis:

- **Akurasi data produk bukan sekadar soal teknis.** Kode barang yang salah bisa
  berujung pada kesalahan pemesanan alat medis. `kodeBarang` saat ini tidak unik
  ([HSM-020](./ISSUES.md#hsm-020)).
- **Klaim perusahaan harus bisa dibuktikan.** Ada klaim "133K+ produk terjual"
  di metadata SEO yang tidak didukung apa pun di situs
  ([HSM-021](./ISSUES.md#hsm-021)).
- **Form kontak adalah jalur penjualan.** Setiap pesan yang hilang adalah calon
  pembeli yang hilang ([HSM-007](./ISSUES.md#hsm-007)).
- **Data kontak harus asli.** Nomor telepon masih berisi placeholder `894-XXXX`
  ([HSM-024](./ISSUES.md#hsm-024)).
- **Teks bercanda tidak boleh sampai produksi.** Seed masih memuat "Manufakturer
  alat ortopedi terbaik di ambon kiri" ([HSM-025](./ISSUES.md#hsm-025)).

Kalau ragu antara "cepat" dan "benar" untuk hal-hal yang menyangkut data produk
atau klaim perusahaan — pilih benar, dan tanyakan.
