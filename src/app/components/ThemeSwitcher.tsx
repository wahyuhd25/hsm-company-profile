"use client";

import { useEffect, useState } from "react";

const themes = [
  "",
  "theme-dark",
  "theme-emerald",
];

const themeNames: Record<string, string> = {
  "": "Light Green",
  "theme-dark": "Dark Slate",
  "theme-emerald": "Dark Forest",
};

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState("Light Green");

  useEffect(() => {
    // 1. Coba baca dari localStorage dulu
    const savedTheme = localStorage.getItem("hsm-theme");
    
    let currentTheme = "";
    if (savedTheme !== null) {
      currentTheme = savedTheme;
      // Terapkan theme dari localStorage
      themes.forEach((t) => {
        if (t) document.documentElement.classList.remove(t);
      });
      if (currentTheme) {
        document.documentElement.classList.add(currentTheme);
      }
    } else {
      // 2. Jika tidak ada di localStorage, baca dari classList
      const currentClass = document.documentElement.className || "";
      currentTheme = themes.find((t) => t && currentClass.includes(t)) || "";
    }

    const name = themeNames[currentTheme] || "Light Green";
    
    const handle = requestAnimationFrame(() => {
      setActiveTheme(name);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const cycleTheme = () => {
    const currentClass = document.documentElement.className || "";
    const currentTheme = themes.find((t) => t && currentClass.includes(t)) || "";
    const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    // Remove old themes
    themes.forEach((t) => {
      if (t) document.documentElement.classList.remove(t);
    });

    // Add new theme
    if (nextTheme) {
      document.documentElement.classList.add(nextTheme);
    }

    // Save to localStorage
    localStorage.setItem("hsm-theme", nextTheme);

    setActiveTheme(themeNames[nextTheme]);
  };

  return (
    <button
      onClick={cycleTheme}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 99999,
        backgroundColor: "var(--color-bg-card)",
        color: "var(--color-accent)",
        border: "1px solid var(--color-accent)",
        padding: "10px 18px",
        fontFamily: "monospace",
        fontSize: "12px",
        cursor: "pointer",
        textTransform: "uppercase",
        fontWeight: "bold",
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
        transition: "all 0.2s ease",
        borderRadius: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-accent)";
        e.currentTarget.style.color = "var(--color-bg-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-bg-card)";
        e.currentTarget.style.color = "var(--color-accent)";
      }}
    >
      ⚙️ Theme: {activeTheme}
    </button>
  );
}
