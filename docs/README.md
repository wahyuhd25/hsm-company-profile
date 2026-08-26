# Dokumentasi HSM Company Profile

Pusat dokumentasi untuk PT. Hartindo Surya Medika (HSM) — website company profile
dengan katalog produk ortopedi dan panel admin.

Dokumentasi ini dibuat berdasarkan **audit penuh seluruh repo** pada 5 Agustus 2026
(commit `d52ec54`, branch `feature/add-dummy-products`).

---

## Peta Dokumen

| Dokumen | Isi | Baca kalau kamu... |
|---|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Peta sistem, routing, alur data, boundary server/client | baru masuk ke repo ini |
| [DATA_MODEL.md](./DATA_MODEL.md) | Skema database, relasi, perilaku cascade | menyentuh Prisma / query |
| [SETUP.md](./SETUP.md) | Cara menjalankan dari nol, environment variables | pertama kali clone |
| [ISSUES.md](./ISSUES.md) | **26 bug & ambiguitas terverifikasi**, dengan severity | mau tahu apa yang rusak |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Gejala → penyebab → file mana yang harus dibuka | ada yang error |
| [AI_RULES.md](./AI_RULES.md) | Aturan wajib untuk AI / kontributor baru | akan mengubah kode |
| [CHANGELOG.md](./CHANGELOG.md) | Riwayat & log perkembangan | mau lihat progres |

---

## Status Proyek — Ringkasan Cepat

> Diperbarui: 6 Agustus 2026 — lihat [CHANGELOG.md](./CHANGELOG.md) untuk daftar lengkap perbaikan.

| Aspek | Status | Catatan |
|---|---|---|
| `npm run dev` | ✅ Jalan | Diuji di port 3111, semua route merespons |
| `npm run build` | ✅ Sukses | Exit 0 — [HSM-001](./ISSUES.md#hsm-001) diperbaiki |
| `npx tsc --noEmit` | ✅ Bersih | 0 error |
| `npm run lint` | ✅ Bersih | 0 error, 0 warning — [HSM-010](./ISSUES.md#hsm-010) diperbaiki |
| Proteksi route `/admin` | ✅ Berfungsi | Diuji: 307 → `/login` |
| Server action CRUD | ✅ Terlindungi | `requireAdmin()` di semua 15 action — [HSM-003](./ISSUES.md#hsm-003) diperbaiki |
| Keamanan sesi | ✅ Diperbaiki | `JWT_SECRET` diset, tanpa fallback — [HSM-002](./ISSUES.md#hsm-002) |
| Form kontak | ⚠️ Masih palsu | Tidak menyimpan apa pun — [HSM-007](./ISSUES.md#hsm-007), butuh keputusan |
| Konfirmasi hapus manufakturer | ⚠️ Masih menyesatkan | Lihat [HSM-004](./ISSUES.md#hsm-004), butuh keputusan |
| Deploy-ready | ⚠️ Hampir | Semua isu 🔴 Kritis teknis sudah beres; HSM-004 & HSM-007 masih butuh keputusan produk |

**Isu 🔴 Kritis yang masih terbuka (butuh keputusan, bukan perbaikan mekanis):** HSM-004, HSM-007.

---

## Konteks Bisnis

PT. Hartindo Surya Medika adalah distributor implan ortopedi dan instrumen bedah
yang berbasis di Makassar. Website ini punya dua sisi:

- **Publik** — profil perusahaan, katalog produk berjenjang (Manufakturer →
  Kategori → Sub Kategori → Produk), dan formulir kontak.
- **Admin** — panel CRUD untuk mengelola isi katalog, dilindungi login.

Karena ini perusahaan alat kesehatan, **akurasi data produk dan klaim perusahaan
adalah masalah kredibilitas, bukan sekadar masalah teknis.** Lihat
[HSM-025](./ISSUES.md#hsm-025) dan [HSM-024](./ISSUES.md#hsm-024).

---

## Cara Menjaga Dokumentasi Ini Tetap Hidup

Dokumentasi yang basi lebih berbahaya daripada tidak ada dokumentasi, karena orang
tetap mempercayainya. Aturan minimum:

1. Mengubah skema Prisma → perbarui [DATA_MODEL.md](./DATA_MODEL.md)
2. Menambah/menghapus route → perbarui [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Memperbaiki bug dari [ISSUES.md](./ISSUES.md) → tandai selesai + catat di [CHANGELOG.md](./CHANGELOG.md)
4. Menambah environment variable → perbarui [SETUP.md](./SETUP.md) **dan** `.env.example`
5. Menemukan bug baru → tambahkan ke [ISSUES.md](./ISSUES.md) dengan nomor `HSM-0XX` berikutnya

Detail lengkap ada di [AI_RULES.md](./AI_RULES.md).
