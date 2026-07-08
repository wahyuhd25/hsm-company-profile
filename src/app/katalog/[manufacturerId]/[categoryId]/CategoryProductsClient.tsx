"use client";

import { useState } from "react";
import styles from "../../katalog-page.module.css";

interface SubCategory {
  id: number;
  num: string;
  name: string;
}

interface Product {
  id: number;
  kodeBarang: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  subCategory: SubCategory;
}

interface Manufacturer {
  id: number;
  name: string;
  logoUrl: string | null;
  desc: string | null;
}

interface Category {
  id: number;
  num: string;
  name: string;
  desc: string;
}

interface Props {
  mfr: Manufacturer;
  cat: Category;
  products: Product[];
}

export default function CategoryProductsClient({ mfr, cat, products }: Props) {
  const [activeImage, setActiveImage] = useState<{ url: string; name: string } | null>(null);

  const handleCardClick = (imageUrl: string | null, name: string) => {
    if (imageUrl) {
      setActiveImage({ url: imageUrl, name });
    }
  };

  return (
    <>
      {/* Navigation and Breadcrumbs Bar */}
      <div style={{ backgroundColor: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)", padding: "1rem var(--page-padding-x)" }}>
        <div style={{ maxWidth: "var(--container-max-width)", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          
          {/* Back to main web page button */}
          <a href="/" className={styles.btnBackMain}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }}>
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Kembali ke Beranda
          </a>

          {/* Inline breadcrumbs */}
          <nav className={styles.pageBreadcrumb}>
            <a href="/#katalog" className={styles.bcLink}>Katalog</a>
            <span className={styles.bcSep}>›</span>
            <a href={`/katalog/${mfr.id}`} className={styles.bcLink}>{mfr.name}</a>
            <span className={styles.bcSep}>›</span>
            <span className={styles.bcCurrent}>{cat.name}</span>
          </nav>

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
              {mfr.name} &nbsp;·&nbsp; {cat.num}
            </div>
            <h1 className={styles.heroTitle}>{cat.name}</h1>
            <p className={styles.heroSub}>{cat.desc}</p>
          </div>
        </div>
      </div>

      {/* Product Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.sectionLabel}>
          <span className={styles.sectionLabelText}>Daftar Produk</span>
          <span className={styles.sectionLabelLine} />
          <span className={styles.sectionLabelText}>{products.length} Item</span>
        </div>

        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Tidak ada produk</h3>
            <p>Belum ada produk aktif untuk kategori ini.</p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {products.map((product) => (
              <div
                key={product.id}
                className={styles.productCard}
                id={`prod-${product.id}`}
                onClick={() => handleCardClick(product.imageUrl, product.name)}
                style={{ cursor: product.imageUrl ? "pointer" : "default" }}
              >
                {/* Image */}
                <div className={styles.prodImgWrap}>
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className={styles.prodImg}
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
                </div>

                {/* Body */}
                <div className={styles.prodBody}>
                  {product.kodeBarang && (
                    <span className={styles.prodCode}>{product.kodeBarang}</span>
                  )}
                  <p className={styles.prodName}>{product.name}</p>
                  <span className={styles.prodSub}>{product.subCategory.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Lightbox Modal */}
      {activeImage && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setActiveImage(null)}
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className={styles.lightboxClose}
              onClick={() => setActiveImage(null)}
              aria-label="Tutup gambar"
            >
              ✕
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.url}
              alt={activeImage.name}
              className={styles.lightboxImage}
            />
            
            <p className={styles.lightboxName}>{activeImage.name}</p>
          </div>
        </div>
      )}
    </>
  );
}
