"use client";

import { useState, useRef, useEffect } from "react";

interface ImageUploadInputProps {
  label: string;
  nameUrl: string;
  nameFile: string;
  defaultValue?: string;
}

export default function ImageUploadInput({
  label,
  nameUrl,
  nameFile,
  defaultValue = "",
}: ImageUploadInputProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlValue, setUrlValue] = useState(defaultValue);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with defaultValue when it changes (e.g. edit mode loaded)
  useEffect(() => {
    setUrlValue(defaultValue);
    if (defaultValue && (defaultValue.startsWith("http://") || defaultValue.startsWith("https://") || defaultValue.startsWith("/images/"))) {
      setMode("url");
    }
  }, [defaultValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + " KB");
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setFilePreview(null);
    setFileName(null);
    setFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const activePreview = mode === "upload" ? filePreview || (defaultValue && !urlValue.startsWith("http") ? defaultValue : null) : urlValue;

  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Label & Mode Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#334155" }}>
          {label}
        </label>
        <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "2px", borderRadius: "6px" }}>
          <button
            type="button"
            onClick={() => setMode("upload")}
            style={{
              padding: "3px 10px",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: mode === "upload" ? "#ffffff" : "transparent",
              color: mode === "upload" ? "#00a86b" : "#64748b",
              boxShadow: mode === "upload" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            📁 Upload Gambar
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            style={{
              padding: "3px 10px",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: mode === "url" ? "#ffffff" : "transparent",
              color: mode === "url" ? "#00a86b" : "#64748b",
              boxShadow: mode === "url" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            🔗 Pakai URL
          </button>
        </div>
      </div>

      {/* Mode 1: Upload File */}
      {mode === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            name={nameFile}
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id={`file-input-${nameFile}`}
          />

          {!filePreview && !defaultValue ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "1.25rem 1rem",
                textAlign: "center",
                backgroundColor: "#f8fafc",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00a86b")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00a86b" strokeWidth="2" style={{ margin: "0 auto 6px auto", display: "block" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>
                Klik untuk upload gambar
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                JPG, PNG, atau WebP (disimpan ke database)
              </p>
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "0.75rem",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {/* Preview Thumbnail */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "6px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={filePreview || defaultValue}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {fileName || "Gambar Tersimpan"}
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                  {fileSize || "Tersimpan di database"}
                </p>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    background: "#ffffff",
                    cursor: "pointer",
                    color: "#334155",
                    fontWeight: 600,
                  }}
                >
                  Ganti
                </button>
                {filePreview && (
                  <button
                    type="button"
                    onClick={handleClearFile}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      border: "1px solid #fee2e2",
                      borderRadius: "4px",
                      background: "#fef2f2",
                      cursor: "pointer",
                      color: "#dc2626",
                      fontWeight: 600,
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Preserve existing imageUrl if file not replaced */}
          <input type="hidden" name={nameUrl} value={filePreview ? "" : urlValue} />
        </div>
      )}

      {/* Mode 2: Input URL */}
      {mode === "url" && (
        <div>
          <input
            type="text"
            name={nameUrl}
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://example.com/gambar.jpg atau /images/..."
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              fontSize: "0.875rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              outline: "none",
            }}
          />

          {urlValue && (
            <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "6px",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlValue}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Preview Gambar URL</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
