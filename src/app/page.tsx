import Navbar from "./components/Navbar";
import Image from "next/image";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Katalog from "./components/Katalog";
import Kontak from "./components/Kontak";

export const revalidate = 3600; // Cache for 1 hour (ISR)

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "PT. Hartindo Surya Medika",
    url: "https://hartindosuryamedika.com",
    logo: "https://hartindosuryamedika.com/hsm-building.png",
    description:
      "Distributor produk implan dan instrumen medis ortopedi berkualitas dan terpercaya di Indonesia.",
    telephone: "+628114456789",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Makassar",
      addressCountry: "ID",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

              {/* Stats replaced with Value Propositions, shifted up slightly */}
              <div className="hero__stats hero__stats--values animate-in animate-in-delay-4" aria-label="Mengapa Memilih Kami">
                <div className="stat-item">
                  <div className="stat-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="m9 11 2 2 4-4"/>
                    </svg>
                  </div>
                  <div className="stat-number">
                    Terpercaya
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <div className="stat-number">
                    Cepat Tanggap
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6"/>
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                  </div>
                  <div className="stat-number">
                    Mutu Premium
                  </div>
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

      {/* ── About Section ── */}
      <section className="about" id="tentang" aria-label="Tentang Kami">
        <div className="about__container">
          
          {/* Header + Editorial Paragraph Description */}
          <div className="about__header">
            <div className="about__header-left">
              <div className="about__eyebrow">
                <span className="about__eyebrow-dot" /> Tentang Kami
              </div>
              <h2 className="about__heading">
                Komitmen Kami untuk Dunia Ortopedi
              </h2>
            </div>
            <div className="about__header-right">
              <p className="about__description">
                PT. Hartindo Surya Medika (HSM) hadir sebagai mitra tepercaya bagi institusi medis dan para profesional kesehatan dalam penyediaan implan ortopedi serta instrumen bedah berkualitas tinggi. Berbasis di Makassar, kami berkomitmen untuk mendukung setiap tindakan bedah dengan mendistribusikan produk implan tulang (bone plates &amp; screws), fiksasi eksternal, hingga peralatan bedah bermutu premium yang telah memiliki izin edar resmi dari Kementerian Kesehatan RI.
              </p>
              <p className="about__description">
                Dengan mengedepankan keandalan mutu produk, ketepatan waktu distribusi untuk kebutuhan darurat, serta skema kerja sama layanan konsinyasi yang fleksibel, kami berdedikasi mendampingi rumah sakit dan klinik dalam memberikan pelayanan medis terbaik dan tepercaya demi kesembuhan pasien.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Catalog Section ── */}
      <Katalog />

      {/* ── Contact Section ── */}
      <Kontak />

      {/* ── Dev Theme Switcher Button ── */}
      {process.env.NODE_ENV === "development" && <ThemeSwitcher />}
    </>
  );
}
