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
          <h2 className="hero-title">Bawa Model 3D Anda Ke Dunia Nyata Secara Mandiri</h2>
          <p className="hero-description">
            Sistem Web Viewer terdesentralisasi untuk Autodesk Inventor. Konversikan model CAD Anda menjadi format 3D/AR secara instan, aman, dan tanpa data bocor ke pihak asing.
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
            <h3>Keamanan Penuh</h3>
            <p>Model diunggah langsung ke Vercel Blob Storage milik Anda sendiri. Tidak ada data yang dikirim ke server luar.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🕶️</div>
            <h3>Augmented Reality</h3>
            <p>Mendukung penuh teknologi AR bawaan Android (Scene Viewer) dan iOS (Quick Look) langsung dari browser.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Integrasi Inventor</h3>
            <p>Ekspor langsung dari Inventor. QR Code disematkan otomatis ke lembar gambar Anda untuk dipindai klien.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 AR Model Lite | Reclaimed Project | Hosted on Vercel</p>
      </footer>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background: radial-gradient(circle at center, #1b2130 0%, #0d0f14 100%);
          color: #f3f4f6;
          display: flex;
          flex-direction: column;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .logo-text {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-text span {
          font-weight: 300;
          color: #9ca3af;
          -webkit-text-fill-color: #9ca3af;
        }

        .vercel-badge {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e5e7eb;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .vercel-badge:hover {
          background: rgba(255, 255, 255, 0.1);
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
          padding: 4rem 2rem;
          text-align: center;
          box-sizing: border-box;
        }

        .hero-content {
          margin-bottom: 4rem;
          animation: fadeIn 0.8s ease-out;
        }

        .security-tag {
          display: inline-block;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -1px;
          margin: 0 0 1.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #d1d5db 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: 1.25rem;
          line-height: 1.6;
          color: #9ca3af;
          max-width: 700px;
          margin: 0 auto 2.5rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: #9ca3af;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 1.5s infinite;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          width: 100%;
          animation: slideUp 0.8s ease-out;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 2rem 1.5rem;
          text-align: left;
          transition: transform 0.3s, border-color 0.3s;
          backdrop-filter: blur(8px);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
          color: #e5e7eb;
        }

        .feature-card p {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #9ca3af;
          margin: 0;
        }

        .landing-footer {
          text-align: center;
          padding: 2rem;
          font-size: 0.85rem;
          color: #4b5563;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          background: rgba(13, 15, 20, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
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
          .hero-title {
            font-size: 2.2rem;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
