"use client";

import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState("Light Green");

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

  useEffect(() => {
    const currentClass = document.documentElement.className || "";
    const currentTheme = themes.find((t) => t && currentClass.includes(t)) || "";
    setActiveTheme(themeNames[currentTheme]);
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
