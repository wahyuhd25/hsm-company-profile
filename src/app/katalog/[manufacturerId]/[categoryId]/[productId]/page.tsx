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

export async function generateStaticParams() {
  const catProducts = await prisma.categoryToProduct.findMany({
    where: {
      product: { isActive: true },
      category: { manufacturer: { isNot: null } },
    },
    select: {
      productId: true,
      category: {
        select: {
          slug: true,
          manufacturer: {
            select: { slug: true },
          },
        },
      },
    },
  });

  return catProducts
    .filter((cp) => cp.category.manufacturer !== null)
    .map((cp) => ({
      manufacturerId: cp.category.manufacturer!.slug,
      categoryId: cp.category.slug,
      productId: cp.productId,
    }));
}

export const dynamicParams = true;

export default async function ProductDetailPage({ params }: Props) {
  const { manufacturerId, categoryId, productId } = await params;

  // Fetch Manufacturer, Category, and Product concurrently in parallel
  const [manufacturer, category, product] = await Promise.all([
    prisma.manufacturer.findUnique({
      where: { slug: manufacturerId },
    }),
    prisma.category.findUnique({
      where: { slug: categoryId },
    }),
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        implantSpecs: {
          orderBy: { sortOrder: "asc" },
        },
        components: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  ]);

  if (!manufacturer || !category || !product) notFound();

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
            
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link href={`/katalog/${manufacturer.slug}/${category.slug}`} className={styles.btnBackMain}>
                ← Kembali ke Kategori
              </Link>
              <a
                href={`https://wa.me/628114456789?text=${encodeURIComponent(
                  `Halo PT. Hartindo Surya Medika, saya ingin menanyakan ketersediaan dan informasi untuk produk:\n\n*${product.name}*\nKode Produk: ${product.id}\nManufakturer: ${manufacturer.name}\n\nMohon informasi spesifikasi dan penawarannya. Terima kasih.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.077-1.922-.428-1.564-.646-2.572-2.228-2.65-2.332-.078-.104-.633-.843-.633-1.608 0-.766.4-1.144.542-1.299.143-.156.312-.195.416-.195.104 0 .208.001.299.006.095.006.222-.036.347.264.129.311.442 1.079.481 1.157.039.078.065.169.013.273-.052.104-.078.169-.156.26-.078.091-.164.204-.234.273-.078.078-.16.163-.069.319.091.156.404.667.868 1.079.598.531 1.103.696 1.259.774.156.078.247.065.338-.039.091-.104.39-.455.494-.611.104-.156.208-.13.347-.078.139.052.883.416 1.035.493.152.078.254.117.291.182.037.065.037.378-.107.783z"/>
                </svg>
                Tanya / Pesan via WhatsApp
              </a>
            </div>
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
