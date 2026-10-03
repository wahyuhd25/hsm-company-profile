export default function RootLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        backgroundColor: "var(--color-bg-primary, #0f172a)",
        color: "var(--color-text-primary, #f8fafc)",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          border: "3px solid rgba(16, 185, 129, 0.2)",
          borderTopColor: "var(--color-accent, #10b981)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span
        style={{
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "var(--color-text-muted, #94a3b8)",
          letterSpacing: "0.05em",
        }}
      >
        Memuat...
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
