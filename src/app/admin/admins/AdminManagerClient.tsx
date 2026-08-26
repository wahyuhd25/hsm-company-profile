"use client";

import { useState, useEffect } from "react";
import { addAdmin, deleteAdmin } from "@/app/actions/admin_users";
import styles from "../admin.module.css";

type AdminUser = {
  id: number;
  email: string;
  createdAt: Date;
};

export default function AdminManagerClient({ initialAdmins }: { initialAdmins: AdminUser[] }) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  async function handleAddAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await addAdmin(formData);
    
    if (result.success) {
      alert("Admin berhasil ditambahkan!");
      window.location.reload(); // Simple way to refresh the list from server
    } else {
      alert(result.error);
    }
    
    setIsLoading(false);
  }

  async function handleDelete(id: number, email: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus admin ${email}?`)) return;
    
    setIsLoading(true);
    const result = await deleteAdmin(id);
    
    if (result.success) {
      setAdmins(admins.filter(a => a.id !== id));
    } else {
      alert(result.error);
    }
    
    setIsLoading(false);
  }

  return (
    <div className={styles.gridTwoCol}>
      
      {/* Tambah Admin Form */}
      <div className={styles.formBox}>
        <h2 className={styles.formTitle}>Tambah Admin Baru</h2>
        <form onSubmit={handleAddAdmin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Alamat Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              className={styles.input}
              placeholder="nama@email.com"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password Baru</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              minLength={6}
              className={styles.input}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className={styles.btnPrimary}
          >
            {isLoading ? "Menyimpan..." : "Simpan Admin"}
          </button>
        </form>
      </div>

      {/* Daftar Admin */}
      <div style={{ padding: "1rem" }}>
        <h2 className={styles.formTitle}>Daftar Admin Saat Ini</h2>
        <div className={styles.adminList}>
          {admins.map((admin) => (
            <div key={admin.id} className={styles.adminItem}>
              <div>
                <strong className={styles.adminEmail}>{admin.email}</strong>
                <span className={styles.adminDate}>Ditambahkan: {isMounted ? new Date(admin.createdAt).toLocaleDateString("id-ID") : ''}</span>
              </div>
              <button
                onClick={() => handleDelete(admin.id, admin.email)}
                disabled={isLoading}
                className={styles.btnDanger}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
        <div className={styles.helpText}>
          <strong>Catatan Keamanan:</strong> Anda tidak dapat melihat password milik admin lain karena password telah dienkripsi menggunakan sistem bcrypt demi mencegah kebocoran data.
        </div>
      </div>
      
    </div>
  );
}
