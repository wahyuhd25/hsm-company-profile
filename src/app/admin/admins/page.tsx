import { getAdmins } from "@/app/actions/admin_users";
import AdminManagerClient from "./AdminManagerClient";
import styles from "../admin.module.css";

export const metadata = {
  title: "Manajemen Admin - HSM Admin",
};

export default async function AdminsPage() {
  const admins = await getAdmins();

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminHeader}>
        <h1 className={styles.pageTitle}>Manajemen Admin</h1>
        <p className={styles.pageDesc}>Kelola daftar akun yang dapat mengakses Dasbor Admin ini.</p>
      </div>

      <div className={styles.adminCard}>
        <AdminManagerClient initialAdmins={admins} />
      </div>
    </div>
  );
}
