import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} from "@/app/actions/katalog";
import AdminHeader from "../../components/AdminHeader";
import DeleteConfirmButton from "../../components/DeleteConfirmButton";
import styles from "../katalog-admin.module.css";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{
    sub?: string;
    editSub?: string;
    editProd?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
  return { title: `Sub & Produk: ${category?.name || "Kategori"} | HSM Admin` };
}

export default async function CategoryProductsAdminPage({ params, searchParams }: Props) {
  const { categoryId } = await params;
  const { sub, editSub, editProd } = await searchParams;

  const catId = Number(categoryId);
  const activeSubId = sub ? Number(sub) : null;
  const editSubId = editSub ? Number(editSub) : null;
  const editProdId = editProd ? Number(editProd) : null;

  // 1. Fetch parent Category with its subcategories and manufacturer
  const category = await prisma.category.findUnique({
    where: { id: catId },
    include: {
      manufacturer: true,
      subCategories: {
        orderBy: { id: "asc" },
        include: {
          _count: { select: { products: true } },
        },
      },
    },
  });

  if (!category) notFound();

  // 2. Fetch products under this Category
  // If activeSubId is set, filter by subcategory. Otherwise return all products under this Category's subcategories.
  const products = await prisma.product.findMany({
    where: {
      subCategory: {
        categoryId: catId,
      },
      ...(activeSubId ? { subCategoryId: activeSubId } : {}),
    },
    include: {
      subCategory: true,
    },
    orderBy: { id: "asc" },
  });

  const editingSub = editSubId
    ? category.subCategories.find((s) => s.id === editSubId)
    : null;

  const editingProd = editProdId
    ? products.find((p) => p.id === editProdId)
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.grid} />
      <AdminHeader backHref="/admin/katalog" backLabel="Kembali ke Katalog" />

      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <a href="/admin" className={styles.breadcrumbLink}>Admin</a>
          <span className={styles.breadcrumbSep}>›</span>
          <a href="/admin/katalog" className={styles.breadcrumbLink}>Katalog</a>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{category.name}</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{category.name}</h1>
          <p className={styles.pageSub}>
            Kelola sub kategori &amp; daftar produk di bawah kategori ini (Manufakturer: {category.manufacturer?.name || "—"})
          </p>
        </div>

        {/* Layout: Sidebar Subcategories, Content Products */}
        <div className={styles.adminGrid}>
          
          {/* COLUMN 1: SUBCATEGORIES MANAGEMENT */}
          <div className={styles.colLeft}>
            {/* SubCategory Form */}
            <div className={styles.formCardCompact}>
              <h3 className={styles.formTitleCompact}>
                {editingSub ? "Edit Sub Kategori" : "Tambah Sub Kategori"}
              </h3>
              <form action={editingSub ? updateSubCategory : createSubCategory}>
                <input type="hidden" name="categoryId" value={catId} />
                {editingSub && <input type="hidden" name="id" value={editingSub.id} />}
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Nomor Urut</label>
                  <input className={styles.formInputCompact} type="text" name="num" defaultValue={editingSub?.num || ""} placeholder="01.A" required />
                </div>
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Nama Sub Kategori</label>
                  <input className={styles.formInputCompact} type="text" name="name" defaultValue={editingSub?.name || ""} placeholder="Locking Stainless Steel" required />
                </div>
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Deskripsi</label>
                  <input className={styles.formInputCompact} type="text" name="desc" defaultValue={editingSub?.desc || ""} placeholder="Deskripsi singkat" />
                </div>
                <div className={styles.formActionsCompact}>
                  <button type="submit" className={styles.btnPrimaryCompact}>
                    {editingSub ? "Simpan" : "Tambah"}
                  </button>
                  {editingSub && (
                    <a href={`/admin/katalog/${catId}`} className={styles.btnSecondaryCompact}>Batal</a>
                  )}
                </div>
              </form>
            </div>

            {/* SubCategories list */}
            <div className={styles.listContainer}>
              <h4 className={styles.sectionHeading}>Daftar Sub Kategori</h4>
              <div className={styles.mfrList}>
                {/* Option to show all products */}
                <div className={`${styles.mfrItem} ${!activeSubId ? styles.mfrItemActive : ""}`}>
                  <a href={`/admin/katalog/${catId}`} className={styles.mfrItemLink}>
                    <span className={styles.mfrItemName}>Semua Sub Kategori</span>
                    <span className={styles.mfrItemCount}>({category.subCategories.reduce((s, c) => s + c._count.products, 0)} item)</span>
                  </a>
                </div>

                {category.subCategories.map((s) => {
                  const isActive = s.id === activeSubId;
                  return (
                    <div
                      key={s.id}
                      className={`${styles.mfrItem} ${isActive ? styles.mfrItemActive : ""}`}
                    >
                      <a href={`/admin/katalog/${catId}?sub=${s.id}`} className={styles.mfrItemLink}>
                        <span className={styles.mfrItemName}>{s.num} - {s.name}</span>
                        <span className={styles.mfrItemCount}>({s._count.products} item)</span>
                      </a>
                      <div className={styles.mfrItemActions}>
                        <a href={`/admin/katalog/${catId}?editSub=${s.id}`} className={styles.btnIconEdit} title="Edit">
                          ✎
                        </a>
                        <DeleteConfirmButton
                          action={deleteSubCategory}
                          confirmMessage={`Hapus sub kategori "${s.name}"? Semua produk di dalamnya akan ikut terhapus.`}
                          className={styles.btnIconDelete}
                          title="Hapus"
                          fields={{ id: s.id, categoryId: catId }}
                        >
                          ✕
                        </DeleteConfirmButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: PRODUCTS MANAGEMENT */}
          <div className={styles.colRight}>
            
            {category.subCategories.length === 0 ? (
              <div className={styles.emptyStateContainer}>
                <p>Silakan buat sub kategori terlebih dahulu di kolom sebelah kiri untuk dapat menambahkan produk.</p>
              </div>
            ) : (
              <>
                {/* Product Add/Edit Form */}
                <div className={styles.formCard}>
                  <p className={styles.formTitle}>
                    {editingProd ? `Edit Produk: ${editingProd.name}` : "Tambah Produk Baru"}
                  </p>
                  <form action={editingProd ? updateProduct : createProduct}>
                    <input type="hidden" name="categoryId" value={catId} />
                    {editingProd && <input type="hidden" name="id" value={editingProd.id} />}
                    <div className={styles.formGridProduct}>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Sub Kategori</label>
                        <select
                          className={styles.formInput}
                          name="subCategoryId"
                          defaultValue={editingProd?.subCategoryId || activeSubId || category.subCategories[0]?.id}
                          required
                          style={{ appearance: "auto" }}
                        >
                          {category.subCategories.map((subItem) => (
                            <option key={subItem.id} value={subItem.id}>
                              {subItem.num} - {subItem.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Nama Produk</label>
                        <input className={styles.formInput} type="text" name="name" defaultValue={editingProd?.name || ""} placeholder="Misal: Clavicle Locking Hook Plate" required />
                      </div>
                    </div>
                    <div className={styles.formGridProduct}>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Kode Barang (Opsional)</label>
                        <input className={styles.formInput} type="text" name="kodeBarang" defaultValue={editingProd?.kodeBarang || ""} placeholder="Misal: MNI-028" />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>URL Foto Produk</label>
                        <input className={styles.formInput} type="url" name="imageUrl" defaultValue={editingProd?.imageUrl || ""} placeholder="https://..." />
                      </div>
                    </div>
                    <div className={styles.formGrid2} style={{ marginTop: "1.125rem" }}>
                      <div className={styles.formFieldFull}>
                        <label className={styles.formLabel}>Deskripsi Produk (Opsional)</label>
                        <input className={styles.formInput} type="text" name="description" defaultValue={editingProd?.description || ""} placeholder="Deskripsi singkat produk" />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button type="submit" className={styles.btnPrimary}>
                        {editingProd ? "Simpan Perubahan" : "Tambah Produk"}
                      </button>
                      {editingProd && (
                        <a href={`/admin/katalog/${catId}${activeSubId ? `?sub=${activeSubId}` : ""}`} className={styles.btnSecondary}>
                          Batal
                        </a>
                      )}
                    </div>
                  </form>
                </div>

                {/* Products list table */}
                <div className={styles.tableCard}>
                  <div className={styles.tableHeader}>
                    <p className={styles.tableTitle}>
                      Daftar Produk ({activeSubId ? "Filter Aktif" : "Semua"})
                      <span className={styles.tableCount}>{products.length}</span>
                    </p>
                  </div>

                  {products.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyTitle}>Belum ada produk</p>
                      <p className={styles.emptyText}>Tambahkan produk pertama menggunakan form di atas.</p>
                    </div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.th}>Gambar</th>
                          <th className={styles.th}>Kode</th>
                          <th className={styles.th}>Nama Produk</th>
                          <th className={styles.th}>Sub Kategori</th>
                          <th className={styles.th}>Status</th>
                          <th className={styles.th}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className={styles.tr}>
                            <td className={styles.td}>
                              {p.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.imageUrl} alt="" className={styles.imgPreview} />
                              ) : (
                                <div className={styles.noImg}>No img</div>
                              )}
                            </td>
                            <td className={styles.td}>
                              {p.kodeBarang ? (
                                <span className={styles.itemCode}>{p.kodeBarang}</span>
                              ) : (
                                <span style={{ color: "#cbd5e1" }}>—</span>
                              )}
                            </td>
                            <td className={styles.td}>
                              <span className={styles.itemName}>{p.name}</span>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.subCount}>{p.subCategory.name}</span>
                            </td>
                            <td className={styles.td}>
                              <span className={`${styles.statusBadge} ${p.isActive ? styles.statusActive : styles.statusInactive}`}>
                                {p.isActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>
                            <td className={styles.td}>
                              <div className={styles.actions}>
                                <a
                                  href={`/admin/katalog/${catId}?editProd=${p.id}${activeSubId ? `&sub=${activeSubId}` : ""}`}
                                  className={styles.btnEdit}
                                >
                                  Edit
                                </a>
                                <form action={toggleProduct}>
                                  <input type="hidden" name="id" value={p.id} />
                                  <input type="hidden" name="isActive" value={String(p.isActive)} />
                                  <input type="hidden" name="categoryId" value={catId} />
                                  <button type="submit" className={p.isActive ? styles.btnToggleOn : styles.btnToggleOff}>
                                    {p.isActive ? "Matikan" : "Aktifkan"}
                                  </button>
                                </form>
                                <DeleteConfirmButton
                                  action={deleteProduct}
                                  confirmMessage={`Hapus produk "${p.name}"?`}
                                  className={styles.btnDelete}
                                  fields={{ id: p.id, categoryId: catId }}
                                >
                                  Hapus
                                </DeleteConfirmButton>
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
