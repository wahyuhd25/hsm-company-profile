import Link from "next/link";
import { cookies } from "next/headers";
import { logout } from "@/app/actions/auth";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { getUnreadCount } from "@/app/actions/inbox";
import styles from "./admin.module.css";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const user = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  const email = (user?.email as string) || "";
  
  const unreadCount = await getUnreadCount();

  return (
    <div className={styles.container}>
      <div className={styles.grid} />

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
          <Link href="/" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Kembali ke Web
          </Link>
          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>
              {email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <span className={styles.userEmail}>{email}</span>
          </div>
          <form action={logout}>
            <button id="logout-btn" type="submit" className={styles.logoutBtn}>
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

      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>Selamat Datang, Admin! 👋</h1>
          <p className={styles.welcomeSub}>
            Anda berhasil masuk ke sistem administrasi PT. Hartindo Surya Medika
          </p>
        </div>

        {/* Menu Panel */}
        <div className={styles.statsGrid}>
          <Link href="/admin/katalog" style={{ textDecoration: "none" }}>
            <div className={styles.statCard} style={{ cursor: "pointer" }}>
              <div className={styles.statIcon} data-color="green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/>
                </svg>
              </div>
              <div>
                <p className={styles.statLabel}>Manajemen</p>
                <p className={styles.statValue}>Katalog Produk</p>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/inbox" style={{ textDecoration: "none" }}>
            <div className={styles.statCard} style={{ cursor: "pointer", position: "relative" }}>
              <div className={styles.statIcon} data-color="blue" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <p className={styles.statLabel}>Pesan Masuk</p>
                <p className={styles.statValue}>Inbox Kontak</p>
              </div>
              {unreadCount > 0 && (
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "9999px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)"
                }}>
                  {unreadCount} Baru
                </div>
              )}
            </div>
          </Link>
          
          <Link href="/admin/admins" style={{ textDecoration: "none" }}>
            <div className={styles.statCard} style={{ cursor: "pointer" }}>
              <div className={styles.statIcon} data-color="purple" style={{ background: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <p className={styles.statLabel}>Sistem</p>
                <p className={styles.statValue}>Pengaturan Admin</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
