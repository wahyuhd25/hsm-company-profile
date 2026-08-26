import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | PT. Hartindo Surya Medika",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const user = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
