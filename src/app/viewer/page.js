'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

function ViewerContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) {
      setError('Kode model tidak ditemukan. Pastikan URL memiliki parameter ?code=...');
      setLoading(false);
      return;
    }

    fetch(`/api/model?code=${code}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Model tidak ditemukan di server.');
        }
        return res.json();
      })
      .then((data) => {
        setModelUrl(data.url);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  return (
    <main className="viewer-container">
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <header className="viewer-header">
        <h1 className="logo-text">AR Model <span>Lite</span></h1>
        {code && <span className="model-id">ID: {code.substring(0, 8)}</span>}
      </header>

      <section className="viewer-content">
        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p className="loading-text">Memuat model 3D Anda...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Error Terjadi</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && modelUrl && (
          <div className="model-viewer-wrapper">
            <model-viewer
              src={modelUrl}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              poster="/poster.webp"
              shadow-intensity="1.5"
              shadow-softness="0.8"
              auto-rotate
              class="custom-viewer"
            >
              <button slot="ar-button" id="ar-button">
                🕶️ Lihat di Ruangan (AR)
              </button>

              <div id="ar-prompt">
                <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="AR prompt hand icon" />
              </div>
            </model-viewer>
          </div>
        )}
      </section>

      <footer className="viewer-footer">
        <p>© 2026 AR Model Lite | Clean Web & Mobile Viewer</p>
      </footer>

      <style jsx global>{`
        /* Global & Reset Styles - Light Mode */
        body {
          margin: 0;
          padding: 0;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #f8fafc;
          color: #334155;
          overflow-x: hidden;
        }

        .viewer-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, #ffffff 0%, #f1f5f9 100%);
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          z-index: 10;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
        }

        .logo-text {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #0f172a;
        }

        .logo-text span {
          font-weight: 300;
          color: #64748b;
        }

        .model-id {
          font-size: 0.8rem;
          font-weight: 600;
          background: #f1f5f9;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .viewer-content {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 1.5rem;
        }

        /* Loader & Error - Modern minimalist cards */
        .loader-container, .error-container {
          text-align: center;
          padding: 3rem 2rem;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
          max-width: 380px;
          width: 100%;
          animation: fadeIn 0.4s ease-out;
        }

        .spinner {
          width: 44px;
          height: 44px;
          border: 3.5px solid #f1f5f9;
          border-left-color: #0f172a;
          border-radius: 50%;
          margin: 0 auto 1.25rem;
          animation: spin 0.8s linear infinite;
        }

        .loading-text {
          font-weight: 600;
          color: #475569;
          margin: 0;
          font-size: 0.95rem;
        }

        .error-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .error-container h2 {
          margin: 0 0 0.5rem;
          color: #ef4444;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .error-container p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
        }

        /* Model Viewer Wrapper - Pure White modern card */
        .model-viewer-wrapper {
          width: 100%;
          height: calc(100vh - 160px);
          max-height: 850px;
          border-radius: 28px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);
          position: relative;
          animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .custom-viewer {
          width: 100%;
          height: 100%;
          background-color: #ffffff;
          --poster-color: transparent;
        }

        /* AR Button - Ultra Clean IOS/Stripe-like dark slate button */
        #ar-button {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 0.85rem 1.85rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.925rem;
          box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.25);
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 20;
          border: 1px solid rgba(255, 255, 255, 0.05);
          letter-spacing: -0.1px;
        }

        #ar-button:hover {
          background: #1e293b;
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(15, 23, 42, 0.35);
        }

        #ar-button:active {
          transform: translateX(-50%) translateY(0);
        }

        /* AR Prompt Hand Animation */
        #ar-prompt {
          position: absolute;
          left: 50%;
          bottom: 6.5rem;
          transform: translateX(-50%);
          display: none;
          pointer-events: none;
          animation: moveHand 3s ease-in-out infinite;
        }

        #ar-prompt img {
          width: 44px;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
        }

        model-viewer[ar-status="session-started"] #ar-prompt {
          display: block;
        }

        .viewer-footer {
          text-align: center;
          padding: 1.25rem;
          font-size: 0.8rem;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleUp {
          from { transform: scale(0.97); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes moveHand {
          0%, 100% { transform: translate(-50%, 0px); }
          50% { transform: translate(-30%, -8px); }
        }

        /* Responsive Design - Mobile Optimized */
        @media (max-width: 640px) {
          .viewer-header {
            padding: 1rem 1.25rem;
          }
          #ar-button {
            bottom: 1.5rem;
            width: 85%;
            text-align: center;
            border-radius: 12px;
            padding: 0.9rem 1.5rem;
          }
          .model-viewer-wrapper {
            height: calc(100vh - 130px);
            border-radius: 20px;
          }
          .viewer-content {
            padding: 0.75rem;
          }
        }
      `}</style>
    </main>
  );
}

export default function Viewer() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#64748b' }}>
        <div>Memuat antarmuka...</div>
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
