import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/app/components/Navbar";
import styles from "../katalog-page.module.css";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ manufacturerId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { manufacturerId } = await params;
  const mfr = await prisma.manufacturer.findUnique({
    where: { id: Number(manufacturerId) },
  });
  return {
    title: mfr
      ? `${mfr.name} — Katalog | PT. Hartindo Surya Medika`
      : "Katalog | PT. Hartindo Surya Medika",
    description: mfr?.desc,
  };
}
export async function generateStaticParams() {
  const manufacturers = await prisma.manufacturer.findMany({
    select: { id: true },
  });
  return manufacturers.map((mfr) => ({
    manufacturerId: String(mfr.id),
  }));
}

export const dynamicParams = true; // Support dynamic parameters for runtime additions
export default async function ManufacturerCatalogPage({ params }: Props) {
  const { manufacturerId } = await params;
  const mfr = await prisma.manufacturer.findUnique({
    where: { id: Number(manufacturerId) },
    include: {
      categories: {
        orderBy: { id: "asc" },
        include: {
          subCategories: {
            include: {
              _count: {
                select: { products: true },
              },
            },
          },
        },
      },
    },
  });

  if (!mfr) notFound();

  const categories = mfr.categories.map((cat) => {
    const productCount = cat.subCategories.reduce(
      (sum, sub) => sum + sub._count.products,
      0
    );
    return {
      ...cat,
      productCount,
    };
  });

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Breadcrumb */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbInner}>
          <a href="/#katalog" className={styles.bcLink}>Katalog</a>
          <span className={styles.bcSep}>›</span>
          <span className={styles.bcCurrent}>{mfr.name}</span>
        </div>
      </div>

      {/* Page Hero */}
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          {mfr.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mfr.logoUrl} alt={`Logo ${mfr.name}`} className={styles.heroLogo} />
          )}
          <div className={styles.heroText}>
            <div className={styles.heroEyebrow}>
              <span className={styles.heroEyebrowDot} />
              Manufakturer
            </div>
            <h1 className={styles.heroTitle}>{mfr.name}</h1>
            <p className={styles.heroSub}>{mfr.desc}</p>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className={styles.contentArea}>
        <div className={styles.sectionLabel}>
          <span className={styles.sectionLabelText}>Pilih Kategori Produk</span>
          <span className={styles.sectionLabelLine} />
          <span className={styles.sectionLabelText}>{categories.length} Kategori</span>
        </div>

        {categories.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Belum ada kategori</h3>
            <p>Kategori produk untuk manufakturer ini segera ditambahkan.</p>
          </div>
        ) : (
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/katalog/${mfr.id}/${cat.id}`}
                className={styles.categoryCard}
                id={`cat-card-${cat.id}`}
              >
                {/* Image */}
                <div className={styles.catImgWrap}>
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className={styles.catImg}
                    />
                  ) : (
                    <div className={styles.prodImgPlaceholder}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>No Image</span>
                    </div>
                  )}
                  <span className={styles.catNum}>{cat.num}</span>
                </div>

                {/* Body */}
                <div className={styles.catBody}>
                  <div>
                    <h2 className={styles.catName}>{cat.name}</h2>
                    <p className={styles.catDesc}>{cat.desc}</p>
                  </div>
                  <div className={styles.catFooter}>
                    <span className={styles.catCount}>
                      {cat.productCount} produk aktif
                    </span>
                    <span className={styles.catLink}>
                      Lihat Produk
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
