"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`} role="navigation" aria-label="Navigasi utama">
      <div className="navbar__inner">
        <Link href="/" className="navbar__logo" aria-label="HSM - PT. Hartindo Surya Medika" onClick={() => setMobileOpen(false)}>
          HSM
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar__nav">
          <li><Link href="/#beranda">Beranda</Link></li>
          <li><Link href="/#tentang">Tentang Kami</Link></li>
          <li><Link href="/#katalog">Katalog</Link></li>
          <li><Link href="/#kontak">Kontak</Link></li>
        </ul>

        {/* Desktop CTA */}
        <Link href="/login" className="navbar__cta navbar__cta-desktop">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginTop: "-2px" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Login Admin
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="navbar__mobile-menu">
          <Link href="/#beranda" onClick={() => setMobileOpen(false)}>Beranda</Link>
          <Link href="/#tentang" onClick={() => setMobileOpen(false)}>Tentang Kami</Link>
          <Link href="/#katalog" onClick={() => setMobileOpen(false)}>Katalog Produk</Link>
          <Link href="/#kontak" onClick={() => setMobileOpen(false)}>Hubungi Kami</Link>
          <Link href="/login" className="navbar__mobile-cta" onClick={() => setMobileOpen(false)}>
            Login Admin
          </Link>
        </div>
      )}
    </nav>
  );
}

