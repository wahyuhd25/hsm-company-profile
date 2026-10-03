import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} from "@/app/actions/katalog";
import AdminHeader from "../../components/AdminHeader";
import DeleteConfirmButton from "../../components/DeleteConfirmButton";
import ImageUploadInput from "../../components/ImageUploadInput";
import SafeImage from "@/app/components/SafeImage";
import styles from "../katalog-admin.module.css";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{
    editProd?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  return { title: `Produk: ${category?.name || "Kategori"} | HSM Admin` };
}

export default async function CategoryProductsAdminPage({ params, searchParams }: Props) {
  const { categoryId } = await params;
  const { editProd } = await searchParams;

  const editProdId = editProd || null;

  // 1. Fetch parent Category and its manufacturer
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      manufacturer: true,
    },
  });

  if (!category) notFound();

  // 2. Fetch products under this Category
  const categoryProducts = await prisma.categoryToProduct.findMany({
    where: { categoryId: category.id },
    include: {
      product: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  // Extract actual products
  const products = categoryProducts.map(cp => ({
    ...cp.product,
    fixationType: cp.fixationType
  }));

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
          <Link href="/admin" className={styles.breadcrumbLink}>Admin</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link href="/admin/katalog" className={styles.breadcrumbLink}>Katalog</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{category.name}</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{category.name}</h1>
          <p className={styles.pageSub}>
            Kelola daftar produk di bawah kategori ini (Manufakturer: {category.manufacturer?.name || "—"})
          </p>
        </div>

        {/* Layout: Sidebar Form, Content Products */}
        <div className={styles.adminGrid}>
          
          {/* COLUMN 1: PRODUCT FORM */}
          <div className={styles.colLeft}>
            <div className={styles.formCardCompact}>
              <h3 className={styles.formTitleCompact}>
                {editingProd ? `Edit Produk: ${editingProd.name}` : "Tambah Produk Baru"}
              </h3>
              <form action={editingProd ? updateProduct : createProduct}>
                <input type="hidden" name="categoryId" value={category.id} />
                
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>ID Produk / Kode Barang</label>
                  {/* If editing, ID is readonly because it's the primary key */}
                  <input className={styles.formInputCompact} type="text" name="id" defaultValue={editingProd?.id || ""} placeholder="Misal: MRT-0002" required readOnly={!!editingProd} style={editingProd ? { backgroundColor: "#f1f5f9" } : {}} />
                </div>
                
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Nama Produk</label>
                  <input className={styles.formInputCompact} type="text" name="name" defaultValue={editingProd?.name || ""} placeholder="Misal: Clavicle Locking Hook Plate" required />
                </div>
                
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Jenis Produk (Opsional)</label>
                  <input className={styles.formInputCompact} type="text" name="productKind" defaultValue={editingProd?.productKind || ""} placeholder="Misal: implant" />
                </div>

                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Fixation Type (Opsional)</label>
                  <select className={styles.formInputCompact} name="fixationType" defaultValue={editingProd?.fixationType || ""}>
                    <option value="">- Tidak Ada -</option>
                    <option value="locking">Locking</option>
                    <option value="non_locking">Non Locking</option>
                  </select>
                </div>

                <ImageUploadInput
                  label="Foto Produk (Opsional)"
                  nameUrl="imageUrl"
                  nameFile="imageFile"
                  defaultValue={editingProd?.imageUrl || ""}
                />
                
                <div className={styles.formFieldCompact}>
                  <label className={styles.formLabelCompact}>Deskripsi Singkat (Opsional)</label>
                  <input className={styles.formInputCompact} type="text" name="description" defaultValue={editingProd?.description || ""} placeholder="Deskripsi singkat produk" />
                </div>
                
                <div className={styles.formActionsCompact}>
                  <button type="submit" className={styles.btnPrimaryCompact}>
                    {editingProd ? "Simpan" : "Tambah"}
                  </button>
                  {editingProd && (
                    <Link href={`/admin/katalog/${category.id}`} className={styles.btnSecondaryCompact}>Batal</Link>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* COLUMN 2: PRODUCTS TABLE */}
          <div className={styles.colRight}>
            
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <p className={styles.tableTitle}>
                  Daftar Produk
                  <span className={styles.tableCount}>{products.length}</span>
                </p>
              </div>

              {products.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyTitle}>Belum ada produk</p>
                  <p className={styles.emptyText}>Tambahkan produk pertama menggunakan form di samping.</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Gambar</th>
                      <th className={styles.th}>ID / Kode</th>
                      <th className={styles.th}>Nama Produk</th>
                      <th className={styles.th}>Fixation</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className={styles.tr}>
                        <td className={styles.td}>
                          {p.imageUrl ? (
                            <SafeImage
                              src={p.imageUrl}
                              alt=""
                              className={styles.imgPreview}
                              fallback={<div className={styles.noImg}>No img</div>}
                            />
                          ) : (
                            <div className={styles.noImg}>No img</div>
                          )}
                        </td>
                        <td className={styles.td}>
                          <span className={styles.itemCode}>{p.id}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.itemName}>{p.name}</span>
                          {p.productKind && (
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                              {p.productKind}
                            </div>
                          )}
                        </td>
                        <td className={styles.td}>
                          <span className={styles.subCount}>{p.fixationType || "—"}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${p.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {p.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actions}>
                            <Link
                              href={`/admin/katalog/${category.id}?editProd=${p.id}`}
                              className={styles.btnEdit}
                            >
                              Edit
                            </Link>
                            <form action={toggleProduct}>
                              <input type="hidden" name="id" value={p.id} />
                              <input type="hidden" name="isActive" value={String(p.isActive)} />
                              <input type="hidden" name="categoryId" value={category.id} />
                              <button type="submit" className={p.isActive ? styles.btnToggleOn : styles.btnToggleOff}>
                                {p.isActive ? "Matikan" : "Aktifkan"}
                              </button>
                            </form>
                            <DeleteConfirmButton
                              action={deleteProduct}
                              confirmMessage={`Hapus produk "${p.name}"?`}
                              className={styles.btnDelete}
                              fields={{ id: p.id, categoryId: category.id }}
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

          </div>

        </div>
      </main>
    </div>
  );
}
