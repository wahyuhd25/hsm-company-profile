"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import styles from "./login.module.css";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid} />

      <Link href="/" className={styles.backButton}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Kembali ke Beranda
      </Link>

      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logoRing}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4a10 10 0 110 20A10 10 0 0116 6z" fill="url(#logo-gradient)" />
              <path d="M12 11h2v10h-2V11zm6 0h2v10h-2V11zm-4 4h4v2h-4v-2z" fill="white" />
              <defs>
                <linearGradient id="logo-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00a86b" />
                  <stop offset="1" stopColor="#00e676" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className={styles.brandName}>HSM Admin</h1>
            <p className={styles.brandSub}>PT. Hartindo Surya Medika</p>
          </div>
        </div>

        <div className={styles.heading}>
          <h2 className={styles.title}>Selamat Datang</h2>
          <p className={styles.subtitle}>Masuk ke panel administrasi untuk mengelola konten</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} id="login-form">
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@hartindosurya.com"
                className={styles.input}
                disabled={isPending}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className={styles.input}
                disabled={isPending}
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button id="login-submit-btn" type="submit" disabled={isPending} className={styles.submitBtn}>
            {isPending ? (
              <><span className={styles.spinner} /><span>Memverifikasi...</span></>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className={styles.footer}>Akses terbatas untuk administrator yang berwenang</p>
      </div>
    </div>
  );
}
