import Link from "next/link";
import { cookies } from "next/headers";
import { logout } from "@/app/actions/auth";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import styles from "../admin.module.css";

interface AdminHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export default async function AdminHeader({
  backHref = "/admin",
  backLabel = "Kembali ke Dashboard",
}: AdminHeaderProps) {
  const cookieStore = await cookies();
  const user = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  const email = (user?.email as string) || "";

  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        <div className={styles.headerLogo}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span className={styles.headerTitle}>HSM Admin</span>
      </div>

      <div className={styles.headerRight}>
        <Link href={backHref} className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          {backLabel}
        </Link>
        <div className={styles.userBadge}>
          <div className={styles.userAvatar}>
            {email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span className={styles.userEmail}>{email}</span>
        </div>
        <form action={logout}>
          <button type="submit" className={styles.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
