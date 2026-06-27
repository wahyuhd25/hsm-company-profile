"use client";

import { useState } from "react";

interface Category {
  id: number;
  num: string;
  name: string;
  desc: string;
  subCategories: {
    num: string;
    name: string;
    desc: string;
  }[];
}

const CATEGORIES_DATA: Category[] = [
  {
    id: 1,
    num: "[ 01 ]",
    name: "Kategori 1",
    desc: "Deskripsi singkat untuk kategori 1 menggunakan teks placeholder untuk menjelaskan jenis barang yang tersedia.",
    subCategories: [
      { num: "01.A", name: "Sub Kategori 1", desc: "Deskripsi placeholder sub kategori 1" },
      { num: "01.B", name: "Sub Kategori 2", desc: "Deskripsi placeholder sub kategori 2" },
      { num: "01.C", name: "Sub Kategori 3", desc: "Deskripsi placeholder sub kategori 3" },
    ],
  },
  {
    id: 2,
    num: "[ 02 ]",
    name: "Kategori 2",
    desc: "Deskripsi singkat untuk kategori 2 menggunakan teks placeholder untuk menjelaskan jenis barang yang tersedia.",
    subCategories: [
      { num: "02.A", name: "Sub Kategori 1", desc: "Deskripsi placeholder sub kategori 1" },
      { num: "02.B", name: "Sub Kategori 2", desc: "Deskripsi placeholder sub kategori 2" },
      { num: "02.C", name: "Sub Kategori 3", desc: "Deskripsi placeholder sub kategori 3" },
      { num: "02.D", name: "Sub Kategori 4", desc: "Deskripsi placeholder sub kategori 4" },
    ],
  },
  {
    id: 3,
    num: "[ 03 ]",
    name: "Kategori 3",
    desc: "Deskripsi singkat untuk kategori 3 menggunakan teks placeholder untuk menjelaskan jenis barang yang tersedia.",
    subCategories: [
      { num: "03.A", name: "Sub Kategori 1", desc: "Deskripsi placeholder sub kategori 1" },
      { num: "03.B", name: "Sub Kategori 2", desc: "Deskripsi placeholder sub kategori 2" },
    ],
  },
  {
    id: 4,
    num: "[ 04 ]",
    name: "Kategori 4",
    desc: "Deskripsi singkat untuk kategori 4 menggunakan teks placeholder untuk menjelaskan jenis barang yang tersedia.",
    subCategories: [
      { num: "04.A", name: "Sub Kategori 1", desc: "Deskripsi placeholder sub kategori 1" },
      { num: "04.B", name: "Sub Kategori 2", desc: "Deskripsi placeholder sub kategori 2" },
      { num: "04.C", name: "Sub Kategori 3", desc: "Deskripsi placeholder sub kategori 3" },
    ],
  },
];

