"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
        <Link href="/" className="navbar__logo" aria-label="HSM - PT. Hartindo Surya Medika">
          HSM
        </Link>
        <ul className="navbar__nav">
          <li><Link href="/#beranda">Beranda</Link></li>
          <li><Link href="/#tentang">Tentang Kami</Link></li>
          <li><Link href="/#katalog">Katalog</Link></li>
          <li><Link href="/#kontak">Kontak</Link></li>
        </ul>
        <Link href="/login" className="navbar__cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px", marginTop: "-2px" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Login Admin
        </Link>
      </div>
    </nav>
  );
}

