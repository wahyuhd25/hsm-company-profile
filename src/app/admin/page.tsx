import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { logout } from "@/app/actions/auth";
import styles from "./admin.module.css";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-hsm-company-profile-auth-12345"
);

interface JWTPayload {
  email?: string;
  iat?: number;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hsm_session")?.value;
  let user: JWTPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as JWTPayload;
    } catch (e) {
      // Invalid token
    }
  }

  // Format session start time from JWT iat
  const loginTime = user?.iat
    ? new Date(user.iat * 1000).toLocaleString("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "—";

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
          <a href="/" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Kembali ke Web
          </a>
          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <span className={styles.userEmail}>{user?.email}</span>
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


      </main>
    </div>
  );
}
