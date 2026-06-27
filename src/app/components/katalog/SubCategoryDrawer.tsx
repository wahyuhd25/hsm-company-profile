"use client";

import { Category } from "./types";

interface SubCategoryDrawerProps {
  drawerId: number;
  activeCategory: number | null;
  activeData: Category | undefined;
  targetCategories: number[];
}

export default function SubCategoryDrawer({
  drawerId,
  activeCategory,
  activeData,
  targetCategories,
}: SubCategoryDrawerProps) {
  const isOpen = activeCategory !== null && targetCategories.includes(activeCategory);
  
  // Set dynamic ordering class for CSS grid layout
  const isActiveCat2 = activeCategory === 2;
  const isActiveCat4 = activeCategory === 4;
  const orderingClass = 
    drawerId === 1 && isActiveCat2 
      ? "active-cat-2" 
      : drawerId === 2 && isActiveCat4 
      ? "active-cat-4" 
      : "";

  return (
    <div
      className={`catalog__sub-drawer ${isOpen ? "is-open" : ""} ${orderingClass}`}
      data-drawer={drawerId}
      aria-hidden={!isOpen}
    >
      <div className="catalog__sub-content">
        {isOpen && activeData && (
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
  );
}
