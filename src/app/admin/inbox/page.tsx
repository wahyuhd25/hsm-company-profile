import { getMessages } from "@/app/actions/inbox";
import InboxClient from "./InboxClient";
import styles from "../admin.module.css";

export const metadata = {
  title: "Pesan Masuk - HSM Admin",
};

export default async function InboxPage() {
  const messages = await getMessages();

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminHeader}>
        <h1 className={styles.pageTitle}>Kotak Masuk (Inbox)</h1>
        <p className={styles.pageDesc}>Daftar pesan dari form kontak di halaman utama.</p>
      </div>

      <div className={styles.adminCard}>
        <InboxClient initialMessages={messages} />
      </div>
    </div>
  );
}
