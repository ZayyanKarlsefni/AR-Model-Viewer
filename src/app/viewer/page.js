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

    // Ambil model URL dari API
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
      {/* Script Google Model Viewer */}
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <header className="viewer-header">
        <h1 className="logo-text">AR Model <span>Lite</span></h1>
        {code && <span className="model-id">ID: {code.substring(0, 8)}...</span>}
      </header>

      <section className="viewer-content">
        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p className="loading-text">Memuat Model 3D...</p>
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
              shadow-intensity="1"
              auto-rotate
              class="custom-viewer"
            >
              <button slot="ar-button" id="ar-button">
                👋 Lihat di Ruangan Anda (AR)
              </button>

              <div id="ar-prompt">
                <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="AR prompt hand icon" />
              </div>
            </model-viewer>
          </div>
        )}
      </section>

      <footer className="viewer-footer">
        <p>© 2026 AR Model Lite | Diklaim Kembali & Diperbaiki</p>
      </footer>

      <style jsx global>{`
        /* Global & Reset Styles */
        body {
          margin: 0;
          padding: 0;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #0d0f14;
          color: #f3f4f6;
          overflow-x: hidden;
        }

        .viewer-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: radial-gradient(circle at center, #1b2130 0%, #0d0f14 100%);
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(13, 15, 20, 0.6);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 10;
        }

        .logo-text {
          margin: 0;
          font-size: 1.5rem;
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

        .model-id {
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          color: #9ca3af;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .viewer-content {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 1rem;
        }

        /* Loader & Error */
        .loader-container, .error-container {
          text-align: center;
          padding: 3rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          max-width: 400px;
          width: 100%;
          animation: fadeIn 0.5s ease-out;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(59, 130, 246, 0.1);
          border-left-color: #3b82f6;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          font-weight: 500;
          color: #9ca3af;
          margin: 0;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-container h2 {
          margin: 0 0 0.5rem;
          color: #ef4444;
        }

        .error-container p {
          color: #9ca3af;
          margin: 0;
        }

        /* Model Viewer Styles */
        .model-viewer-wrapper {
          width: 100%;
          height: calc(100vh - 140px);
          max-height: 800px;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .custom-viewer {
          width: 100%;
          height: 100%;
          --poster-color: transparent;
        }

        /* AR Button Customization */
        #ar-button {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 0.85rem 1.75rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 20;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        #ar-button:hover {
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.6);
        }

        #ar-button:active {
          transform: translateX(-50%) translateY(0);
        }

        /* AR Prompt Hand Animation */
        #ar-prompt {
          position: absolute;
          left: 50%;
          bottom: 6rem;
          transform: translateX(-50%);
          display: none;
          pointer-events: none;
          animation: moveHand 3s ease-in-out infinite;
        }

        #ar-prompt img {
          width: 50px;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
        }

        /* Displays hand prompt when in AR placement Mode */
        model-viewer[ar-status="session-started"] #ar-prompt {
          display: block;
        }

        .viewer-footer {
          text-align: center;
          padding: 1.5rem;
          font-size: 0.8rem;
          color: #4b5563;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          background: rgba(13, 15, 20, 0.4);
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes moveHand {
          0%, 100% { transform: translate(-50%, 0px); }
          50% { transform: translate(-30%, -10px); }
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .viewer-header {
            padding: 1rem;
          }
          #ar-button {
            bottom: 1.5rem;
            width: 80%;
            text-align: center;
          }
          .model-viewer-wrapper {
            height: calc(100vh - 120px);
            border-radius: 16px;
          }
        }
      `}</style>
    </main>
  );
}

export default function Viewer() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0d0f14', color: '#9ca3af' }}>
        <div>Memuat antarmuka...</div>
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
