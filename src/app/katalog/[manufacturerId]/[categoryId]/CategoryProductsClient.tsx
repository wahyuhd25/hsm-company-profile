"use client";

import { useState } from "react";
import Link from "next/link";
import SafeImage from "@/app/components/SafeImage";
import styles from "../../katalog-page.module.css";

interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productKind: string | null;
  fixationType?: string | null;
}

interface Manufacturer {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
  desc: string | null;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  desc: string | null;
}

interface Props {
  mfr: Manufacturer;
  cat: Category;
  products: Product[];
}

export default function CategoryProductsClient({ mfr, cat, products }: Props) {
  const [activeImage, setActiveImage] = useState<{ url: string; name: string } | null>(null);
  const [filter, setFilter] = useState<'unlocking' | 'locking'>('unlocking');
  const [searchQuery, setSearchQuery] = useState("");

  const handleCardClick = (imageUrl: string | null, name: string) => {
    if (imageUrl) {
      setActiveImage({ url: imageUrl, name });
    }
  };

  // Determine if this category has locking/non-locking variants
  const hasLocking = products.some(p => p.fixationType === 'locking');
  const hasUnlocking = products.some(p => p.fixationType === 'non_locking');
  const showTabs = hasLocking && hasUnlocking;

  const filteredProducts = products.filter(p => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      const matchKind = p.productKind?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchKind && !matchDesc) {
        return false;
      }
    }

    if (!showTabs) return true; // Show all if tabs aren't needed
    if (filter === 'locking') {
      return p.fixationType === 'locking'; // Only locking
    } else {
      // User specifically requested: "halaman unlocking itu berisikan locking dan unlocking"
      return true; // Show both locking and non-locking when in 'unlocking' mode
    }
  });

  return (
    <>
      {/* Navigation and Breadcrumbs Bar */}
      <div style={{ backgroundColor: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)", padding: "1rem var(--page-padding-x)" }}>
        <div style={{ maxWidth: "var(--container-max-width)", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          
          {/* Back to main web page button */}
          <Link href="/" className={styles.btnBackMain}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }}>
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Kembali ke Beranda
          </Link>

          {/* Inline breadcrumbs */}
          <nav className={styles.pageBreadcrumb}>
            <Link href="/#katalog" className={styles.bcLink}>Katalog</Link>
            <span className={styles.bcSep}>›</span>
            <Link href={`/katalog/${mfr.slug}`} className={styles.bcLink}>{mfr.name}</Link>
            <span className={styles.bcSep}>›</span>
            <span className={styles.bcCurrent}>{cat.name}</span>
          </nav>

        </div>
      </div>

      {/* Page Hero */}
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          {mfr.logoUrl && (
            <SafeImage src={mfr.logoUrl} alt={`Logo ${mfr.name}`} className={styles.heroLogo} fallback={null} />
          )}
          <div className={styles.heroText}>
            <div className={styles.heroEyebrow}>
              <span className={styles.heroEyebrowDot} />
              {mfr.name}
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
          <span className={styles.sectionLabelText}>{filteredProducts.length} Item</span>
        </div>

        {/* Real-time Search Input */}
        <div style={{ maxWidth: "460px", margin: "0 auto 2rem auto", position: "relative" }}>
          <input
            type="text"
            placeholder="Cari nama produk atau kode (contoh: MRT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.6rem",
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-text-primary)",
              fontSize: "0.875rem",
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: "4px",
                fontSize: "14px",
              }}
              aria-label="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {/* Locking / Unlocking Tabs */}
        {showTabs && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
             <button 
               onClick={() => setFilter('unlocking')}
               className={filter === 'unlocking' ? styles.filterBtnActive : styles.filterBtn}
             >
               Unlocking Series
             </button>
             <button 
               onClick={() => setFilter('locking')}
               className={filter === 'locking' ? styles.filterBtnActive : styles.filterBtn}
             >
               Locking Series
             </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Tidak ada produk</h3>
            <p>Belum ada produk aktif untuk kategori ini.</p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={styles.productCard}
                id={`prod-${product.id}`}
              >
                {/* Image - Click to open Lightbox */}
                <div 
                  className={styles.prodImgWrap} 
                  onClick={() => handleCardClick(product.imageUrl, product.name)}
                  style={{ cursor: product.imageUrl ? "pointer" : "default" }}
                >
                  {product.imageUrl ? (
                    <SafeImage
                      src={product.imageUrl}
                      alt={product.name}
                      className={styles.prodImg}
                      fallback={
                        <div className={styles.prodImgPlaceholder}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>No Image</span>
                        </div>
                      }
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

                {/* Body - Link to detail page */}
                <Link href={`/katalog/${mfr.slug}/${cat.slug}/${product.id}`} className={styles.prodBodyLink} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className={styles.prodBody}>
                    <span className={styles.prodCode}>{product.id}</span>
                    <p className={styles.prodName}>{product.name}</p>
                    {product.productKind && (
                       <span className={styles.prodSub}>{product.productKind}</span>
                    )}
                    <div className={styles.btnDetailText}>Lihat Detail →</div>
                  </div>
                </Link>
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

            <SafeImage
              src={activeImage.url}
              alt={activeImage.name}
              className={styles.lightboxImage}
              fallback={<p className={styles.lightboxName}>Gambar gagal dimuat.</p>}
            />
            
            <p className={styles.lightboxName}>{activeImage.name}</p>
          </div>
        </div>
      )}
    </>
  );
}
