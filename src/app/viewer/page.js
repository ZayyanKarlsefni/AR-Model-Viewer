'use client';

/* eslint-disable react-hooks/set-state-in-effect -- viewer contains legacy effect patterns */

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  Box, Smartphone, RefreshCw, AlertTriangle,
  Maximize2, Minimize2, RotateCcw,
  CheckCircle2, HardDrive, Terminal, X,
  Eye, Compass, Layers, Sun,
} from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import ViewCube from '@/components/ViewCube';

function ViewerContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const file = searchParams.get('file');

  const [modelUrl, setModelUrl] = useState(null);
  const [modelKey, setModelKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
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
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
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

    if (file) {
      addLog('info', `Using direct file reference: ${file}`);
      setModelKey(file);
      setModelUrl(file);
      setLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      return;
    }

    if (!code) {
      addLog('error', 'Model code missing in URL.');
      setError('Model code not found in URL. Ensure the link has ?code=... or ?file=...');
      setLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      return;
    }

    addLog('info', `Fetching model from Cloudflare R2 for code: ${code}`);
    fetch(`/api/model?code=${code}`)
      .then((res) => {
        addLog('info', `API /api/model status: ${res.status} ${res.statusText}`);
        if (!res.ok) {
          throw new Error('Model not found in Cloudflare R2 storage.');
        }
        return res.json();
      })
      .then((data) => {
        addLog('info', `Model received from Cloudflare R2: ${data.key || code}`);
        setModelUrl(data.url);
        setModelKey(data.key || `models/${code}.glb`);
        setLoading(false);
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);

        fetch('/api/admin/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
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
  }, [code, file]);

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

  const resetCamera = () => {
    setActivePreset('iso');
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = '45deg 70deg 105%';
      modelViewerRef.current.fieldOfView = 'auto';
    }
  };

  const isDebug = searchParams.get('debug') === 'true' || searchParams.get('admin') === 'true';

  return (
    <main ref={viewerContainerRef} className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      {/* ELEGANT TOP HEADER */}
      <header className="z-20 flex h-13 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-2xs">
            <Box className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-slate-900">
              AR Model
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/80">
              Lite
            </span>
          </div>
        </div>

        {isDebug && (
          <div className="flex items-center gap-2">
            {code && (
              <span className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-mono text-slate-600 border border-slate-200/80">
                <HardDrive className="h-3.5 w-3.5 text-indigo-500" />
                R2: {code.substring(0, 8)}
              </span>
            )}
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/80 transition-colors shadow-2xs"
            >
              <Terminal className="h-3.5 w-3.5 text-indigo-600" />
              <span>Logs ({logs.length})</span>
            </button>
          </div>
        )}
      </header>

      {/* STUDIO 3D CANVAS */}
      <section className="relative flex-1 w-full h-full bg-[#f8fafc] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md p-4 text-center">
            <Spinner size="lg" className="text-indigo-600 mb-4" />
            <h2 className="text-lg font-bold text-slate-900">Loading 3D Model...</h2>
            <p className="text-sm text-slate-500 max-w-sm mt-1">Preparing high quality interactive 3D model...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-200 mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Model Load Failure</h2>
            <p className="text-sm text-slate-600 max-w-md mb-6">{error}</p>
            <Button onClick={handleReload} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              <RefreshCw className="mr-2 h-4 w-4" /> Reload Model
            </Button>
          </div>
        )}

        {!loading && !error && modelUrl && (
          <div className="relative w-full h-full">
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
              field-of-view={projectionMode === 'orthographic' ? '0deg' : 'auto'}
              auto-rotate={autoRotate ? 'auto-rotate' : undefined}
              rotation-per-second="18deg"
              interpolation-decay="200"
              camera-orbit="45deg 70deg 105%"
              className="w-full h-full"
              style={{ width: '100%', height: '100%', backgroundColor: '#f8fafc' }}
            >
              {/* AR BUTTON SLOT */}
              <button
                slot="ar-button"
                id="ar-button"
                className="hidden"
              />
            </model-viewer>

            {/* UNCOMPRESSED GLB BADGE - ONLY IN DEBUG MODE */}
            {isDebug && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200/90 shadow-sm backdrop-blur-md">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Uncompressed GLB (Cloudflare R2 Direct)</span>
              </div>
            )}

            {/* 3D VIEWCUBE & FULLSCREEN CONTROLS - TOP RIGHT */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
              <ViewCube modelViewerRef={modelViewerRef} onSelectAngle={setCameraAngle} />
              <button
                onClick={toggleFullscreen}
                title="Toggle Fullscreen"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-700 border border-slate-200/90 shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 backdrop-blur-md"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>

            {/* BOTTOM FLOATING DOCK (CENTERED) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-white/95 p-2 shadow-xl border border-slate-200/90 backdrop-blur-md">
              {/* PRIMARY AR BUTTON */}
              <button
                onClick={() => {
                  const arBtn = document.getElementById('ar-button');
                  if (arBtn) arBtn.click();
                }}
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-95 border border-indigo-500"
              >
                <Smartphone className="h-4 w-4" />
                <span>Lihat di Ruangan (AR)</span>
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1" />

              {/* PROJECTION MODE TOGGLE (PERSPECTIVE VS ORTHOGRAPHIC) */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
                <button
                  onClick={() => setProjectionMode('perspective')}
                  title="Perspective Projection (Natural Eye View)"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${projectionMode === 'perspective' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Perspective</span>
                </button>
                <button
                  onClick={() => setProjectionMode('orthographic')}
                  title="Orthographic Projection (True Parallel CAD Inspection)"
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${projectionMode === 'orthographic' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Orthographic</span>
                </button>
              </div>

              <div className="h-6 w-px bg-slate-200 mx-1" />

              {/* ROTATE & RESET BUTTONS */}
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                title="Toggle Auto Rotation"
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${autoRotate ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <RefreshCw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
              </button>
              <button
                onClick={resetCamera}
                title="Reset View Position"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DIAGNOSTIC LOG CONSOLE */}
      {showConsole && (
        <div className="absolute bottom-0 left-0 right-0 z-40 max-h-64 border-t border-slate-200 bg-white/95 backdrop-blur-md p-4 text-xs font-mono text-slate-800 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
            <span className="font-bold text-indigo-700 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-indigo-600" /> Diagnostic Console ({logs.length} entries)
            </span>
            <button onClick={() => setShowConsole(false)} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <p className="text-slate-400 italic">No logs recorded yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`flex items-start gap-2 ${log.level === 'error' ? 'text-rose-600' : log.level === 'warn' ? 'text-amber-700' : 'text-slate-700'}`}>
                  <span className="text-slate-400 font-mono">[{log.timestamp}]</span>
                  <span className="font-bold text-[10px] uppercase px-1 rounded bg-slate-100 border border-slate-200">[{log.level}]</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </main>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 text-slate-900">
        <Spinner size="lg" className="text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading Studio 3D & WebAR Viewer...</p>
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
