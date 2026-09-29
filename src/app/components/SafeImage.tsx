"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
  loading?: "lazy" | "eager";
}

/** Gambar (lokal atau remote) dengan lazy-loading dan fallback aman kalau gagal dimuat. */
export default function SafeImage({ src, alt, className, fallback, loading = "lazy" }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      style={{
        opacity: loaded ? 1 : 0.6,
        transition: "opacity 0.25s ease-in-out",
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}
