import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SafeImage from "@/app/components/SafeImage";
import styles from "../../../katalog-page.module.css";
import type { Metadata } from "next";

export const revalidate = 3600; // Cache for 1 hour

interface Props {
  params: Promise<{ manufacturerId: string; categoryId: string; productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  
  if (!product) return { title: "Produk Tidak Ditemukan" };
  
  return {
    title: `${product.name} | PT. Hartindo Surya Medika`,
    description: product.description || `Detail spesifikasi produk ${product.name}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { manufacturerId, categoryId, productId } = await params;

  // 1. Fetch Manufacturer & Category for Breadcrumbs
  const manufacturer = await prisma.manufacturer.findUnique({
    where: { slug: manufacturerId },
  });

  const category = await prisma.category.findUnique({
    where: { slug: categoryId },
  });

  if (!manufacturer || !category) notFound();

  // 2. Fetch Product with ImplantSpecs & Components
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      implantSpecs: {
        orderBy: { sortOrder: "asc" }
      },
      components: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!product) notFound();

  const hasImplantSpecs = product.implantSpecs && product.implantSpecs.length > 0;
  const hasComponents = product.components && product.components.length > 0;

  return (
    <div className={styles.page}>
      {/* ── Breadcrumb Bar ── */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbInner}>
          <Link href="/#katalog" className={styles.bcLink}>Katalog</Link>
          <span className={styles.bcSep}>›</span>
          <Link href={`/katalog/${manufacturer.slug}`} className={styles.bcLink}>{manufacturer.name}</Link>
          <span className={styles.bcSep}>›</span>
          <Link href={`/katalog/${manufacturer.slug}/${category.slug}`} className={styles.bcLink}>{category.name}</Link>
          <span className={styles.bcSep}>›</span>
          <span className={styles.bcCurrent}>{product.name}</span>
        </div>
      </div>

      <div className={styles.contentArea} style={{ padding: "3rem var(--page-padding-x)" }}>
        
        {/* ── Product Hero Info ── */}
        <div className={styles.detailHeroGrid}>
          {/* Left: Image */}
          <div className={styles.detailImageWrap}>
            {product.imageUrl ? (
              <SafeImage
                src={product.imageUrl}
                alt={product.name}
                className={styles.detailImage}
                fallback={<div className={styles.prodImgPlaceholder}>Gagal memuat gambar</div>}
              />
            ) : (
              <div className={styles.prodImgPlaceholder}>Tidak ada gambar</div>
            )}
          </div>
          
          {/* Right: Info */}
          <div className={styles.detailInfoWrap}>
            <div className={styles.detailMeta}>
              <span className={styles.detailCode}>{product.id}</span>
              {product.productKind && (
                <span className={styles.detailBadge}>{product.productKind.toUpperCase()}</span>
              )}
            </div>
            
            <h1 className={styles.detailTitle}>{product.name}</h1>
            
            {product.description && (
              <p className={styles.detailDesc}>{product.description}</p>
            )}
            
            <div className={styles.detailSpecSummary}>
              {product.materialDisplay && (
                <div className={styles.specSummaryItem}>
                  <span className={styles.specSummaryLabel}>Material Utama</span>
                  <span className={styles.specSummaryValue}>{product.materialDisplay}</span>
                </div>
              )}
            </div>
            
            <Link href={`/katalog/${manufacturer.slug}/${category.slug}`} className={styles.btnBackMain} style={{ marginTop: "2rem", display: "inline-flex" }}>
              ← Kembali ke Kategori
            </Link>
          </div>
        </div>

        {/* ── Variations Table (ImplantSpecs) ── */}
        {hasImplantSpecs && (
          <div className={styles.specTableSection}>
            <div className={styles.sectionLabel} style={{ marginTop: "4rem" }}>
              <span className={styles.sectionLabelText}>Tabel Variasi Produk</span>
              <span className={styles.sectionLabelLine} />
              <span className={styles.sectionLabelText}>{product.implantSpecs.length} Ukuran</span>
            </div>
            
            <div className={styles.tableResponsive}>
              <table className={styles.detailTable}>
                <thead>
                  <tr>
                    <th>Nomor Katalog</th>
                    <th>Ukuran / Spesifikasi</th>
                    <th>Material</th>
                    <th>Status TKDN</th>
                    <th>e-Katalog</th>
                  </tr>
                </thead>
                <tbody>
                  {product.implantSpecs.map(spec => (
                    <tr key={spec.id}>
                      <td className={styles.tdCode}>{spec.catalogNumber || "-"}</td>
                      <td>{spec.size || "-"}</td>
                      <td>{spec.material || "-"}</td>
                      <td>
                        {spec.tkdn ? (
                          <span className={spec.tkdn.toLowerCase().includes("process") ? styles.badgePending : styles.badgeSuccess}>
                            {spec.tkdn}
                          </span>
                        ) : "-"}
                      </td>
                      <td>{spec.eCatalog || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Components Table (ProductComponent) ── */}
        {hasComponents && (
          <div className={styles.specTableSection}>
            <div className={styles.sectionLabel} style={{ marginTop: "4rem" }}>
              <span className={styles.sectionLabelText}>Komponen Produk</span>
              <span className={styles.sectionLabelLine} />
              <span className={styles.sectionLabelText}>{product.components.length} Komponen</span>
            </div>
            
            <div className={styles.tableResponsive}>
              <table className={styles.detailTable}>
                <thead>
                  <tr>
                    <th>Prod No.</th>
                    <th>Cat No.</th>
                    <th>Nama Komponen</th>
                    <th>Spesifikasi</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {product.components.map(comp => (
                    <tr key={comp.id}>
                      <td className={styles.tdCode}>{comp.productNumber || "-"}</td>
                      <td className={styles.tdCode}>{comp.catalogNumber || "-"}</td>
                      <td style={{ fontWeight: 600 }}>{comp.componentName}</td>
                      <td>{comp.specification || "-"}</td>
                      <td>{comp.qty || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
