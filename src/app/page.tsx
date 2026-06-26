import Navbar from "./components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* ── Navigation ── */}
      <Navbar />

      {/* ── Hero Section ── */}
      <main id="beranda">
        <section className="hero" aria-label="Hero section PT. Hartindo Surya Medika">

          {/* ── Center Content Container ── */}
          <div className="hero__inner">
            {/* Technical grid markers */}
            <div className="hero__inner-marker-tl" aria-hidden="true">+</div>
            <div className="hero__inner-marker-tr" aria-hidden="true">+</div>
            <div className="hero__inner-marker-bl" aria-hidden="true">+</div>
            <div className="hero__inner-marker-br" aria-hidden="true">+</div>

            {/* ── LEFT: Headline, CTA & Stats ── */}
            <div className="hero__left">
              <div className="hero__left-content">
                <div className="hero__eyebrow animate-in">
                  <span className="hero__eyebrow-dot" />
                  Distributor Produk Ortopedi
                </div>

                <h1 className="hero__heading animate-in animate-in-delay-1">
                  PT. Hartindo{" "}
                  <br />
                  Surya Medika<span className="hero__heading-accent">.</span>
                </h1>

                <p className="hero__description animate-in animate-in-delay-2">
                  Mendukung tenaga medis dengan produk ortopedi berkualitas
                  dan layanan yang responsif.
                </p>

                <div className="hero__actions animate-in animate-in-delay-3">
                  <a href="#kontak" className="btn-primary" id="cta-pesan-sekarang">
                    Pesan Sekarang
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                  <a href="#katalog" className="btn-secondary" id="cta-lihat-katalog">
                    Lihat Katalog
                  </a>
                </div>

                {/* Scroll indicator */}
                <div className="scroll-indicator" aria-hidden="true">
                  <span className="scroll-indicator__line" />
                  Scroll
                </div>
              </div>

              {/* Stats integrated inside the left column, sitting flush at bottom */}
              <div className="hero__stats animate-in animate-in-delay-4" aria-label="Statistik perusahaan">
                <div className="stat-item">
                  <div className="stat-number">
                    133K<span>+</span>
                  </div>
                  <p className="stat-desc">Produk Terjual</p>
                </div>

                <div className="stat-item">
                  <div className="stat-number">
                    2800<span>+</span>
                  </div>
                  <p className="stat-desc">Pesanan Selesai</p>
                </div>

                <div className="stat-item">
                  <div className="stat-number">
                    8<span>+</span>
                  </div>
                  <p className="stat-desc">Mitra RS & Konsinyasi</p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Company Photo (Dashboard Box) ── */}
            <div className="hero__right">
              <div className="hero__image-card animate-in animate-in-delay-2" aria-hidden="true">
                <Image
                  src="/hsm-building.png"
                  alt="Gedung PT. Hartindo Surya Medika, Makassar"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  style={{ objectFit: "cover" }}
                />

                {/* Overlay Location Badge */}
                <div className="hero__image-badge">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1C3.5 1 1.5 3 1.5 5.5C1.5 8.75 6 11 6 11C6 11 10.5 8.75 10.5 5.5C10.5 3 8.5 1 6 1ZM6 7C5.17 7 4.5 6.33 4.5 5.5C4.5 4.67 5.17 4 6 4C6.83 4 7.5 4.67 7.5 5.5C7.5 6.33 6.83 7 6 7Z" fill="currentColor" />
                  </svg>
                  Makassar, Indonesia
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
