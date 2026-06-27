"use client";

interface CatalogCardProps {
  id: number;
  num: string;
  name: string;
  desc: string;
  isActive: boolean;
  onToggle: () => void;
}

export default function CatalogCard({ id, num, name, desc, isActive, onToggle }: CatalogCardProps) {
  return (
    <button
      className={`catalog-card ${isActive ? "is-active" : ""}`}
      onClick={onToggle}
      data-id={id}
      aria-expanded={isActive}
    >
      <div className="catalog-card__meta">
        <span className="catalog-card__num">{num}</span>
        <span className="catalog-card__indicator">+</span>
      </div>
      <div>
        <h3>{name}</h3>
        <p>{desc}</p>
      </div>
    </button>
  );
}
