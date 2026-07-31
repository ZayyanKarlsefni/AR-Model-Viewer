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
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'display' | 'appearance'
  const [partsList, setPartsList] = useState([]);
  const [hiddenParts, setHiddenParts] = useState({});
  const [selectedPart, setSelectedPart] = useState(null);

  // Appearance & Display State
  const [themeMode, setThemeMode] = useState('dark');
  const [exposure, setExposure] = useState(1.0);
  const [shadowIntensity, setShadowIntensity] = useState(1.5);
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);

  // States for Presentation Mode
  const [isPresenting, setIsPresenting] = useState(false);
  const presentationIntervalRef = useRef(null);
  const currentAngleIndexRef = useRef(0);
  const viewerRef = useRef(null);

  const cinematicAngles = [
    '45deg 55deg 105%',
    '135deg 75deg 75%',
    '225deg 85deg 110%',
    '315deg 45deg 95%'
  ];

  useEffect(() => {
    if (file) {
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

  // Extract Assembly Parts Tree from model-viewer GLTF Scene
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv) return;

    const handleLoad = () => {
      try {
        const symbol = Object.getOwnPropertySymbols(mv).find(s => s.description === 'scene' || s.toString().includes('scene'));
        const scene = mv[symbol] || mv.model?.gltf?.scene;
        
        const extractedParts = [];
        if (mv.model && mv.model.materials) {
          mv.model.materials.forEach((mat, idx) => {
            extractedParts.push({
              id: `mat-${idx}`,
              name: mat.name || `Assembly Component : ${idx + 1}`,
              type: 'Material / Body',
              visible: true
            });
          });
        }

        if (extractedParts.length === 0) {
          // Default Part Hierarchy Fallback for CAD Assembly
          setPartsList([
            { id: 'p1', name: 'Main Frame Assembly:1', type: 'Assembly', visible: true },
            { id: 'p2', name: 'Side C-Channel Frame:1', type: 'Part', visible: true },
            { id: 'p3', name: 'Side C-Channel Frame:2', type: 'Part', visible: true },
            { id: 'p4', name: 'Roller Assembly Group:1', type: 'Group', visible: true },
            { id: 'p5', name: 'Pipa Roller Tube:1..13', type: 'Part', visible: true },
            { id: 'p6', name: 'Shaft Shaft Bar:1..13', type: 'Part', visible: true },
            { id: 'p7', name: 'Bearing & End Cup:1..26', type: 'Part', visible: true },
            { id: 'p8', name: 'Support Legs & Foot Plate:1..4', type: 'Assembly', visible: true },
            { id: 'p9', name: 'Side Guide Rails & End Stop:1', type: 'Part', visible: true }
          ]);
        } else {
          setPartsList(extractedParts);
        }
      } catch (e) {
        console.log('Tree extraction note:', e);
      }
    };

    mv.addEventListener('load', handleLoad);
    return () => mv.removeEventListener('load', handleLoad);
  }, [modelUrl]);

  const togglePartVisibility = (partId) => {
    setHiddenParts(prev => ({
      ...prev,
      [partId]: !prev[partId]
    }));
  };

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

  const getContainerBg = () => {
    if (themeMode === 'workbench') return '#e2e8f0';
    if (themeMode === 'light') return '#ffffff';
    return '#0f172a';
  };

  return (
    <main className="viewer-container" style={{ background: getContainerBg() }}>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      {/* TOP HEADER NAVIGATION */}
      <header className="viewer-header">
        <div className="header-left">
          <h1 className="logo-text">CAD Viewer <span>Inspection & AR</span></h1>
        </div>

        <div className="header-actions">
          {!loading && !error && modelUrl && (
            <button
              onClick={togglePresentation}
              className={`present-btn ${isPresenting ? 'active' : ''}`}
            >
              {isPresenting ? '⏹ HENTIKAN PRESENTASI' : '▶ PRESENTASI SINEMATIK'}
            </button>
          )}
          {code && <span className="model-id">ID: {code.substring(0, 8)}</span>}
        </div>
      </header>

      {/* MAIN CONTENT WORKSPACE */}
      <section className="viewer-workspace">
        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <p className="loading-text">Memuat Model 3D & Assembly Tree...</p>
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
          <div className="canvas-and-sidebar">
            {/* 3D CANVAS VIEWPORT */}
            <div className="canvas-viewport">
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
                exposure={exposure}
                shadow-intensity={shadowIntensity}
                shadow-softness="0.8"
                auto-rotate={autoRotate || isPresenting}
                rotation-per-second="25deg"
                interpolation-decay="200"
                className="custom-3d-canvas"
              >
                <button slot="ar-button" id="ar-button">
                  📱 Lihat di Ruangan (AR)
                </button>

                <div id="ar-prompt">
                  <img src="https://modelviewer.dev/shared-assets/icons/hand.png" alt="AR prompt hand icon" />
                </div>
              </model-viewer>
            </div>

            {/* RIGHT SIDEBAR INSPECTION PANEL (Tree, Display, Appearance) */}
            <aside className="inspection-sidebar">
              {/* SIDEBAR TABS HEADER */}
              <div className="sidebar-tabs">
                <button
                  className={`tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tree')}
                >
                  🌳 Tree Parts
                </button>
                <button
                  className={`tab-btn ${activeTab === 'display' ? 'active' : ''}`}
                  onClick={() => setActiveTab('display')}
                >
                  🖥️ Display
                </button>
                <button
                  className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  🎨 Appearance
                </button>
              </div>

              {/* TAB 1: ASSEMBLY PARTS TREE */}
              {activeTab === 'tree' && (
                <div className="tab-content tree-tab">
                  <div className="section-title">
                    <span>Assembly Hierarchy Tree</span>
                    <span className="count-badge">{partsList.length} Items</span>
                  </div>
                  <div className="tree-list">
                    {partsList.map((part) => {
                      const isHidden = hiddenParts[part.id];
                      return (
                        <div
                          key={part.id}
                          className={`tree-item ${selectedPart === part.id ? 'selected' : ''}`}
                          onClick={() => setSelectedPart(part.id)}
                        >
                          <span
                            className="eye-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePartVisibility(part.id);
                            }}
                          >
                            {isHidden ? '🙈' : '👁️'}
                          </span>
                          <span className="item-icon">📦</span>
                          <span className={`item-name ${isHidden ? 'hidden-text' : ''}`}>
                            {part.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: DISPLAY CONTROLS */}
              {activeTab === 'display' && (
                <div className="tab-content display-tab">
                  <div className="control-group">
                    <label>Auto Rotation (360° Spin)</label>
                    <button
                      className={`toggle-btn ${autoRotate ? 'active' : ''}`}
                      onClick={() => setAutoRotate(!autoRotate)}
                    >
                      {autoRotate ? 'ON (Putar Otomatis)' : 'OFF (Statis)'}
                    </button>
                  </div>

                  <div className="control-group">
                    <label>Shadow Intensity ({shadowIntensity}x)</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={shadowIntensity}
                      onChange={(e) => setShadowIntensity(parseFloat(e.target.value))}
                      className="range-slider"
                    />
                  </div>

                  <div className="control-group">
                    <label>Exposure / Pencahayaan ({exposure}x)</label>
                    <input
                      type="range"
                      min="0.2"
                      max="2.5"
                      step="0.1"
                      value={exposure}
                      onChange={(e) => setExposure(parseFloat(e.target.value))}
                      className="range-slider"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: APPEARANCE & THEME */}
              {activeTab === 'appearance' && (
                <div className="tab-content appearance-tab">
                  <div className="control-group">
                    <label>Viewer Theme Preset</label>
                    <div className="theme-options">
                      <button
                        className={`theme-btn ${themeMode === 'dark' ? 'active' : ''}`}
                        onClick={() => setThemeMode('dark')}
                      >
                        🌙 Dark
                      </button>
                      <button
                        className={`theme-btn ${themeMode === 'workbench' ? 'active' : ''}`}
                        onClick={() => setThemeMode('workbench')}
                      >
                        ⚙️ Workbench
                      </button>
                      <button
                        className={`theme-btn ${themeMode === 'light' ? 'active' : ''}`}
                        onClick={() => setThemeMode('light')}
                      >
                        ☀️ Light
                      </button>
                    </div>
                  </div>

                  <div className="info-card">
                    <h4>ℹ️ Info CAD Assembly</h4>
                    <p>Format: GLB / CAD 3D Solid</p>
                    <p>Status: Ready for Inspection & AR Mode</p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>

      <style jsx>{`
        .viewer-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-jetbrains-mono), monospace;
          overflow: hidden;
          transition: background 0.3s ease;
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .model-id {
          font-size: 0.75rem;
          color: #94a3b8;
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

        .viewer-workspace {
          flex: 1;
          position: relative;
          width: 100%;
          height: calc(100vh - 55px);
        }

        .canvas-and-sidebar {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .canvas-viewport {
          flex: 1;
          height: 100%;
          position: relative;
        }

        .custom-3d-canvas {
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
          left: 24px;
          color: white;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
          cursor: pointer;
          z-index: 100;
        }

        /* SIDEBAR STYLING */
        .inspection-sidebar {
          width: 340px;
          background: #1e293b;
          border-left: 1px solid #334155;
          display: flex;
          flex-direction: column;
          z-index: 30;
          box-shadow: -4px 0 20px rgba(0,0,0,0.2);
        }

        .sidebar-tabs {
          display: flex;
          background: #0f172a;
          border-bottom: 1px solid #334155;
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 0.75rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }

        .tab-btn.active {
          color: #38bdf8;
          border-bottom-color: #38bdf8;
          background: #1e293b;
        }

        .tab-content {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: #cbd5e1;
          border-bottom: 1px solid #334155;
          padding-bottom: 0.5rem;
        }

        .count-badge {
          background: #0284c7;
          color: white;
          font-size: 0.65rem;
          padding: 0.15rem 0.4rem;
          border-radius: 10px;
        }

        .tree-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .tree-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.6rem;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tree-item:hover {
          border-color: #38bdf8;
          background: #1e293b;
        }

        .tree-item.selected {
          border-color: #38bdf8;
          background: #0284c7;
          color: white;
        }

        .eye-icon {
          font-size: 0.85rem;
          cursor: pointer;
        }

        .item-name.hidden-text {
          opacity: 0.4;
          text-decoration: line-through;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-size: 0.75rem;
          color: #cbd5e1;
          font-weight: 600;
        }

        .toggle-btn {
          background: #0f172a;
          border: 1px solid #334155;
          color: #e2e8f0;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .toggle-btn.active {
          background: #0284c7;
          border-color: #38bdf8;
          color: white;
        }

        .range-slider {
          width: 100%;
          accent-color: #38bdf8;
        }

        .theme-options {
          display: flex;
          gap: 0.4rem;
        }

        .theme-btn {
          flex: 1;
          background: #0f172a;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 0.4rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .theme-btn.active {
          background: #0284c7;
          color: white;
          border-color: #38bdf8;
        }

        .info-card {
          background: #0f172a;
          border: 1px solid #334155;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .info-card h4 {
          margin: 0 0 0.4rem 0;
          color: #38bdf8;
        }

        .loader-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1rem;
          color: #f8fafc;
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

        @media (max-width: 768px) {
          .inspection-sidebar {
            display: none;
          }
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
