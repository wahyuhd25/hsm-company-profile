"use client";

import { useState, useEffect } from "react";
import { markAsRead, deleteMessage } from "@/app/actions/inbox";
import styles from "../admin.module.css";
import { ContactMessage } from "@prisma/client";

export default function InboxClient({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  const handleRead = async (id: number) => {
    await markAsRead(id);
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;
    await deleteMessage(id);
    setMessages(msgs => msgs.filter(m => m.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  return (
    <div className={styles.gridSplit}>
      {/* Sidebar List */}
      <div className={styles.sidebarList}>
        {messages.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Belum ada pesan masuk.</div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              onClick={() => {
                setSelectedMsg(msg);
                if (!msg.isRead) handleRead(msg.id);
              }}
              className={`${styles.sidebarItem} ${selectedMsg?.id === msg.id ? styles.sidebarItemActive : ''}`}
            >
              <div className={styles.itemHeader}>
                <span className={`${styles.itemTitle} ${!msg.isRead ? styles.itemTitleUnread : ''}`}>{msg.name}</span>
                <span className={styles.itemDate}>
                  {isMounted ? new Date(msg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                </span>
              </div>
              <p className={styles.itemPreview}>
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Message Details */}
      <div className={styles.detailView}>
        {selectedMsg ? (
          <>
            <div className={styles.detailHeader}>
              <div>
                <h2 className={styles.detailTitle}>{selectedMsg.name}</h2>
                <div className={styles.metaList}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Email:</span> 
                    <a href={`mailto:${selectedMsg.email}`} className={styles.metaLink}>{selectedMsg.email}</a>
                  </div>
                  {selectedMsg.institusi && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Institusi:</span> 
                      {selectedMsg.institusi}
                    </div>
                  )}
                  {selectedMsg.phone && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Telepon/WA:</span> 
                      <a href={`https://wa.me/${selectedMsg.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>{selectedMsg.phone}</a>
                    </div>
                  )}
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Diterima:</span> 
                    {isMounted ? new Date(selectedMsg.createdAt).toLocaleString('id-ID') : ''}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(selectedMsg.id)}
                className={styles.btnDanger}
              >
                Hapus Pesan
              </button>
            </div>
            
            <div className={styles.messageBody}>
              {selectedMsg.message}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            Pilih pesan di sebelah kiri untuk membaca isi detailnya.
          </div>
        )}
      </div>
    </div>
  );
}
