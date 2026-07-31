'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

function ViewerContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const file = searchParams.get('file');
  const [modelUrl, setModelUrl] = useState(null);
  const [targetFileRef, setTargetFileRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cad');
  const [isLocalHost, setIsLocalHost] = useState(false);
  const watchdogTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalHost(isLocal);
    }
  }, []);

  useEffect(() => {
    // Start 15-second loading watchdog timer
    watchdogTimerRef.current = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          setError('⏱️ Timeout (15 Detik): Proses pemuatan file model CAD dari server melebihi batas waktu 15 detik. Silakan periksa koneksi internet Anda dan coba muat ulang.');
          return false;
        }
        return false;
      });
    }, 15000);

    if (file) {
      setTargetFileRef(file);
      setModelUrl(file);
      setLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      return;
    }

    if (!code) {
      setError('Kode model tidak ditemukan. Pastikan URL memiliki parameter ?code=... atau ?file=...');
      setLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
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
        const fileRef = data.key || `models/${code}.step`;
        setTargetFileRef(fileRef);
        setLoading(false);
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);

        // Record visit
        fetch('/api/admin/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        }).catch(() => {});
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      });

    return () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    };
  }, [code, file]);

  const handleReload = () => {
    setError(null);
    setLoading(true);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Construct iframe URL for CAD Workbench
  let cadViewerIframeUrl = '';
  if (targetFileRef) {
    cadViewerIframeUrl = `/cad-viewer/index.html?file=${encodeURIComponent(targetFileRef)}`;
  } else if (code) {
    cadViewerIframeUrl = `/cad-viewer/index.html?file=${encodeURIComponent(`models/${code}.step`)}`;
  }

  return (
    <main className="viewer-container">
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      {/* TOP BAR MODE TOGGLE */}
      <header className="viewer-header">
        <h1 className="logo-text">AR Model <span>Lite</span></h1>
        
        <div className="view-mode-toggle">
          <button
            className={`mode-btn ${viewMode === 'cad' ? 'active' : ''}`}
            onClick={() => setViewMode('cad')}
          >
            📊 CAD Workbench (Full Inspection & Controls)
          </button>
          <button
            className={`mode-btn ${viewMode === 'ar' ? 'active' : ''}`}
            onClick={() => setViewMode('ar')}
          >
            📱 3D & WebAR Viewer (Mobile)
          </button>
        </div>

        <div className="header-actions">
          {code && <span className="model-id">ID: {code.substring(0, 8)}</span>}
        </div>
      </header>

      <section className="viewer-content">
        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p className="loading-text">Memuat CAD Workbench Full Inspection...</p>
            <p className="loading-subtext">Mengunduh file STEP biner dari Cloudflare R2 (Batas waktu: 15s)...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon-box">⚠️</div>
            <h2>Peringatan Pemuatan</h2>
            <p className="error-desc">{error}</p>
            <button className="reload-btn" onClick={handleReload}>
              🔄 Coba Muat Ulang Halaman
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 1. NATIVE BUNDLED FULL CAD WORKBENCH */}
            {viewMode === 'cad' && (
              <div className="cad-workbench-wrapper">
                <iframe
                  src={cadViewerIframeUrl}
                  className="cad-workbench-iframe"
                  title="Native Built-in CAD Workbench Viewer"
                />
              </div>
            )}

            {/* 2. WEBAR & 3D CLOUD VIEW */}
            {viewMode === 'ar' && modelUrl && (
              <div className="model-viewer-wrapper">
                <model-viewer
                  src={modelUrl}
                  ar
                  ar-scale="fixed"
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls
                  poster="/poster.webp"
                  shadow-intensity="1.5"
                  shadow-softness="0.8"
                  auto-rotate
                  rotation-per-second="25deg"
                  interpolation-decay="200"
                  className="custom-viewer"
                >
                  <button slot="ar-button" id="ar-button">
                    📱 Lihat di Ruangan (AR)
                  </button>

                  <div id="ar-prompt">
                    <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="AR prompt hand icon" />
                  </div>
                </model-viewer>
              </div>
            )}
          </>
        )}
      </section>

      <style jsx>{`
        .viewer-container {
          width: 100vw;
          height: 100vh;
          background: #0f172a;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          font-family: var(--font-jetbrains-mono), monospace;
          overflow: hidden;
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1.25rem;
          background: #1e293b;
          border-bottom: 1px solid #334155;
          z-index: 20;
        }

        .logo-text {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f8fafc;
          margin: 0;
        }

        .logo-text span {
          color: #38bdf8;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .view-mode-toggle {
          display: flex;
          gap: 0.5rem;
          background: #0f172a;
          padding: 0.25rem;
          border-radius: 8px;
          border: 1px solid #334155;
        }

        .mode-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-btn.active {
          background: #0284c7;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
        }

        .mode-btn:hover:not(.active) {
          color: #f8fafc;
          background: #1e293b;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .model-id {
          font-size: 0.75rem;
          color: #64748b;
          background: #0f172a;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          border: 1px solid #334155;
        }

        .viewer-content {
          flex: 1;
          position: relative;
          width: 100%;
          height: calc(100vh - 48px);
        }

        .cad-workbench-wrapper {
          width: 100%;
          height: 100%;
          border: none;
        }

        .cad-workbench-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .model-viewer-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .custom-viewer {
          width: 100%;
          height: 100%;
          --poster-color: transparent;
        }

        #ar-button {
          background-color: #0284c7;
          border-radius: 8px;
          border: none;
          position: absolute;
          bottom: 24px;
          right: 24px;
          color: white;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
          cursor: pointer;
          z-index: 100;
        }

        .loader-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1rem;
          padding: 2rem;
          text-align: center;
        }

        .loading-subtext {
          font-size: 0.8rem;
          color: #64748b;
        }

        .error-icon-box {
          font-size: 2.5rem;
        }

        .error-desc {
          max-width: 500px;
          line-height: 1.5;
          color: #f87171;
          font-size: 0.9rem;
        }

        .reload-btn {
          background: #0284c7;
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: background 0.2s;
        }

        .reload-btn:hover {
          background: #0369a1;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #334155;
          border-top-color: #38bdf8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewerContent />
    </Suspense>
  );
}
