"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route finishes changing, complete progress and hide
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on links to show instant feedback (<10ms)
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Check if it's the exact same pathname and hash-only
      try {
        const url = new URL(href, window.location.origin);
        if (
          url.origin === window.location.origin &&
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return; // Same page hash navigation or duplicate
        }
      } catch {
        return;
      }

      setLoading(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(65), 150);
      const t2 = setTimeout(() => setProgress(85), 600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 99999,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "var(--color-accent, #10b981)",
          boxShadow: "0 0 10px var(--color-accent, #10b981), 0 0 5px var(--color-accent, #10b981)",
          transition: progress === 100 ? "width 0.2s ease-out, opacity 0.3s 0.2s ease" : "width 0.4s ease-out",
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
