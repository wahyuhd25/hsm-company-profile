import Navbar from "@/app/components/Navbar";
import styles from "./katalog-page.module.css";

export default function KatalogLoading() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* Skeleton Breadcrumb */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbInner}>
          <div className="skeleton" style={{ width: "80px", height: "16px" }} />
          <span className={styles.bcSep}>›</span>
          <div className="skeleton" style={{ width: "120px", height: "16px" }} />
        </div>
      </div>

      {/* Skeleton Hero */}
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className="skeleton" style={{ width: "72px", height: "72px", borderRadius: "12px", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "500px" }}>
            <div className="skeleton" style={{ width: "100px", height: "18px" }} />
            <div className="skeleton" style={{ width: "60%", height: "36px" }} />
            <div className="skeleton" style={{ width: "90%", height: "16px" }} />
          </div>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className={styles.contentArea}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div className="skeleton" style={{ width: "180px", height: "20px" }} />
          <div className="skeleton" style={{ width: "90px", height: "20px" }} />
        </div>

        {/* Skeleton Grid */}
        <div className={styles.categoryGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={styles.categoryCard}
              style={{ pointerEvents: "none", opacity: 0.85 }}
            >
              <div className="skeleton" style={{ height: "200px", width: "100%", borderRadius: "10px 10px 0 0" }} />
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="skeleton" style={{ width: "40%", height: "14px" }} />
                <div className="skeleton" style={{ width: "80%", height: "22px" }} />
                <div className="skeleton" style={{ width: "100%", height: "14px" }} />
                <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                  <div className="skeleton" style={{ width: "35%", height: "16px" }} />
                  <div className="skeleton" style={{ width: "30%", height: "16px" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
