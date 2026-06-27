"use client";

import { useState } from "react";
import { CATEGORIES_DATA } from "./katalog/data";
import CatalogCard from "./katalog/CatalogCard";
import SubCategoryDrawer from "./katalog/SubCategoryDrawer";

export default function Katalog() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setActiveCategory((prev) => (prev === id ? null : id));
  };

  const activeData = CATEGORIES_DATA.find((c) => c.id === activeCategory);

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
          
          {/* Baris 1: Render Kategori 1 & 2 */}
          {CATEGORIES_DATA.slice(0, 2).map((cat) => (
            <CatalogCard
              key={cat.id}
              {...cat}
              isActive={activeCategory === cat.id}
              onToggle={() => handleToggle(cat.id)}
            />
          ))}

          {/* Drawer untuk Baris 1 */}
          <SubCategoryDrawer
            drawerId={1}
            activeCategory={activeCategory}
            activeData={activeData}
            targetCategories={[1, 2]}
          />

          {/* Baris 2: Render Kategori 3 & 4 */}
          {CATEGORIES_DATA.slice(2, 4).map((cat) => (
            <CatalogCard
              key={cat.id}
              {...cat}
              isActive={activeCategory === cat.id}
              onToggle={() => handleToggle(cat.id)}
            />
          ))}

          {/* Drawer untuk Baris 2 */}
          <SubCategoryDrawer
            drawerId={2}
            activeCategory={activeCategory}
            activeData={activeData}
            targetCategories={[3, 4]}
          />

        </div>
      </div>
    </section>
  );
}
