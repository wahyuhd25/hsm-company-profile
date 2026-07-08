import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login Admin | PT. Hartindo Surya Medika",
  description: "Masuk ke panel admin PT. Hartindo Surya Medika",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
