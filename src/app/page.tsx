import Navbar from "./components/Navbar";
import Image from "next/image";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Katalog from "./components/Katalog";

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

      {/* ── About Section ── */}
      <section className="about" id="tentang" aria-label="Tentang Kami">
        <div className="about__container">
          
          {/* Row 1: Header + Description */}
          <div className="about__header">
            <div className="about__header-left">
              <div className="about__eyebrow">
                <span className="about__eyebrow-dot" /> Tentang Kami
              </div>
              <h2 className="about__heading">
                Judul Utama Tentang Kami / Misi Perusahaan
              </h2>
            </div>
            <div className="about__header-right">
              <p className="about__description">
                Tulis deskripsi pengantar atau profil singkat perusahaan Anda di sini. Jelaskan secara ringkas nilai utama, komitmen, atau fokus operasional perusahaan yang ingin ditonjolkan kepada calon mitra.
              </p>
            </div>
          </div>

          {/* Grid Title Header */}
          <div className="about__grid-title">
            <h3>Misi & Komitmen Kami</h3>
            <span>TRUSTED PARTNER IN ORTHOPEDICS</span>
          </div>

          {/* Row 2: Grid 4 Pillars */}
          <div className="about__grid">
            
            {/* Card 1: Misi / Komitmen 1 */}
            <div className="about-card">
              <div className="about-card__meta">
                <span className="about-card__num">[ 01 ]</span>
                <div className="about-card__icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>
              <h3>Misi / Komitmen 1</h3>
              <p>Tulis penjelasan singkat mengenai poin misi atau komitmen pertama Anda di sini untuk memberikan informasi detail kepada pengunjung.</p>
            </div>

            {/* Card 2: Misi / Komitmen 2 */}
            <div className="about-card">
              <div className="about-card__meta">
                <span className="about-card__num">[ 02 ]</span>
                <div className="about-card__icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <h3>Misi / Komitmen 2</h3>
              <p>Tulis penjelasan singkat mengenai poin misi atau komitmen kedua Anda di sini untuk memberikan informasi detail kepada pengunjung.</p>
            </div>

            {/* Card 3: Misi / Komitmen 3 */}
            <div className="about-card">
              <div className="about-card__meta">
                <span className="about-card__num">[ 03 ]</span>
                <div className="about-card__icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                    <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
                    <polygon points="12 12 21 6.92 21 17.08 12 22.08" />
                    <polygon points="12 2 21 6.92 12 12 3 6.92 12 2" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
              </div>
              <h3>Misi / Komitmen 3</h3>
              <p>Tulis penjelasan singkat mengenai poin misi atau komitmen ketiga Anda di sini untuk memberikan informasi detail kepada pengunjung.</p>
            </div>

            {/* Card 4: Misi / Komitmen 4 */}
            <div className="about-card">
              <div className="about-card__meta">
                <span className="about-card__num">[ 04 ]</span>
                <div className="about-card__icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
              </div>
              <h3>Misi / Komitmen 4</h3>
              <p>Tulis penjelasan singkat mengenai poin misi atau komitmen keempat Anda di sini untuk memberikan informasi detail kepada pengunjung.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Catalog Section ── */}
      <Katalog />

      {/* ── Dev Theme Switcher Button ── */}
      <ThemeSwitcher />
    </>
  );
}
