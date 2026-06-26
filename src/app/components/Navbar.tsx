"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`} role="navigation" aria-label="Navigasi utama">
      <div className="navbar__inner">
        <a href="#" className="navbar__logo" aria-label="HSM - PT. Hartindo Surya Medika">
          HSM
        </a>
        <ul className="navbar__nav">
          <li><a href="#beranda">Beranda</a></li>
          <li><a href="#tentang">Tentang Kami</a></li>
          <li><a href="#katalog">Katalog</a></li>
          <li><a href="#kontak">Kontak</a></li>
        </ul>
        <a href="#kontak" className="navbar__cta">
          Hubungi Kami
        </a>
      </div>
    </nav>
  );
}

