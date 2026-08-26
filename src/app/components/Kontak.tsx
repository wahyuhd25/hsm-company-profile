"use client";

import React, { useState, useRef } from "react";
import { submitContactMessage } from "@/app/actions/contact";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function Kontak() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    institusi: "",
    telepon: "",
    pesan: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      alert("Harap tunggu sebentar hingga verifikasi keamanan selesai.");
      return;
    }

    setStatus("loading");

    try {
      const formDataObj = new FormData();
      formDataObj.append("nama", formData.nama);
      formDataObj.append("email", formData.email);
      formDataObj.append("institusi", formData.institusi);
      formDataObj.append("telepon", formData.telepon);
      formDataObj.append("pesan", formData.pesan);

      const res = await submitContactMessage(formDataObj, turnstileToken);

      if (res.success) {
        setStatus("success");
        setFormData({
          nama: "",
          email: "",
          institusi: "",
          telepon: "",
          pesan: "",
        });
      } else {
        alert(res.error || "Gagal mengirim pesan.");
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      // Reset turnstile for next submission
      turnstileRef.current?.reset();
      setTurnstileToken("");
    }
  };

  return (
    <section className="kontak" id="kontak" aria-label="Kontak Kami">
      <div className="kontak__container">
        
        {/* ── Header Section ── */}
        <div className="kontak__header">
          <div className="kontak__header-left">
            <div className="kontak__eyebrow">
              <span className="kontak__eyebrow-dot" /> Hubungi Kami
            </div>
            <h2 className="kontak__heading">
              Mari Bermitra &<br />Tumbuh Bersama
            </h2>
          </div>
          <div className="kontak__header-right">
            <p className="kontak__description">
              Tim kami siap membantu Anda dengan informasi spesifikasi produk ortopedi, konsultasi penawaran harga, serta koordinasi pasokan konsinyasi rumah sakit. Hubungi kami melalui formulir atau saluran di bawah ini.
            </p>
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="kontak__grid">
          
          {/* ── Column Left: Contact Information Cards ── */}
          <div className="kontak__info">
            
            {/* Card 1: Address */}
            <div className="kontak__card">
              <span className="kontak__card-num">[ A ]</span>
              <div className="kontak__card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="kontak__card-content">
                <h3>Kantor Utama</h3>
                <p>
                  Jl. Jenderal Sudirman No. 120,<br />
                  Makassar, Sulawesi Selatan 90113,<br />
                  Indonesia
                </p>
                <a 
                  href="https://maps.google.com/?q=PT.+Hartindo+Surya+Medika+Makassar" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="kontak__card-link"
                >
                  Lihat Rute Peta
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Card 2: Phone & WhatsApp */}
            <div className="kontak__card">
              <span className="kontak__card-num">[ B ]</span>
              <div className="kontak__card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="kontak__card-content">
                <h3>Hubungi Langsung</h3>
                <p>
                  Telepon: +62 (411) 894-XXXX<br />
                  WhatsApp: +62 811-445-6789
                </p>
                <a 
                  href="https://wa.me/628114456789?text=Halo%20PT.%20Hartindo%20Surya%20Medika,%20saya%20ingin%20bertanya%20mengenai%20produk%20ortopedi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="kontak__card-link"
                >
                  Chat WhatsApp
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M1.5 6H10.5M10.5 6L6.5 2M10.5 6L6.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Card 3: Email */}
            <div className="kontak__card">
              <span className="kontak__card-num">[ C ]</span>
              <div className="kontak__card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="kontak__card-content">
                <h3>Surel Korespondensi</h3>
                <p>
                  Informasi Umum: info@hartindosuryamedika.com<br />
                  Penawaran/Katalog: sales@hartindosuryamedika.com
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("info@hartindosuryamedika.com");
                      alert("Alamat email info@hartindosuryamedika.com berhasil disalin!");
                    }} 
                    className="kontak__card-link"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
                  >
                    Salin Email
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <a href="mailto:info@hartindosuryamedika.com" className="kontak__card-link">
                    Buka Aplikasi Email
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M1.5 6H10.5M10.5 6L6.5 2M10.5 6L6.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 4: Operating Hours */}
            <div className="kontak__card">
              <span className="kontak__card-num">[ D ]</span>
              <div className="kontak__card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="kontak__card-content">
                <h3>Jam Operasional</h3>
                <p>
                  Senin – Jumat: 08:30 – 17:00 WITA<br />
                  Sabtu: 08:30 – 13:00 WITA<br />
                  Minggu & Hari Libur Nasional: Tutup
                </p>
              </div>
            </div>

          </div>

          {/* ── Column Right: Interactive Contact Form ── */}
          <div className="kontak__form-wrapper">
            <form onSubmit={handleSubmit} className="kontak__form">
              
              <div className="kontak__form-row">
                <div className="kontak__form-group">
                  <label htmlFor="nama">Nama Lengkap</label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    required
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Nama Anda"
                    disabled={status === "loading"}
                  />
                </div>

                <div className="kontak__form-group">
                  <label htmlFor="email">Alamat Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    disabled={status === "loading"}
                  />
                </div>
              </div>

              <div className="kontak__form-row">
                <div className="kontak__form-group">
                  <label htmlFor="institusi">Rumah Sakit / Perusahaan</label>
                  <input
                    type="text"
                    id="institusi"
                    name="institusi"
                    value={formData.institusi}
                    onChange={handleChange}
                    placeholder="Nama RS atau Instansi"
                    disabled={status === "loading"}
                  />
                </div>

                <div className="kontak__form-group">
                  <label htmlFor="telepon">No. Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    id="telepon"
                    name="telepon"
                    required
                    value={formData.telepon}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                    disabled={status === "loading"}
                  />
                </div>
              </div>

              <div className="kontak__form-group">
                <label htmlFor="pesan">Pesan Anda</label>
                <textarea
                  id="pesan"
                  name="pesan"
                  required
                  value={formData.pesan}
                  onChange={handleChange}
                  placeholder="Jelaskan kebutuhan produk atau kerja sama konsinyasi Anda..."
                  disabled={status === "loading"}
                />
              </div>

              {status === "success" && (
                <div className="kontak__status kontak__status--success" role="alert">
                  Pesan Anda berhasil terkirim. Tim kami akan segera menghubungi Anda kembali. Terima kasih atas kepercayaan Anda.
                </div>
              )}

              {status === "error" && (
                <div className="kontak__status kontak__status--error" role="alert">
                  Terjadi kesalahan saat mengirim pesan. Silakan coba kembali atau hubungi kami langsung via WhatsApp.
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: "light" }}
                />
              </div>

              <button 
                type="submit" 
                className="kontak__btn-submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    Memproses...
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                  </>
                ) : (
                  <>
                    Kirim Pesan
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

        {/* ── Google Maps Map Frame ── */}
        <div className="kontak__map-container">
          <div className="kontak__map-wrapper">
            <iframe
              title="Peta Lokasi PT. Hartindo Surya Medika Makassar"
              src="https://maps.google.com/maps?q=PT.+Hartindo+Surya+Medika+Makassar&t=&z=15&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
