'use client';

/* eslint-disable react-hooks/set-state-in-effect -- viewer contains legacy effect patterns */

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  Smartphone, RefreshCw, AlertTriangle,
  Maximize2, Minimize2, RotateCcw,
  CheckCircle2, HardDrive, Terminal, X,
  Eye, Compass, FileText, ChevronLeft,
} from 'lucide-react';
import ViewCube from '@/components/ViewCube';
import VintageLanding from '@/components/VintageLanding';

function ViewerContent() {
  const searchParams = useSearchParams();
  const rawCode = searchParams.get('code');
  const code = rawCode ? rawCode.trim() : null;
  const rawFile = searchParams.get('file');
  const file = rawFile ? rawFile.trim() : null;
  const direct = searchParams.get('direct') === 'true';

  const [activeCode, setActiveCode] = useState(code);
  const [enteredViewer, setEnteredViewer] = useState(direct);

  const [modelUrl, setModelUrl] = useState(file || null);
  const [modelKey, setModelKey] = useState(file || null);
  const [loading, setLoading] = useState(!file);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [activePreset, setActivePreset] = useState('iso');
  const [projectionMode, setProjectionMode] = useState('perspective');

  const modelViewerRef = useRef(null);
  const viewerContainerRef = useRef(null);
  const watchdogTimerRef = useRef(null);
  const logsEndRef = useRef(null);

  const addLog = (level, text) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-49), { timestamp, level, text }]);
  };

  useEffect(() => {
    setActiveCode(code || null);
    if (!file) {
      setModelUrl(null);
      setModelKey(null);
      setLoading(true);
    } else {
      setModelUrl(file);
      setModelKey(file);
      setLoading(false);
    }
    setError(null);
    setEnteredViewer(direct);
  }, [code, file, direct]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!enteredViewer) {
      return;
    }

    if (modelUrl) {
      return;
    }

    const currentCode = activeCode || code;
    addLog('info', 'Initializing Studio 3D & WebAR Viewer...');

    watchdogTimerRef.current = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          addLog('error', 'Timeout: loading exceeded 20 seconds.');
          setError('Model loading exceeded 20 seconds. Please check your internet connection or reload.');
          return false;
        }
        return false;
      });
    }, 20000);

    if (file && !activeCode) {
      addLog('info', `Using direct file reference: ${file}`);
      setModelKey(file);
      setModelUrl(file);
      setLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      return;
    }

    if (!currentCode) {
      addLog('error', 'Model code missing in URL.');
      setError('Model code not found in URL. Ensure the link has ?code=... or ?file=...');
      setLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      return;
    }

    addLog('info', `Fetching model from Cloudflare R2 for code: ${currentCode}`);
    fetch(`/api/model?code=${encodeURIComponent(currentCode)}`)
      .then((res) => {
        addLog('info', `API /api/model status: ${res.status} ${res.statusText}`);
        if (!res.ok) {
          throw new Error('Model not found in Cloudflare R2 storage.');
        }
        return res.json();
      })
      .then((data) => {
        addLog('info', `Model received from Cloudflare R2: ${data.key || currentCode}`);
        setModelUrl(data.url);
        setModelKey(data.key || `models/${currentCode}.glb`);
        setLoading(false);
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);

        fetch('/api/admin/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: currentCode }),
        }).catch(() => {});
      })
      .catch((err) => {
        addLog('error', `Error fetching model: ${err.message}`);
        setError(err.message);
        setLoading(false);
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      });

    return () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    };
  }, [enteredViewer, activeCode, code, file, modelUrl]);

  const handleEnterViewer = (overrideCode) => {
    const trimmed = overrideCode?.trim();
    if (trimmed && trimmed !== activeCode) {
      setActiveCode(trimmed);
      setModelUrl(null);
      setModelKey(null);
      setError(null);
      setLoading(true);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('code', trimmed);
        url.searchParams.delete('file');
        window.history.replaceState(null, '', url.toString());
      }
    } else if (error) {
      setError(null);
      setLoading(true);
    }
    setEnteredViewer(true);
  };

  const handleReload = () => {
    setError(null);
    setLoading(true);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const toggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const setCameraAngle = (preset) => {
    setActivePreset(preset);
    if (!modelViewerRef.current) return;
    switch (preset) {
      case 'iso':
        modelViewerRef.current.cameraOrbit = '45deg 70deg 105%';
        break;
      case 'top':
        modelViewerRef.current.cameraOrbit = '0deg 0deg 105%';
        break;
      case 'bottom':
        modelViewerRef.current.cameraOrbit = '0deg 180deg 105%';
        break;
      case 'front':
        modelViewerRef.current.cameraOrbit = '0deg 90deg 105%';
        break;
      case 'back':
        modelViewerRef.current.cameraOrbit = '180deg 90deg 105%';
        break;
      case 'right':
        modelViewerRef.current.cameraOrbit = '90deg 90deg 105%';
        break;
      case 'left':
        modelViewerRef.current.cameraOrbit = '-90deg 90deg 105%';
        break;
      default:
        modelViewerRef.current.cameraOrbit = '45deg 70deg 105%';
        break;
    }
  };

  const handleProjectionChange = (mode) => {
    setProjectionMode(mode);
    if (modelViewerRef.current) {
      modelViewerRef.current.fieldOfView = mode === 'orthographic' ? '12deg' : 'auto';
    }
  };

  const resetCamera = () => {
    setActivePreset('iso');
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = '45deg 70deg 105%';
      modelViewerRef.current.fieldOfView = projectionMode === 'orthographic' ? '12deg' : 'auto';
    }
  };

  const isDebug = searchParams.get('debug') === 'true' || searchParams.get('admin') === 'true';
  const displayDocumentCode = activeCode || code || (file ? file.split('/').pop() : '');

  return (
    <>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      {!enteredViewer ? (
        <VintageLanding
          code={activeCode || code}
          file={file}
          errorMessage={error}
          onEnterViewer={handleEnterViewer}
        />
      ) : (
        <main
          ref={viewerContainerRef}
          className="relative flex h-screen w-full max-w-full flex-col overflow-hidden bg-[#FAF6EE] text-[#16335C] font-mono select-none"
        >
          {/* VINTAGE EDITORIAL HEADER */}
          <header className="z-20 flex h-14 w-full items-center justify-between border-b border-[#16335C]/20 bg-[#FAF6EE]/95 px-4 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {/* BRAND / RETURN BUTTON */}
              <button
                type="button"
                onClick={() => setEnteredViewer(false)}
                title="Return to Specification Sheet"
                className="group flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#16335C] text-[#FAF6EE] transition-transform group-hover:scale-95">
                  <ChevronLeft className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wider uppercase text-[#16335C]">
                    CADIMAGO
                  </span>
                  <span className="hidden sm:inline-block rounded-xs border border-[#16335C]/30 px-1.5 py-0.5 text-[10px] font-semibold text-[#16335C]/70 uppercase tracking-widest">
                    3D VIEWER
                  </span>
                </div>
              </button>

              {/* SPECIFICATION SHEET BADGE */}
              {displayDocumentCode && (
                <button
                  type="button"
                  onClick={() => setEnteredViewer(false)}
                  title="View Drawing Specification Sheet"
                  className="flex items-center gap-1.5 rounded-xs bg-white/50 hover:bg-[#16335C] text-[#16335C] hover:text-[#FAF6EE] px-2.5 py-1 text-xs font-bold border border-[#16335C]/30 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>DOC: {displayDocumentCode}</span>
                </button>
              )}
            </div>

            {/* HEADER ACTIONS / DEBUG */}
            <div className="flex items-center gap-2">
              {isDebug && (
                <>
                  {displayDocumentCode && (
                    <span className="hidden sm:flex items-center gap-1.5 rounded-xs bg-white/40 px-2 py-0.5 text-[11px] font-mono text-[#16335C]/80 border border-[#16335C]/20 uppercase">
                      <HardDrive className="h-3.5 w-3.5 text-[#16335C]" />
                      R2: {displayDocumentCode.substring(0, 8)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConsole(!showConsole)}
                    className="flex items-center gap-1.5 rounded-xs bg-white/50 hover:bg-[#16335C]/10 px-2.5 py-1 text-xs font-semibold text-[#16335C] border border-[#16335C]/30 transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    <Terminal className="h-3.5 w-3.5 text-[#16335C]" />
                    <span>LOGS ({logs.length})</span>
                  </button>
                </>
              )}

              {/* RETURN BUTTON */}
              <button
                type="button"
                onClick={() => setEnteredViewer(false)}
                title="Return to Specification Sheet"
                className="hidden md:inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#16335C]/80 hover:text-[#16335C] border border-[#16335C]/20 hover:border-[#16335C]/50 rounded-xs transition-colors cursor-pointer"
              >
                SPEC SHEET
              </button>
            </div>
          </header>

          {/* STUDIO 3D CANVAS */}
          <section className="relative flex-1 min-w-0 w-full h-full bg-[#FAF6EE] overflow-hidden">
            {/* LOADING STATE */}
            {loading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#FAF6EE]/95 backdrop-blur-sm p-4 text-center select-none font-mono">
                {/* DRAFTING COMPASS ROTATING SPINNER */}
                <div className="relative mb-4 flex items-center justify-center h-12 w-12">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#16335C]/40 animate-spin" style={{ animationDuration: '6s' }} />
                  <div className="h-6 w-6 rounded-full border-2 border-[#16335C] border-t-transparent animate-spin" style={{ animationDuration: '1.2s' }} />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#16335C] uppercase tracking-widest">
                  LOADING 3D MODEL...
                </h2>
                <p className="text-[10px] sm:text-xs text-[#16335C]/70 uppercase tracking-normal mt-1 max-w-[280px] sm:max-w-sm px-4">
                  INITIALIZING INTERACTIVE CAD GEOMETRY & SHADOWS
                </p>
              </div>
            )}

            {/* ERROR STATE */}
            {error && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#FAF6EE]/95 p-6 text-center select-none font-mono">
                <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-rose-50 border border-rose-300 text-rose-800 mb-4">
                  <AlertTriangle className="h-6 w-6 text-rose-700" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#16335C] uppercase tracking-wider mb-2">
                  MODEL LOAD FAILURE
                </h2>
                <p className="text-xs text-[#16335C]/80 max-w-md uppercase mb-6 leading-relaxed">
                  {error}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEnteredViewer(false)}
                    className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-[#16335C]/40 text-[#16335C] hover:bg-[#16335C]/10 transition-colors cursor-pointer rounded-xs"
                  >
                    RETURN TO SPEC SHEET
                  </button>
                  <button
                    type="button"
                    onClick={handleReload}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest bg-[#16335C] hover:bg-[#0D1F38] text-[#FAF6EE] transition-colors cursor-pointer shadow-sm rounded-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    RELOAD MODEL
                  </button>
                </div>
              </div>
            )}

            {/* MODEL VIEWER CONTAINER */}
            {!loading && !error && modelUrl && (
              <div className="relative w-full h-full min-w-0">
                <model-viewer
                  ref={modelViewerRef}
                  src={modelUrl}
                  ar
                  ar-scale="fixed"
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls
                  touch-action="pan-y"
                  shadow-intensity="1.2"
                  shadow-softness="0.5"
                  exposure="1.05"
                  tone-mapping="commerce"
                  environment-image="neutral"
                  min-camera-orbit="auto 0deg 5%"
                  max-camera-orbit="auto 180deg 600%"
                  min-field-of-view="1deg"
                  max-field-of-view="140deg"
                  field-of-view={projectionMode === 'orthographic' ? '12deg' : 'auto'}
                  auto-rotate={autoRotate ? 'auto-rotate' : undefined}
                  rotation-per-second="18deg"
                  interpolation-decay="200"
                  camera-orbit="45deg 70deg 105%"
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%', backgroundColor: '#FAF6EE' }}
                >
                  {/* AR BUTTON SLOT */}
                  <button
                    slot="ar-button"
                    id="ar-button"
                    className="hidden"
                  />
                </model-viewer>

                {/* DEBUG BADGE */}
                {isDebug && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xs bg-[#FAF6EE]/90 px-3 py-1.5 text-[11px] font-semibold text-[#16335C] border border-[#16335C]/30 shadow-xs backdrop-blur-md uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>UNCOMPRESSED GLB (CLOUDFLARE R2)</span>
                  </div>
                )}

                {/* 3D VIEWCUBE & FULLSCREEN CONTROLS - TOP RIGHT */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 flex flex-col items-end gap-1.5 md:gap-2">
                  <ViewCube modelViewerRef={modelViewerRef} onSelectAngle={setCameraAngle} />
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen"
                    className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-sm bg-[#FAF6EE]/95 text-[#16335C] border border-[#16335C]/30 shadow-xs hover:bg-[#16335C] hover:text-[#FAF6EE] transition-colors active:scale-95 cursor-pointer backdrop-blur-md"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-3.5 w-3.5" />
                    ) : (
                      <Maximize2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* BOTTOM FLOATING DOCK (CENTERED, TECHNICAL VINTAGE STYLE) */}
                <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 md:gap-2 rounded-full sm:rounded-md bg-[#FAF6EE]/95 p-1.5 md:p-2 shadow-lg border border-[#16335C]/30 backdrop-blur-md max-w-[calc(100vw-24px)] font-mono">
                  {/* PRIMARY AR BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof modelViewerRef.current?.activateAR === 'function') {
                        modelViewerRef.current.activateAR();
                      } else {
                        const arBtn = document.getElementById('ar-button');
                        if (arBtn) arBtn.click();
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-full sm:rounded-xs bg-[#16335C] hover:bg-[#0D1F38] px-3.5 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold text-[#FAF6EE] shadow-sm transition-all active:scale-95 cursor-pointer uppercase tracking-wider whitespace-nowrap"
                  >
                    <Smartphone className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                    <span className="hidden sm:inline">VIEW IN AR</span>
                    <span className="sm:hidden">AR</span>
                  </button>

                  <div className="h-5 md:h-6 w-px bg-[#16335C]/20 shrink-0" />

                  {/* PROJECTION MODE TOGGLE */}
                  <div className="flex items-center gap-0.5 md:gap-1 bg-[#16335C]/5 p-0.5 md:p-1 rounded-full sm:rounded-xs border border-[#16335C]/20">
                    <button
                      type="button"
                      onClick={() => handleProjectionChange('perspective')}
                      title="Perspective Projection"
                      className={`flex items-center gap-1 px-2 md:px-2.5 py-1 text-[10px] md:text-xs font-bold rounded-full sm:rounded-xs transition-colors whitespace-nowrap cursor-pointer uppercase tracking-wider ${
                        projectionMode === 'perspective'
                          ? 'bg-[#16335C] text-[#FAF6EE] shadow-xs'
                          : 'text-[#16335C]/70 hover:text-[#16335C]'
                      }`}
                    >
                      <Eye className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                      <span className="hidden md:inline">PERSPECTIVE</span>
                      <span className="md:hidden">3D</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProjectionChange('orthographic')}
                      title="Orthographic Projection"
                      className={`flex items-center gap-1 px-2 md:px-2.5 py-1 text-[10px] md:text-xs font-bold rounded-full sm:rounded-xs transition-colors whitespace-nowrap cursor-pointer uppercase tracking-wider ${
                        projectionMode === 'orthographic'
                          ? 'bg-[#16335C] text-[#FAF6EE] shadow-xs'
                          : 'text-[#16335C]/70 hover:text-[#16335C]'
                      }`}
                    >
                      <Compass className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                      <span className="hidden md:inline">ORTHO</span>
                      <span className="md:hidden">2D</span>
                    </button>
                  </div>

                  <div className="h-5 md:h-6 w-px bg-[#16335C]/20 shrink-0" />

                  {/* ROTATE & RESET BUTTONS */}
                  <button
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    title="Toggle Auto Rotation"
                    className={`flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full sm:rounded-xs border transition-colors shrink-0 cursor-pointer ${
                      autoRotate
                        ? 'bg-[#16335C] text-[#FAF6EE] border-[#16335C]'
                        : 'border-[#16335C]/25 text-[#16335C]/70 hover:bg-[#16335C]/10 hover:text-[#16335C]'
                    }`}
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 md:h-4 md:w-4 ${autoRotate ? 'animate-spin' : ''}`}
                      style={{ animationDuration: '8s' }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={resetCamera}
                    title="Reset View Position"
                    className="flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full sm:rounded-xs border border-[#16335C]/25 text-[#16335C]/70 hover:bg-[#16335C]/10 hover:text-[#16335C] transition-colors shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* DIAGNOSTIC LOG CONSOLE */}
          {showConsole && (
            <div className="absolute bottom-0 left-0 right-0 z-40 max-h-64 border-t border-[#16335C]/20 bg-[#FAF6EE]/98 backdrop-blur-md p-4 text-xs font-mono text-[#16335C] shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#16335C]/20 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-[#16335C] uppercase tracking-wider">
                  <Terminal className="h-3.5 w-3.5" /> DIAGNOSTIC CONSOLE ({logs.length} ENTRIES)
                </span>
                <button
                  type="button"
                  onClick={() => setShowConsole(false)}
                  className="text-[#16335C]/50 hover:text-[#16335C] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {logs.length === 0 ? (
                  <p className="text-[#16335C]/50 italic">NO LOGS RECORDED YET...</p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 ${
                        log.level === 'error'
                          ? 'text-rose-700'
                          : log.level === 'warn'
                          ? 'text-amber-800'
                          : 'text-[#16335C]'
                      }`}
                    >
                      <span className="text-[#16335C]/50 font-mono">[{log.timestamp}]</span>
                      <span className="font-bold text-[10px] uppercase px-1 rounded-xs bg-[#16335C]/10 border border-[#16335C]/20">
                        [{log.level}]
                      </span>
                      <span className="break-all">{log.text}</span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </main>
      )}
    </>
  );
}

export default function ViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#FAF6EE] text-[#16335C] font-mono select-none">
          <div className="relative mb-3 flex items-center justify-center h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#16335C]/40 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="h-5 w-5 rounded-full border-2 border-[#16335C] border-t-transparent animate-spin" style={{ animationDuration: '1.2s' }} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#16335C]/80">
            LOADING 3D VIEWER...
          </p>
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}
