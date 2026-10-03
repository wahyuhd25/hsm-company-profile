"use client";

import { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

/** Gambar (lokal atau remote) teroptimasi Next.js dengan lazy-loading dan fallback aman kalau gagal dimuat. */
export default function SafeImage({
  src,
  alt,
  className,
  fallback,
  loading = "lazy",
  priority = false,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed || !src) return <>{fallback}</>;

  const isDataUrl = src.startsWith("data:");
  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  const isAllowedHost = src.includes("marthysorthopaedic.com");

  return (
    <Image
      src={src}
      alt={alt}
      width={600}
      height={600}
      className={className}
      loading={priority ? undefined : loading}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      unoptimized={isDataUrl || (isExternal && !isAllowedHost)}
      style={{
        opacity: loaded ? 1 : 0.6,
        transition: "opacity 0.25s ease-in-out",
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}
