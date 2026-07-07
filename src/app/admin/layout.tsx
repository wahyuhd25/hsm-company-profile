import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { Metadata } from "next";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-hsm-company-profile-auth-12345"
);

export const metadata: Metadata = {
  title: "Admin Dashboard | PT. Hartindo Surya Medika",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("hsm_session")?.value;
  let user = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload;
    } catch (e) {
      // Invalid or expired token
    }
  }

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
