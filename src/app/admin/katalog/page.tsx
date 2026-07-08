import { prisma } from "@/lib/prisma";
import {
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/actions/katalog";
import AdminHeader from "../components/AdminHeader";
import DeleteConfirmButton from "../components/DeleteConfirmButton";
import styles from "./katalog-admin.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog & Kategori | HSM Admin",
};

interface Props {
  searchParams: Promise<{
    mfr?: string;
    editMfr?: string;
    editCat?: string;
  }>;
}

export default async function CatalogMainAdminPage({ searchParams }: Props) {
  const { mfr, editMfr, editCat } = await searchParams;

  const editMfrId = editMfr ? Number(editMfr) : null;
  const editCatId = editCat ? Number(editCat) : null;

  // 1. Fetch manufacturers
  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: { select: { categories: true } },
    },
  });

  // Determine active manufacturer ID
  const activeMfrId = mfr
    ? Number(mfr)
    : manufacturers[0]?.id || null;

  // 2. Fetch categories for the active manufacturer
  const categories = activeMfrId
    ? await prisma.category.findMany({
        where: { manufacturerId: activeMfrId },
        orderBy: { id: "asc" },
        include: {
          _count: { select: { subCategories: true } },
        },
      })
    : [];

  const editingMfr = editMfrId
    ? manufacturers.find((m) => m.id === editMfrId)
    : null;

  const editingCat = editCatId
    ? categories.find((c) => c.id === editCatId)
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.grid} />
      <AdminHeader backHref="/admin" backLabel="Dashboard Admin" />

      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <a href="/admin" className={styles.breadcrumbLink}>Admin</a>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>Katalog Utama</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Manajemen Katalog Utama</h1>
          <p className={styles.pageSub}>Kelola manufakturer (merk) &amp; kategori produk PT. Hartindo Surya Medika</p>
        </div>

        {/* Unified Two-Column Layout */}
        <div className={styles.adminGrid}>
          
          {/* COLUMN 1: MANUFACTURERS (Left sidebar/list) */}
          <div className={styles.colLeft}>
            
            {/* Manufacturer form (Add / Edit) */}
            <div className={styles.formCardCompact}>
              <h3 className={styles.formTitleCompact}>
                {editingMfr ? "Edit Manufakturer" : "Tambah Manufakturer"}
              </h3>
              <form action={editingMfr ? updateManufacturer : createManufacturer}>
                {editingMfr && <input type="hidden" name="id" value={editingMfr.id} />}
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Nama Merk</label>
                  <input className={styles.formInputCompact} type="text" name="name" defaultValue={editingMfr?.name || ""} placeholder="Marthys Orthopaedics" required />
                </div>
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Slug URL</label>
                  <input className={styles.formInputCompact} type="text" name="slug" defaultValue={editingMfr?.slug || ""} placeholder="marthys" required />
                </div>
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>URL Logo</label>
                  <input className={styles.formInputCompact} type="url" name="logoUrl" defaultValue={editingMfr?.logoUrl || ""} placeholder="https://..." />
                </div>
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Deskripsi</label>
                  <textarea className={styles.formTextareaCompact} name="desc" defaultValue={editingMfr?.desc || ""} placeholder="Deskripsi singkat..." rows={2} />
                </div>
                <div className={styles.formActionsCompact}>
                  <button type="submit" className={styles.btnPrimaryCompact}>
                    {editingMfr ? "Simpan" : "Tambah"}
                  </button>
                  {editingMfr && (
                    <a href="/admin/katalog" className={styles.btnSecondaryCompact}>Batal</a>
                  )}
                </div>
              </form>
            </div>

            {/* Manufacturers list */}
            <div className={styles.listContainer}>
              <h4 className={styles.sectionHeading}>Daftar Manufakturer</h4>
              {manufacturers.length === 0 ? (
                <p className={styles.emptyTextCompact}>Belum ada manufakturer.</p>
              ) : (
                <div className={styles.mfrList}>
                  {manufacturers.map((m) => {
                    const isActive = m.id === activeMfrId;
                    return (
                      <div
                        key={m.id}
                        className={`${styles.mfrItem} ${isActive ? styles.mfrItemActive : ""}`}
                      >
                        <a href={`/admin/katalog?mfr=${m.id}`} className={styles.mfrItemLink}>
                          {m.logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.logoUrl} alt="" className={styles.mfrMiniLogo} />
                          )}
                          <span className={styles.mfrItemName}>{m.name}</span>
                          <span className={styles.mfrItemCount}>({m._count.categories} kat)</span>
                        </a>
                        <div className={styles.mfrItemActions}>
                          <a href={`/admin/katalog?editMfr=${m.id}`} className={styles.btnIconEdit} title="Edit">
                            ✎
                          </a>
                          <DeleteConfirmButton
                            action={deleteManufacturer}
                            confirmMessage={`Hapus manufakturer "${m.name}"? Semua kategori, subkategori, dan produk di dalamnya akan ikut terhapus.`}
                            className={styles.btnIconDelete}
                            title="Hapus"
                            fields={{ id: m.id }}
                          >
                            ✕
                          </DeleteConfirmButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: CATEGORIES (Right content area) */}
          <div className={styles.colRight}>
            {!activeMfrId ? (
              <div className={styles.emptyStateContainer}>
                <p>Silakan buat manufakturer terlebih dahulu di kolom sebelah kiri.</p>
              </div>
            ) : (
              <>
                {/* Category Form */}
                <div className={styles.formCard}>
                  <p className={styles.formTitle}>
                    {editingCat ? `Edit Kategori: ${editingCat.name}` : "Tambah Kategori Baru"}
                  </p>
                  <form action={editingCat ? updateCategory : createCategory}>
                    <input type="hidden" name="manufacturerId" value={activeMfrId} />
                    {editingCat && <input type="hidden" name="id" value={editingCat.id} />}
                    <div className={styles.formGrid}>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Nomor Tampilan</label>
                        <input className={styles.formInput} type="text" name="num" defaultValue={editingCat?.num || ""} placeholder="[ 01 ]" required />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Nama Kategori</label>
                        <input className={styles.formInput} type="text" name="name" defaultValue={editingCat?.name || ""} placeholder="Nama kategori" required />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>URL Gambar Kategori</label>
                        <input className={styles.formInput} type="url" name="imageUrl" defaultValue={editingCat?.imageUrl || ""} placeholder="https://..." />
                      </div>
                    </div>
                    <div className={styles.formGrid2} style={{ marginTop: "1rem" }}>
                      <div className={styles.formFieldFull}>
                        <label className={styles.formLabel}>Deskripsi Singkat</label>
                        <input className={styles.formInput} type="text" name="desc" defaultValue={editingCat?.desc || ""} placeholder="Deskripsi singkat" />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="submit" className={styles.btnPrimary}>
                        {editingCat ? "Simpan Perubahan" : "Tambah Kategori"}
                      </button>
                      {editingCat && (
                        <a href={`/admin/katalog?mfr=${activeMfrId}`} className={styles.btnSecondary}>Batal</a>
                      )}
                    </div>
                  </form>
                </div>

                {/* Categories Table */}
                <div className={styles.tableCard}>
                  <div className={styles.tableHeader}>
                    <p className={styles.tableTitle}>
                      Daftar Kategori Produk
                      <span className={styles.tableCount}>{categories.length}</span>
                    </p>
                  </div>
                  {categories.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyTitle}>Belum ada kategori</p>
                      <p className={styles.emptyText}>Tambahkan kategori pertama untuk manufakturer ini menggunakan form di atas.</p>
                    </div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Gambar</th>
                          <th className={styles.th}>Nomor</th>
                          <th className={styles.th}>Nama Kategori</th>
                          <th className={styles.th}>Sub Kategori</th>
                          <th className={styles.th}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <tr key={cat.id} className={styles.tr}>
                            <td className={styles.td}>
                              {cat.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={cat.imageUrl} alt="" className={styles.imgPreview} />
                              ) : (
                                <div className={styles.noImg}>No img</div>
                              )}
                            </td>
                            <td className={styles.td}>
                              <span className={styles.itemCode}>{cat.num}</span>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.itemName}>{cat.name}</span>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.subCount}>{cat._count.subCategories} sub</span>
                            </td>
                            <td className={styles.td}>
                              <div className={styles.actions}>
                                <a href={`/admin/katalog?mfr=${activeMfrId}&editCat=${cat.id}`} className={styles.btnEdit}>
                                  Edit
                                </a>
                                <DeleteConfirmButton
                                  action={deleteCategory}
                                  confirmMessage={`Hapus kategori "${cat.name}" beserta seluruh subkategori dan produk di dalamnya?`}
                                  className={styles.btnDelete}
                                  fields={{ id: cat.id }}
                                >
                                  Hapus
                                </DeleteConfirmButton>
                                <a href={`/admin/katalog/${cat.id}`} className={styles.btnView}>
                                  Kelola Sub &amp; Produk
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                  </svg>
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