export default function Katalog() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setActiveCategory((prev) => (prev === id ? null : id));
  };

  const getActiveData = () => {
    return CATEGORIES_DATA.find((c) => c.id === activeCategory);
  };

  const activeData = getActiveData();

  return (
    <section className="catalog" id="katalog" aria-label="Katalog Produk">
      <div className="catalog__container">
        
        {/* Header Section */}
        <div className="catalog__header">
          <div className="catalog__header-left">
            <div className="catalog__eyebrow">
              <span className="catalog__eyebrow-dot" /> Katalog Barang
            </div>
            <h2 className="catalog__heading">
              Telusuri Kategori Produk Medis Kami
            </h2>
          </div>
          <div className="catalog__header-right">
            <p className="catalog__description">
              Klik pada salah satu kartu kategori di bawah ini untuk melihat sub-kategori produk ortopedi dan alat medis spesifik yang kami distribusikan.
            </p>
          </div>
        </div>

        {/* 2x2 Grid Catalog Container */}
        <div className="catalog__grid">

          {/* Row 1 Card 1: Kategori 1 */}
          <button
            className={`catalog-card ${activeCategory === 1 ? "is-active" : ""}`}
            onClick={() => handleToggle(1)}
            data-id="1"
            aria-expanded={activeCategory === 1}
          >
            <div className="catalog-card__meta">
              <span className="catalog-card__num">{CATEGORIES_DATA[0].num}</span>
              <span className="catalog-card__indicator">+</span>
            </div>
            <div>
              <h3>{CATEGORIES_DATA[0].name}</h3>
              <p>{CATEGORIES_DATA[0].desc}</p>
            </div>
          </button>

          {/* Row 1 Card 2: Kategori 2 */}
          <button
            className={`catalog-card ${activeCategory === 2 ? "is-active" : ""}`}
            onClick={() => handleToggle(2)}
            data-id="2"
            aria-expanded={activeCategory === 2}
          >
            <div className="catalog-card__meta">
              <span className="catalog-card__num">{CATEGORIES_DATA[1].num}</span>
              <span className="catalog-card__indicator">+</span>
            </div>
            <div>
              <h3>{CATEGORIES_DATA[1].name}</h3>
              <p>{CATEGORIES_DATA[1].desc}</p>
            </div>
          </button>
          
          {/* ────────────────────────────────────────────────────────
              DRAWER 1: Active below Row 1 Cards (Category 1 or 2)
              ──────────────────────────────────────────────────────── */}
          <div
            className={`catalog__sub-drawer ${
              activeCategory === 1 || activeCategory === 2 ? "is-open" : ""
            } ${activeCategory === 2 ? "active-cat-2" : ""}`}
            data-drawer="1"
            aria-hidden={!(activeCategory === 1 || activeCategory === 2)}
          >
            <div className="catalog__sub-content">
              {activeData && (activeCategory === 1 || activeCategory === 2) && (
                <>
                  <div className="catalog__sub-header">
                    <h3 className="catalog__sub-title">
                      Sub Kategori: {activeData.name}
                    </h3>
                    <span className="catalog__sub-count">
                      {activeData.subCategories.length} ITEM DITEMUKAN
                    </span>
                  </div>
                  <div className="catalog__sub-grid">
                    {activeData.subCategories.map((sub, idx) => (
                      <div key={idx} className="catalog__sub-card">
                        <span className="catalog__sub-card-num">[ {sub.num} ]</span>
                        <div>
                          <h4>{sub.name}</h4>
                          <p>{sub.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 2 Card 3: Kategori 3 */}
          <button
            className={`catalog-card ${activeCategory === 3 ? "is-active" : ""}`}
            onClick={() => handleToggle(3)}
            data-id="3"
            aria-expanded={activeCategory === 3}
          >
            <div className="catalog-card__meta">
              <span className="catalog-card__num">{CATEGORIES_DATA[2].num}</span>
              <span className="catalog-card__indicator">+</span>
            </div>
            <div>
              <h3>{CATEGORIES_DATA[2].name}</h3>
              <p>{CATEGORIES_DATA[2].desc}</p>
            </div>
          </button>

          {/* Row 2 Card 4: Kategori 4 */}
          <button
            className={`catalog-card ${activeCategory === 4 ? "is-active" : ""}`}
            onClick={() => handleToggle(4)}
            data-id="4"
            aria-expanded={activeCategory === 4}
          >
            <div className="catalog-card__meta">
              <span className="catalog-card__num">{CATEGORIES_DATA[3].num}</span>
              <span className="catalog-card__indicator">+</span>
            </div>
            <div>
              <h3>{CATEGORIES_DATA[3].name}</h3>
              <p>{CATEGORIES_DATA[3].desc}</p>
            </div>
          </button>

          {/* ────────────────────────────────────────────────────────
              DRAWER 2: Active below Row 2 Cards (Category 3 or 4)
              ──────────────────────────────────────────────────────── */}
          <div
            className={`catalog__sub-drawer ${
              activeCategory === 3 || activeCategory === 4 ? "is-open" : ""
            } ${activeCategory === 4 ? "active-cat-4" : ""}`}
            data-drawer="2"
            aria-hidden={!(activeCategory === 3 || activeCategory === 4)}
          >
            <div className="catalog__sub-content">
              {activeData && (activeCategory === 3 || activeCategory === 4) && (
                <>
                  <div className="catalog__sub-header">
                    <h3 className="catalog__sub-title">
                      Sub Kategori: {activeData.name}
                    </h3>
                    <span className="catalog__sub-count">
                      {activeData.subCategories.length} ITEM DITEMUKAN
                    </span>
                  </div>
                  <div className="catalog__sub-grid">
                    {activeData.subCategories.map((sub, idx) => (
                      <div key={idx} className="catalog__sub-card">
                        <span className="catalog__sub-card-num">[ {sub.num} ]</span>
                        <div>
                          <h4>{sub.name}</h4>
                          <p>{sub.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
