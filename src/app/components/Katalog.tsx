import { prisma } from "@/lib/prisma";

/**
 * Katalog section on the landing page.
 * Shows manufacturer (supplier) cards that link to /katalog/[id].
 * Server Component — queries Prisma database directly.
 */
export default async function Katalog() {
  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <section className="catalog" id="katalog" aria-label="Katalog Produk">
      <div className="catalog__container">

        {/* Header */}
        <div className="catalog__header">
          <div className="catalog__header-left">
            <div className="catalog__eyebrow">
              <span className="catalog__eyebrow-dot" />
              Katalog Barang
            </div>
            <h2 className="catalog__heading">
              Merk &amp; Supplier<br />Produk Kami
            </h2>
          </div>
          <div className="catalog__header-right">
            <p className="catalog__description">
              Kami mendistribusikan produk ortopedi dari manufakturer terpercaya.
              Klik salah satu kartu di bawah untuk menelusuri katalog lengkap
              beserta kategori dan produk yang tersedia.
            </p>
          </div>
        </div>

        {/* Manufacturer Cards Grid */}
        <div className="catalog__mfr-grid">
          {manufacturers.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
              Belum ada data manufakturer. Silakan masuk ke admin panel untuk menambahkannya.
            </div>
          ) : (
            manufacturers.map((mfr) => (
              <a
                key={mfr.id}
                href={`/katalog/${mfr.id}`}
                className="catalog__mfr-card"
                id={`mfr-card-${mfr.id}`}
              >
                {/* Logo */}
                <div className="catalog__mfr-logo-wrap">
                  {mfr.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mfr.logoUrl}
                      alt={`Logo ${mfr.name}`}
                      className="catalog__mfr-logo"
                    />
                  ) : (
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>No Logo</div>
                  )}
                </div>

                {/* Info */}
                <div className="catalog__mfr-info">
                  <h3 className="catalog__mfr-name">{mfr.name}</h3>
                  <p className="catalog__mfr-desc">{mfr.desc}</p>
                </div>

                {/* Link */}
                <div className="catalog__mfr-action">
                  <span>Lihat Produk</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </a>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
