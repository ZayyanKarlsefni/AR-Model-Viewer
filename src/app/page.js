'use client';

export default function Home() {
  return (
    <main className="landing-container">
      <header className="landing-header">
        <h1 className="logo-text">AR Model <span>Lite</span></h1>
        <a href="https://vercel.com" target="_blank" rel="noreferrer" className="vercel-badge">
          ▲ Powered by Vercel
        </a>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <div className="security-tag">🛡️ 100% Aman & Terlindungi</div>
          <h2 className="hero-title">Visualisasikan Model 3D Anda di Dunia Nyata</h2>
          <p className="hero-description">
            Sistem Web Viewer minimalis untuk Autodesk Inventor. Ekspor model CAD Anda secara instan dan aman, tanpa perantara pihak ketiga.
          </p>
          <div className="hero-buttons">
            <div className="status-indicator">
              <span className="pulse-dot"></span>
              Sistem Aktif & Siap Menerima Unggahan
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Penyimpanan Pribadi</h3>
            <p>Model diunggah langsung ke Vercel Blob Storage milik Anda sendiri. Privasi dan hak cipta proyek Anda terjamin penuh.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🕶️</div>
            <h3>Augmented Reality</h3>
            <p>Mendukung WebXR (Android) dan AR Quick Look (iOS) untuk menampilkan proyek langsung di meja kerja Anda.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Sematkan Otomatis</h3>
            <p>QR Code tersemat langsung di lembar gambar kerja Inventor. Cukup pindai menggunakan kamera HP untuk melihat.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 AR Model Lite | Reclaimed Project | Light & Clean Edition</p>
      </footer>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, #f8fafc 0%, #f1f5f9 100%);
          color: #334155;
          display: flex;
          flex-direction: column;
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.75rem 2rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .logo-text {
          margin: 0;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.75px;
          color: #0f172a;
        }

        .logo-text span {
          font-weight: 300;
          color: #64748b;
        }

        .vercel-badge {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          text-decoration: none;
          padding: 0.45rem 0.95rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .vercel-badge:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
          transform: translateY(-1px);
        }

        .hero-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          padding: 3rem 2rem 5rem;
          text-align: center;
          box-sizing: border-box;
        }

        .hero-content {
          margin-bottom: 4rem;
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .security-tag {
          display: inline-block;
          background: rgba(16, 185, 129, 0.08);
          color: #065f46;
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.35rem 0.95rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          letter-spacing: -0.1px;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -1.25px;
          margin: 0 0 1.25rem;
          color: #0f172a;
        }

        .hero-description {
          font-size: 1.15rem;
          line-height: 1.6;
          color: #64748b;
          max-width: 620px;
          margin: 0 auto 2.25rem;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.9rem;
          color: #475569;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.65rem 1.25rem;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          font-weight: 500;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse 2s infinite;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          width: 100%;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .feature-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 2.25rem 1.75rem;
          text-align: left;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: #cbd5e1;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }

        .feature-icon {
          font-size: 1.8rem;
          margin-bottom: 1.25rem;
        }

        .feature-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0 0 0.65rem;
          color: #0f172a;
        }

        .feature-card p {
          font-size: 0.925rem;
          line-height: 1.55;
          color: #64748b;
          margin: 0;
        }

        .landing-footer {
          text-align: center;
          padding: 2rem;
          font-size: 0.8rem;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        @media (max-width: 768px) {
          .landing-header {
            padding: 1.25rem 1.5rem;
          }
          .hero-section {
            padding: 2rem 1.5rem 4rem;
          }
          .hero-title {
            font-size: 2.1rem;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .feature-card {
            padding: 1.75rem 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
