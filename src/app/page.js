'use client';

export default function Home() {
  return (
    <main className="landing-container">
      {/* Navigation Header - Clean & Client-Focused */}
      <header className="landing-header">
        <div className="logo-group">
          <span className="logo-dot"></span>
          <h1 className="logo-text">AR Model <span>Lite</span></h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="security-tag">
          <span className="security-dot"></span>
          🛡️ 100% Aman & Terlindungi
        </div>
        
        <h2 className="hero-title">
          Give your CAD models <br />
          the viewer they deserve
        </h2>
        
        <p className="hero-description">
          Sistem Web Viewer 3D & Augmented Reality minimalis yang dirancang khusus untuk Autodesk Inventor. Ekspor model CAD Anda secara instan dan aman langsung ke ruang penyimpanan pribadi Anda.
        </p>

        {/* Central Dashboard Mockup - Now Clean White & Light Theme */}
        <div className="dashboard-mockup-wrapper">
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="dot-red"></span>
                <span className="dot-yellow"></span>
                <span className="dot-green"></span>
              </div>
              <div className="mockup-title">AR Viewer Dashboard — Active Model</div>
              <div className="mockup-status">
                <span className="status-pulse"></span> Online
              </div>
            </div>
            
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="sidebar-item active">📁 Model Aktif</div>
                <div className="sidebar-item">📐 Dimensi & Skala</div>
                <div className="sidebar-item">🕶️ AR Settings</div>
                <div className="sidebar-item">⚙️ Pengaturan</div>
              </div>
              
              <div className="mockup-viewport">
                <div className="simulated-3d-container">
                  <div className="3d-object-ring"></div>
                  <div className="3d-object-sphere">
                    <div className="sphere-inner"></div>
                  </div>
                  <div className="viewport-overlay">
                    <div className="overlay-badge">model-viewer 3D Active</div>
                    <div className="overlay-controls">
                      <span>🔄 Putar 360°</span>
                      <span>🔍 Zoom</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-subtitle">Visualisasikan lebih cepat, lebih aman.</span>
          <h3 className="section-title">Build a better presentation, faster.</h3>
        </div>

        <div className="features-grid">
          {/* Card 1: Inventor integration */}
          <div className="feature-card large-card">
            <div className="card-content">
              <div className="card-icon">⚡</div>
              <h4>Integrasi Inventor Cepat</h4>
              <p>Ekspor langsung dari Autodesk Inventor dengan satu klik. QR code dibuat otomatis dan langsung disematkan ke lembar gambar kerja Anda.</p>
            </div>
            <div className="card-graphic-wireframe">
              <div className="wireframe-circle"></div>
              <div className="wireframe-circle horizontal"></div>
              <div className="wireframe-dots"></div>
            </div>
          </div>

          {/* Card 2: You're in control */}
          <div className="feature-card">
            <div className="card-content">
              <div className="card-icon">🔒</div>
              <h4>Anda Pemegang Kendali</h4>
              <p>Data model disimpan secara lokal di server cloud pribadi Anda. Tidak ada server pihak ketiga, pelacakan data, atau batasan akses.</p>
            </div>
            <div className="card-graphic-rocket">
              <div className="rocket-icon-glow">🚀</div>
            </div>
          </div>

          {/* Card 3: Fits light into your stack */}
          <div className="feature-card">
            <div className="card-content">
              <div className="card-icon">📱</div>
              <h4>Responsif & Kompatibel</h4>
              <p>Dirancang khusus agar berjalan mulus di semua perangkat. Tampilan desktop super tajam dan mode AR responsif di layar HP Anda.</p>
            </div>
            <div className="card-graphic-devices">
              <div className="device-screen phone"></div>
              <div className="device-screen desktop"></div>
            </div>
          </div>

          {/* Card 4: Data-agnostic */}
          <div className="feature-card large-card">
            <div className="card-content">
              <div className="card-icon">🗄️</div>
              <h4>Manajemen File Aman</h4>
              <p>Mendukung model assembly berukuran besar hingga 500 MB melalui direct-upload API token. Penyimpanan file efisien dengan sistem enkripsi modern.</p>
            </div>
            <div className="card-graphic-database">
              <div className="db-layer"></div>
              <div className="db-layer"></div>
              <div className="db-layer"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section className="checklist-section">
        <div className="section-header">
          <h3 className="section-title">Everything you need. Nothing you don't.</h3>
          <p className="section-desc">Seluruh alat presentasi 3D dan AR profesional, siap pakai tanpa kerumitan konfigurasi.</p>
        </div>

        <div className="checklist-grid">
          <div className="checklist-item">
            <span className="check-icon">✓</span>
            <div>
              <h5>Aksesibilitas Tinggi</h5>
              <p>Pindai langsung menggunakan kamera HP default tanpa perlu mengunduh aplikasi tambahan.</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✓</span>
            <div>
              <h5>Layout Responsif</h5>
              <p>Antarmuka web viewer otomatis menyesuaikan dengan orientasi dan ukuran layar handphone.</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✓</span>
            <div>
              <h5>Tema Terang & Gelap</h5>
              <p>Antarmuka bersih putih mewah dengan viewport terang kontras tinggi untuk rendering model maksimal.</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✓</span>
            <div>
              <h5>Augmented Reality (AR)</h5>
              <p>Mendukung Google Scene Viewer (Android) dan Apple Quick Look (iOS) secara bawaan.</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✓</span>
            <div>
              <h5>Performa Kecepatan Tinggi</h5>
              <p>File model langsung dialirkan dari jaringan CDN global untuk loading secepat kilat.</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✓</span>
            <div>
              <h5>Bebas Backdoor Lisensi</h5>
              <p>Sistem berjalan mandiri sepenuhnya, memberikan Anda kepemilikan kode seutuhnya.</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✓</span>
            <div>
              <h5>Kepatuhan Standar Industri</h5>
              <p>Menggunakan format file standar GLTF/GLB biner yang didukung luas oleh perangkat industri.</p>
            </div>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✓</span>
            <div>
              <h5>Penyimpanan Blob Aman</h5>
              <p>Koneksi terenkripsi penuh antara komputer Inventor Anda langsung ke server penyimpanan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section - White background with a touch of dark/black aura eclipse arc */}
      <section className="glow-section" id="security">
        <div className="glow-content">
          <span className="glow-badge">Quality you can trust. And build on.</span>
          <h3 className="glow-title">Kembangkan Terus Solusi CAD & AR Anda</h3>
          <p className="glow-description">
            Sistem ini sepenuhnya berada di bawah kendali Anda sendiri. Hubungkan penyimpanan pribadi Anda, pasang add-in Inventor-nya, dan buat klien Anda kagum dengan presentasi AR tercanggih di kelasnya.
          </p>
        </div>
        
        {/* Glow universe styled as White theme with a dark/black aura eclipse arc */}
        <div className="glow-universe-container">
          <div className="glow-universe-arc"></div>
          <div className="glow-universe-light"></div>
        </div>
      </section>

      {/* Footer - Simplified for clients */}
      <footer className="landing-footer-main">
        <div className="footer-content">
          <div className="footer-brand">
            <h1 className="logo-text">AR Model <span>Lite</span></h1>
            <p>Sistem Presentasi CAD 3D & AR Tercanggih secara Mandiri.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h6>Layanan</h6>
              <a href="#features">Fitur Utama</a>
              <a href="#security">Keamanan Data</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 AR Model Lite. All Rights Reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        /* Global Container styling - Apple/Stripe Luxurious White with Dark Accents */
        .landing-container {
          background-color: #fcfcfd;
          color: #334155;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Navigation Header */
        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          max-width: 1250px;
          margin: 0 auto;
          box-sizing: border-box;
          border-bottom: 1px solid #f1f5f9;
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .logo-dot {
          width: 10px;
          height: 10px;
          background-color: #0f172a;
          border-radius: 50%;
        }

        .logo-text {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.75px;
          color: #0f172a;
        }

        .logo-text span {
          font-weight: 300;
          color: #64748b;
        }

        /* Hero Section */
        .hero-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 5rem 2rem 6rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }

        .security-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          color: #065f46;
          border: 1px solid #d1fae5;
          padding: 0.45rem 1rem;
          border-radius: 9999px;
          font-size: 0.825rem;
          font-weight: 700;
          margin-bottom: 2rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.01);
        }

        .security-dot {
          width: 6px;
          height: 6px;
          background-color: #10b981;
          border-radius: 50%;
        }

        .hero-title {
          font-size: 3.8rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1.8px;
          color: #0f172a;
          margin: 0 0 1.5rem;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #64748b;
          max-width: 680px;
          margin: 0 auto 2.5rem;
        }

        /* Central Dashboard Mockup - Clean White Light Mode */
        .dashboard-mockup-wrapper {
          width: 100%;
          max-width: 900px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          padding: 0.75rem;
          border-radius: 28px;
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.06);
          border: 1px solid #e2e8f0;
          animation: scaleUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dashboard-mockup {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          text-align: left;
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
        }

        .mockup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.95rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .mockup-dots {
          display: flex;
          gap: 0.45rem;
        }

        .mockup-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot-red { background-color: #ef4444; }
        .dot-yellow { background-color: #f59e0b; }
        .dot-green { background-color: #10b981; }

        .mockup-title {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }

        .mockup-status {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .status-pulse {
          width: 6px;
          height: 6px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-green 1.5s infinite;
        }

        .mockup-body {
          display: flex;
          height: 480px;
        }

        .mockup-sidebar {
          width: 200px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          padding: 1.25rem 0.75rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .sidebar-item {
          padding: 0.65rem 0.95rem;
          border-radius: 10px;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-item:hover {
          color: #0f172a;
          background: #f1f5f9;
        }

        .sidebar-item.active {
          color: #0f172a;
          background: #e2e8f0;
        }

        .mockup-viewport {
          flex: 1;
          background: radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 2rem;
        }

        .simulated-3d-container {
          position: relative;
          width: 250px;
          height: 250px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .3d-object-ring {
          position: absolute;
          width: 200px;
          height: 200px;
          border: 1px dashed rgba(15, 23, 42, 0.1);
          border-radius: 50%;
          transform: rotateX(75deg);
          animation: spin 8s linear infinite;
        }

        .3d-object-sphere {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle at 30% 30%, #60a5fa 0%, #3b82f6 70%, #2563eb 100%);
          border-radius: 50%;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.2);
          animation: float 4s ease-in-out infinite;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .sphere-inner {
          width: 50px;
          height: 50px;
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          transform: rotateY(45deg);
          animation: spin 4s linear infinite;
        }

        .viewport-overlay {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          right: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .overlay-badge {
          background: rgba(15, 23, 42, 0.04);
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 0.75rem;
          padding: 0.35rem 0.65rem;
          border-radius: 9999px;
          font-weight: 600;
        }

        .overlay-controls {
          display: flex;
          gap: 0.75rem;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Features Section */
        .features-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 6rem 2rem;
          box-sizing: border-box;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-subtitle {
          display: inline-block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.75rem;
        }

        .section-title {
          font-size: 2.3rem;
          font-weight: 800;
          letter-spacing: -0.9px;
          color: #0f172a;
          margin: 0 0 1rem;
        }

        .section-desc {
          font-size: 1.05rem;
          color: #64748b;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto auto;
          gap: 1.5rem;
        }

        .feature-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 2.25rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          min-height: 320px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: #cbd5e1;
          box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.04);
        }

        .feature-card.large-card {
          grid-column: span 2;
          flex-direction: row;
          align-items: center;
          gap: 2rem;
        }

        .feature-card.large-card .card-content {
          flex: 1;
        }

        .card-icon {
          font-size: 1.75rem;
          margin-bottom: 1.25rem;
        }

        .feature-card h4 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.65rem;
        }

        .feature-card p {
          font-size: 0.925rem;
          line-height: 1.55;
          color: #64748b;
          margin: 0;
        }

        .card-graphic-wireframe {
          width: 160px;
          height: 160px;
          border: 1px solid #f1f5f9;
          background: radial-gradient(circle, #f8fafc 0%, transparent 70%);
          border-radius: 50%;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .wireframe-circle {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          transform: rotateY(55deg);
        }

        .wireframe-circle.horizontal {
          transform: rotateX(55deg);
        }

        .card-graphic-rocket {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          margin-top: 1.5rem;
        }

        .rocket-icon-glow {
          font-size: 2.2rem;
          filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.1));
          animation: float 3s ease-in-out infinite;
        }

        .card-graphic-devices {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 0.75rem;
          height: 90px;
          margin-top: 1.5rem;
        }

        .device-screen {
          background: #0f172a;
          border: 1.5px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px 8px 0 0;
        }

        .device-screen.desktop {
          width: 90px;
          height: 60px;
        }

        .device-screen.phone {
          width: 32px;
          height: 52px;
          border-radius: 6px;
        }

        .card-graphic-database {
          width: 140px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .db-layer {
          height: 24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
          position: relative;
        }

        .db-layer::after {
          content: '';
          position: absolute;
          left: 10px;
          top: 9px;
          width: 6px;
          height: 6px;
          background-color: #10b981;
          border-radius: 50%;
        }

        /* Checklist Section */
        .checklist-section {
          background-color: #ffffff;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          padding: 6rem 2rem;
          box-sizing: border-box;
        }

        .checklist-grid {
          max-width: 1100px;
          margin: 4rem auto 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2.5rem 2rem;
        }

        .checklist-item {
          display: flex;
          gap: 0.95rem;
          text-align: left;
        }

        .check-icon {
          color: #0f172a;
          font-weight: 900;
          font-size: 1.05rem;
          line-height: 1.35;
        }

        .checklist-item h5 {
          margin: 0 0 0.45rem;
          font-size: 0.975rem;
          font-weight: 700;
          color: #0f172a;
        }

        .checklist-item p {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #64748b;
        }

        /* Bottom Section - White background with a touch of dark/black aura eclipse arc */
        .glow-section {
          background-color: #ffffff;
          color: #334155;
          padding: 7rem 2rem 0;
          text-align: center;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
          border-bottom: 1px solid #f1f5f9;
        }

        .glow-content {
          max-width: 720px;
          margin-bottom: 4rem;
          z-index: 5;
        }

        .glow-badge {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 1.5rem;
        }

        .glow-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -1.25px;
          color: #0f172a;
          margin: 0 0 1.25rem;
        }

        .glow-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #64748b;
          margin: 0 auto 2.5rem;
        }

        /* Glow universe styled as White theme with a dark/black aura eclipse arc */
        .glow-universe-container {
          position: relative;
          width: 100%;
          max-width: 1200px;
          height: 320px;
          margin-top: 1rem;
          display: flex;
          justify-content: center;
        }

        .glow-universe-arc {
          width: 1000px;
          height: 1000px;
          border-radius: 50%;
          border: 1px solid rgba(15, 23, 42, 0.05);
          background: radial-gradient(circle at top, rgba(15, 23, 42, 0.02) 0%, transparent 70%);
          position: absolute;
          top: 0;
          box-shadow: 0 -20px 80px rgba(15, 23, 42, 0.04);
        }

        .glow-universe-light {
          position: absolute;
          top: -20px;
          width: 500px;
          height: 100px;
          background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.03) 0%, transparent 70%);
          filter: blur(15px);
        }

        /* Footer Main */
        .landing-footer-main {
          background-color: #ffffff;
          padding: 5rem 3rem 2.5rem;
          box-sizing: border-box;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 3rem;
          padding-bottom: 4rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .footer-brand {
          max-width: 320px;
        }

        .footer-brand p {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-top: 1rem;
        }

        .footer-links {
          display: flex;
          gap: 5rem;
        }

        .link-group {
          display: flex;
          flex-direction: column;
          gap: 0.95rem;
        }

        .link-group h6 {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .link-group a {
          color: #64748b;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.25s ease;
        }

        .link-group a:hover {
          color: #0f172a;
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 2rem;
          display: flex;
          justify-content: center;
          font-size: 0.8rem;
          color: #94a3b8;
        }

        /* Keyframe animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes pulse-green {
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

        /* Responsive Breakpoints matching Figma compatibility */
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .feature-card.large-card {
            grid-column: span 1;
            flex-direction: column;
            align-items: flex-start;
          }
          .checklist-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-links {
            gap: 3rem;
          }
        }

        @media (max-width: 768px) {
          .landing-header {
            padding: 1.25rem 1.5rem;
          }
          .hero-section {
            padding: 3rem 1rem 4rem;
          }
          .hero-title {
            font-size: 2.3rem;
            letter-spacing: -1px;
          }
          .hero-description {
            font-size: 1.05rem;
          }
          .hero-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 320px;
            gap: 0.75rem;
          }
          .btn-primary {
            text-align: center;
          }
          .dashboard-mockup-wrapper {
            padding: 0.45rem;
            border-radius: 20px;
          }
          .mockup-body {
            height: 380px;
          }
          .mockup-sidebar {
            display: none;
          }
          .glow-title {
            font-size: 2.1rem;
          }
          .footer-content {
            flex-direction: column;
            gap: 2.5rem;
          }
        }
      `}</style>
    </main>
  );
}
