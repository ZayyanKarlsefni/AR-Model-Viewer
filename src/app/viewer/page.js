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
  const [logs, setLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(true);
  const watchdogTimerRef = useRef(null);
  const logsEndRef = useRef(null);

  const addLog = (level, text) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-49), { timestamp, level, text }]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalHost(isLocal);

      // Listen for diagnostic logs from CAD Viewer iframe
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'CAD_DIAGNOSTIC_LOG') {
          addLog(event.data.level || 'info', event.data.text);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    addLog('info', 'Inisialisasi CAD Viewer Workbench...');

    // Start 20-second loading watchdog timer
    watchdogTimerRef.current = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          addLog('error', '⏱️ TIMEOUT: Loading melebihi 20 detik.');
          setError('⏱️ Timeout (20s): Pemuatan file model CAD dari Cloudflare R2 melebihi 20 detik. Silakan periksa Diagnostic Log Panel di bawah.');
          return false;
        }
        return false;
      });
    }, 20000);

    if (file) {
      addLog('info', `Menggunakan parameter file langsung: ${file}`);
      setTargetFileRef(file);
      setModelUrl(file);
      setLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      return;
    }

    if (!code) {
      addLog('error', 'Kode model tidak ditemukan di URL.');
      setError('Kode model tidak ditemukan. Pastikan URL memiliki parameter ?code=... atau ?file=...');
      setLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      return;
    }

    addLog('info', `Mengambil metadata model untuk kode: ${code}`);
    fetch(`/api/model?code=${code}`)
      .then((res) => {
        addLog('info', `API /api/model status: ${res.status} ${res.statusText}`);
        if (!res.ok) {
          throw new Error('Model tidak ditemukan di server.');
        }
        return res.json();
      })
      .then((data) => {
        addLog('info', `URL Model diterima: ${data.url || 'N/A'}`);
        setModelUrl(data.url);
        const fileRef = data.key || `models/${code}.step`;
        addLog('info', `File Reference CAD: ${fileRef}`);
        setTargetFileRef(fileRef);
        setLoading(false);
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);

        fetch('/api/admin/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        }).catch(() => {});
      })
      .catch((err) => {
        addLog('error', `Error fetching model metadata: ${err.message}`);
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

      {/* TOP BAR */}
      <header className="viewer-header">
        <h1 className="logo-text">AR Model <span>Lite</span></h1>
        
        <div className="view-mode-toggle">
          <button
            className={`mode-btn ${viewMode === 'cad' ? 'active' : ''}`}
            onClick={() => setViewMode('cad')}
          >
            📊 CAD Workbench (Full Inspection)
          </button>
          <button
            className={`mode-btn ${viewMode === 'ar' ? 'active' : ''}`}
            onClick={() => setViewMode('ar')}
          >
            📱 3D & WebAR Viewer (Mobile)
          </button>
        </div>

        <div className="header-actions">
          <button
            className="console-toggle-btn"
            onClick={() => setShowConsole(!showConsole)}
          >
            📋 Logs ({logs.length})
          </button>
          {code && <span className="model-id">ID: {code.substring(0, 8)}</span>}
        </div>
      </header>

      <section className="viewer-content">
        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p className="loading-text">Memuat CAD Workbench Full Inspection...</p>
            <p className="loading-subtext">Mengunduh biner STEP dari Cloudflare R2...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon-box">⚠️</div>
            <h2>Status Pemuatan</h2>
            <p className="error-desc">{error}</p>
            <button className="reload-btn" onClick={handleReload}>
              🔄 Coba Muat Ulang Halaman
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {viewMode === 'cad' && (
              <div className="cad-workbench-wrapper">
                <iframe
                  src={cadViewerIframeUrl}
                  className="cad-workbench-iframe"
                  title="Native Built-in CAD Workbench Viewer"
                />
              </div>
            )}

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
                </model-viewer>
              </div>
            )}
          </>
        )}
      </section>

      {/* REAL-TIME DIAGNOSTIC CONSOLE OVERLAY */}
      {showConsole && (
        <div className="diagnostic-console">
          <div className="console-header">
            <span>📋 Real-Time Diagnostic Error Logs ({logs.length} entries)</span>
            <button className="close-console-btn" onClick={() => setShowConsole(false)}>✕</button>
          </div>
          <div className="console-body">
            {logs.length === 0 ? (
              <div className="log-line info">[System] Belum ada log tercatat...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`log-line ${log.level}`}>
                  <span className="log-time">[{log.timestamp}]</span>{' '}
                  <span className="log-level">[{log.level.toUpperCase()}]</span>{' '}
                  <span className="log-text">{log.text}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

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
          position: relative;
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .console-toggle-btn {
          background: #334155;
          color: #38bdf8;
          border: 1px solid #0284c7;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
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

        .cad-workbench-wrapper, .cad-workbench-iframe, .model-viewer-wrapper, .custom-viewer {
          width: 100%;
          height: 100%;
          border: none;
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
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #334155;
          border-top-color: #38bdf8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* DIAGNOSTIC CONSOLE STYLES */
        .diagnostic-console {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          max-height: 220px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid #38bdf8;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(8px);
        }

        .console-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0.8rem;
          background: #1e293b;
          border-bottom: 1px solid #334155;
          font-size: 0.75rem;
          font-weight: 700;
          color: #38bdf8;
        }

        .close-console-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .console-body {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem 0.8rem;
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 0.72rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .log-line {
          word-break: break-all;
          line-height: 1.4;
        }

        .log-line.info {
          color: #94a3b8;
        }

        .log-line.warn {
          color: #fbbf24;
        }

        .log-line.error {
          color: #f87171;
          font-weight: 600;
        }

        .log-time {
          color: #64748b;
        }

        .log-level {
          color: #38bdf8;
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
