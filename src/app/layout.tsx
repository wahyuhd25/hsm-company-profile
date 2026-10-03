import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hartindosuryamedika.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PT. Hartindo Surya Medika | Distributor Produk Ortopedi Terpercaya",
    template: "%s | PT. Hartindo Surya Medika",
  },
  description:
    "Distributor resmi implan dan instrumen ortopedi terpercaya. Mendukung tenaga medis rumah sakit dengan produk berkualitas tinggi, berstandar medis, dan layanan cepat tanggap.",
  keywords: [
    "ortopedi",
    "implan ortopedi",
    "alat medis",
    "hartindo surya medika",
    "HSM",
    "distributor medis Makassar",
    "spinal fixation",
    "locking plate",
    "trauma implants",
  ],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "PT. Hartindo Surya Medika | Distributor Produk Ortopedi Terpercaya",
    description: "Mendukung tenaga medis dengan produk ortopedi berkualitas dan layanan yang responsif.",
    url: baseUrl,
    siteName: "PT. Hartindo Surya Medika",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/hsm-building.png",
        width: 1200,
        height: 630,
        alt: "PT. Hartindo Surya Medika",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PT. Hartindo Surya Medika | Distributor Produk Ortopedi Terpercaya",
    description: "Mendukung tenaga medis dengan produk ortopedi berkualitas dan layanan yang responsif.",
    images: ["/hsm-building.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { Suspense } from "react";
import TopLoader from "./components/TopLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
