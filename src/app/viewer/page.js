'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

function ViewerContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  }, [code]);

  // Hook into model-viewer to detect animations
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv) return;

    const onLoad = () => {
      if (mv.availableAnimations && mv.availableAnimations.length > 0) {
        setHasAnimation(true);
        setSliderValue(0);
        mv.pause();
      } else {
        setHasAnimation(false);
      }
    };

    mv.addEventListener('load', onLoad);
    return () => {
      mv.removeEventListener('load', onLoad);
    };
  }, [modelUrl]);

  // Handle user manual interaction to pause Presentation Mode
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv) return;

    const onUserInteraction = () => {
      if (isPresenting) {
        stopPresentation();
      }
    };

    mv.addEventListener('user-interaction', onUserInteraction);
    return () => {
      mv.removeEventListener('user-interaction', onUserInteraction);
    };
  }, [isPresenting]);

  // Cleanup presentation interval on unmount
  useEffect(() => {
    return () => {
      if (presentationIntervalRef.current) {
        clearInterval(presentationIntervalRef.current);
      }
    };
  }, []);

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
    }, 5000);
  };

  const stopPresentation = () => {
    setIsPresenting(false);
    if (presentationIntervalRef.current) {
      clearInterval(presentationIntervalRef.current);
      presentationIntervalRef.current = null;
    }
  };

  const togglePresentation = () => {
    if (isPresenting) {
      stopPresentation();
    } else {
      startPresentation();
    }
  };

  // Control animation time based on slider input
  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);
    
    const mv = viewerRef.current;
    if (mv && mv.duration) {
      mv.currentTime = (val / 100) * mv.duration;
    }
  };

  return (
    <main className="viewer-container">
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <header className="viewer-header">
        <h1 className="logo-text">AR Model <span>Lite</span></h1>
        
        <div className="header-actions">
          {!loading && !error && modelUrl && (
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

        {!loading && !error && modelUrl && (
          <div className="model-viewer-wrapper">
            {/* Presentation Active Badge */}
            {isPresenting && (
              <div className="presentation-badge">
                <span className="rec-dot"></span> PRESENTASI SINEMATIK AKTIF
              </div>
            )}

            <model-viewer
              ref={viewerRef}
              src={modelUrl}
              ar
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

            {/* Custom interactive Exploded View Slider */}
            {hasAnimation && (
              <div className="exploded-slider-container">
                <span className="slider-label">Urai Model</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="exploded-slider"
                />
                <span className="slider-value">{sliderValue}%</span>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="viewer-footer">
        <p>© 2026 AR Model Lite | Clean Web & Mobile Viewer</p>
      </footer>

      <style jsx global>{`
        /* Global & Reset Styles - Light Mode - Prevents double scrollbars */
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
          background: #f8fafc;
          color: #334155;
          font-family: var(--font-jetbrains-mono), monospace;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .viewer-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          background: radial-gradient(circle at 50% 0%, #ffffff 0%, #f1f5f9 100%);
          box-sizing: border-box;
        }

        .viewer-header {
          flex: 0 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
          padding: 0 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          z-index: 10;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
          box-sizing: border-box;
        }

        .logo-text {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #0f172a;
        }

        .logo-text span {
          font-weight: 300;
          color: #64748b;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .present-btn {
          background: #ffffff;
          border: 1px solid #0f172a;
          color: #0f172a;
          padding: 0.45rem 1rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .present-btn:hover {
          background: #0f172a;
          color: #ffffff;
        }

        .present-btn.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
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

        /* Viewport takes exactly the remaining screen space */
        .viewer-content {
          flex: 1 1 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 1.5rem;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* Loader & Error */
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
          box-sizing: border-box;
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

        .error-icon-box {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ef4444;
          width: 50px;
          height: 50px;
          border: 3px solid #ef4444;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 1rem;
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

        /* Model Viewer Wrapper - Fills content space exactly */
        .model-viewer-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 24px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 15px 30px -10px rgba(15, 23, 42, 0.06);
          position: relative;
          animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        model-viewer, .custom-viewer {
          width: 100% !important;
          height: 100% !important;
          background-color: #ffffff;
          --poster-color: transparent;
        }

        /* Presentation Active Badge Overlay */
        .presentation-badge {
          position: absolute;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          color: #ffffff;
          padding: 0.45rem 1rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 25;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .rec-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          animation: pulseDot 1.5s infinite;
        }

        @keyframes pulseDot {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* AR Button - Ultra Clean Dark Slate Button */
        #ar-button {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 0.85rem 1.85rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.925rem;
          box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 20;
          border: 1px solid rgba(255, 255, 255, 0.05);
          letter-spacing: -0.1px;
        }

        #ar-button:hover {
          background: #1e293b;
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 12px 25px -4px rgba(15, 23, 42, 0.3);
        }

        #ar-button:active {
          transform: translateX(-50%) translateY(0);
        }

        /* Custom Interactive Exploded View Slider Styling */
        .exploded-slider-container {
          position: absolute;
          bottom: 5.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
          width: 85%;
          max-width: 400px;
          z-index: 25;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        .slider-label {
          font-size: 0.725rem;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .exploded-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 9999px;
          background: #e2e8f0;
          outline: none;
        }

        .exploded-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0f172a;
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .exploded-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .slider-value {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          width: 32px;
          text-align: right;
        }

        /* AR Prompt Hand Animation */
        #ar-prompt {
          position: absolute;
          left: 50%;
          bottom: 9rem;
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
          flex: 0 0 auto;
          text-align: center;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          box-sizing: border-box;
        }

        .viewer-footer p {
          margin: 0;
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
          from { transform: scale(0.98); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes moveHand {
          0%, 100% { transform: translate(-50%, 0px); }
          50% { transform: translate(-30%, -8px); }
        }

        /* Responsive Design - Mobile Optimized */
        @media (max-width: 640px) {
          .viewer-header {
            padding: 0 1rem;
            height: 56px;
          }
          .present-btn {
            padding: 0.35rem 0.65rem;
            font-size: 0.675rem;
          }
          #ar-button {
            bottom: 1.25rem;
            width: 85%;
            text-align: center;
            border-radius: 10px;
            padding: 0.85rem 1.25rem;
          }
          .exploded-slider-container {
            bottom: 5.25rem;
            width: 90%;
            padding: 0.65rem 1.25rem;
          }
          .model-viewer-wrapper {
            border-radius: 16px;
          }
          .viewer-content {
            padding: 0.75rem;
          }
          .viewer-footer {
            height: 40px;
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
