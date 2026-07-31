'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

function ViewerContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const file = searchParams.get('file');
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cad'); // 'cad' for CAD Workbench UI, 'ar' for Model-Viewer AR

  // States for Exploded View
  const [hasAnimation, setHasAnimation] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // States for Presentation Mode (Cinematic Showcase)
  const [isPresenting, setIsPresenting] = useState(false);
  const presentationIntervalRef = useRef(null);
  const currentAngleIndexRef = useRef(0);
  const viewerRef = useRef(null);

  const cinematicAngles = [
    '45deg 55deg 105%',  // Isometric Overview
    '135deg 75deg 75%',  // Close-up Component Detail
    '225deg 85deg 110%', // Side Low-angle Elevation
    '315deg 45deg 95%'   // High Top-Down Angle
  ];

  useEffect(() => {
    if (file) {
      // Direct local file path
      const fullPath = file.startsWith('http') ? file : `http://127.0.0.1:5173/?dir=D:\\Plugin\\Text-To-CAD\\models&file=${file}`;
      setModelUrl(fullPath);
      setLoading(false);
      return;
    }

    if (!code) {
      setError('Kode model tidak ditemukan. Pastikan URL memiliki parameter ?code=... atau ?file=...');
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

        // Record client visit log
        fetch('/api/admin/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        }).catch(() => {});
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [code, file]);

  const togglePresentation = () => {
    if (isPresenting) {
      stopPresentation();
    } else {
      startPresentation();
    }
  };

  const startPresentation = () => {
    const mv = viewerRef.current;
    if (!mv) return;

    setIsPresenting(true);
    currentAngleIndexRef.current = 0;
    mv.cameraOrbit = cinematicAngles[0];

    presentationIntervalRef.current = setInterval(() => {
      currentAngleIndexRef.current = (currentAngleIndexRef.current + 1) % cinematicAngles.length;
      if (viewerRef.current) {
        viewerRef.current.cameraOrbit = cinematicAngles[currentAngleIndexRef.current];
      }
    }, 4500);
  };

  const stopPresentation = () => {
    setIsPresenting(false);
    if (presentationIntervalRef.current) {
      clearInterval(presentationIntervalRef.current);
      presentationIntervalRef.current = null;
    }
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setSliderValue(val);

    const mv = viewerRef.current;
    if (mv && mv.duration) {
      mv.currentTime = val * mv.duration;
    }
  };

  // Determine CAD Workbench Viewer iframe URL
  let cadViewerIframeUrl = 'http://127.0.0.1:5173/';
  if (file) {
    cadViewerIframeUrl = `http://127.0.0.1:5173/?dir=D:\\Plugin\\Text-To-CAD\\models&file=${file}`;
  } else if (modelUrl) {
    if (modelUrl.startsWith('http')) {
      cadViewerIframeUrl = `http://127.0.0.1:5173/?file=${encodeURIComponent(modelUrl)}`;
    } else {
      const fullOriginUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${modelUrl}`;
      cadViewerIframeUrl = `http://127.0.0.1:5173/?file=${encodeURIComponent(fullOriginUrl)}`;
    }
  }

  return (
    <main className="viewer-container">
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <header className="viewer-header">
        <h1 className="logo-text">AR Model <span>Lite</span></h1>
        
        <div className="view-mode-toggle">
          <button
            className={`mode-btn ${viewMode === 'cad' ? 'active' : ''}`}
            onClick={() => setViewMode('cad')}
          >
            📊 CAD Workbench (Tree & Inspection)
          </button>
          <button
            className={`mode-btn ${viewMode === 'ar' ? 'active' : ''}`}
            onClick={() => setViewMode('ar')}
          >
            📱 WebAR & Cinematic Mode
          </button>
        </div>

        <div className="header-actions">
          {!loading && !error && modelUrl && viewMode === 'ar' && (
            <button
              onClick={togglePresentation}
              className={`present-btn ${isPresenting ? 'active' : ''}`}
            >
              {isPresenting ? 'HENTIKAN PRESENTASI' : 'PRESENTASI SINEMATIK'}
            </button>
          )}
          {code && <span className="model-id">ID: {code.substring(0, 8)}</span>}
        </div>
      </header>

      <section className="viewer-content">
        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p className="loading-text">Memuat model 3D...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon-box">!</div>
            <h2>Error Terjadi</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 1. CAD WORKBENCH VIEW (Full Inspection Sidebar, Parts Tree, Appearance, Gizmo) */}
            {viewMode === 'cad' && (
              <div className="cad-workbench-wrapper">
                <iframe
                  src={cadViewerIframeUrl}
                  className="cad-workbench-iframe"
                  title="CAD Workbench 3D Inspection"
                />
              </div>
            )}

            {/* 2. WEBAR & CINEMATIC MODE */}
            {viewMode === 'ar' && modelUrl && (
              <div className="model-viewer-wrapper">
                {isPresenting && (
                  <div className="presentation-badge">
                    <span className="rec-dot"></span> PRESENTASI SINEMATIK AKTIF
                  </div>
                )}

                <model-viewer
                  ref={viewerRef}
                  src={modelUrl}
                  ar
                  ar-scale="fixed"
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls
                  poster="/poster.webp"
                  shadow-intensity="1.5"
                  shadow-softness="0.8"
                  auto-rotate={isPresenting || !hasAnimation}
                  rotation-per-second={isPresenting ? "12deg" : "30deg"}
                  interpolation-decay="200"
                  className="custom-viewer"
                >
                  <button slot="ar-button" id="ar-button">
                    Lihat di Ruangan (AR)
                  </button>

                  <div id="ar-prompt">
                    <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="AR prompt hand icon" />
                  </div>
                </model-viewer>

                {hasAnimation && (
                  <div className="exploded-slider-container">
                    <span className="slider-label">Urai Model</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={sliderValue}
                      onChange={handleSliderChange}
                      className="exploded-slider"
                    />
                  </div>
                )}
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
          padding: 0.75rem 1.5rem;
          background: #1e293b;
          border-bottom: 1px solid #334155;
          z-index: 20;
        }

        .logo-text {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f8fafc;
          margin: 0;
        }

        .logo-text span {
          color: #38bdf8;
          font-size: 0.85rem;
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
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.8rem;
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

        .present-btn {
          background: #334155;
          color: #f8fafc;
          border: 1px solid #475569;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .present-btn.active {
          background: #e11d48;
          border-color: #f43f5e;
          animation: pulse 2s infinite;
        }

        .viewer-content {
          flex: 1;
          position: relative;
          width: 100%;
          height: calc(100vh - 55px);
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
