'use client';

/* eslint-disable react-hooks/set-state-in-effect -- viewer contains legacy effect patterns */

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  Box, Smartphone, RefreshCw, AlertTriangle,
  Loader2, Maximize2, Minimize2, RotateCcw,
  CheckCircle2, HardDrive, Info, Terminal, X,
} from 'lucide-react';
import { Button, Spinner } from '@/components/ui';

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
    addLog('info', 'Initializing 3D & WebAR Viewer...');

    watchdogTimerRef.current = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          addLog('error', 'Timeout: loading exceeded 20 seconds.');
          setError('Model loading exceeded 20 seconds. Check your internet connection or reload.');
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

  const resetCamera = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = '0deg 75deg 105%';
      modelViewerRef.current.fieldOfView = 'auto';
    }
  };

  return (
    <main ref={viewerContainerRef} className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="afterInteractive"
      />

      {/* TOP HEADER */}
      <header className="z-20 flex h-14 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
            <Box className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
              AR Model <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/30">Lite</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {code && (
            <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-800/90 px-3 py-1 text-xs font-mono text-slate-300 border border-slate-700/60">
              <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
              R2: {code.substring(0, 8)}...
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConsole(!showConsole)}
            className="text-xs bg-slate-800/60 border-slate-700 hover:bg-slate-700 text-slate-300"
          >
            <Terminal className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
            Logs ({logs.length})
          </Button>
        </div>
      </header>

      {/* MAIN VIEWPORT AREA */}
      <section className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 text-center">
            <Spinner size="lg" className="text-cyan-400 mb-4" />
            <h2 className="text-lg font-semibold text-slate-100">Loading Uncompressed 3D GLB...</h2>
            <p className="text-sm text-slate-400 max-w-sm mt-1">Streaming high-quality 3D model directly from Cloudflare R2 CDN...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 border border-rose-500/30 mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Model Load Failure</h2>
            <p className="text-sm text-slate-400 max-w-md mb-6">{error}</p>
            <Button onClick={handleReload} className="bg-cyan-600 hover:bg-cyan-500 text-white">
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
              shadow-softness="0.6"
              exposure="1.0"
              auto-rotate={autoRotate ? 'auto-rotate' : undefined}
              rotation-per-second="20deg"
              interpolation-decay="200"
              className="w-full h-full"
              style={{ width: '100%', height: '100%', backgroundColor: '#020617' }}
            >
              {/* AR FLOATING BUTTON */}
              <button
                slot="ar-button"
                id="ar-button"
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 border border-cyan-400/40"
              >
                <Smartphone className="h-5 w-5" />
                <span>📱 Lihat di Ruangan (AR)</span>
              </button>
            </model-viewer>

            {/* QUICK CONTROLS OVERLAY */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800/80 backdrop-blur-md shadow-lg">
              <button
                onClick={resetCamera}
                title="Reset View Position"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                title="Toggle Auto Rotation"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${autoRotate ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <RefreshCw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              </button>
              <button
                onClick={toggleFullscreen}
                title="Toggle Fullscreen"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>

            {/* UNCOMPRESSED GLB STATUS BADGE */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 border border-slate-800/80 backdrop-blur-md shadow-md">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Uncompressed GLB (Cloudflare R2 Direct)</span>
            </div>
          </div>
        )}
      </section>

      {/* DIAGNOSTIC CONSOLE OVERLAY */}
      {showConsole && (
        <div className="absolute bottom-0 left-0 right-0 z-40 max-h-64 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md p-3 text-xs font-mono text-slate-300 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" /> Diagnostic Console ({logs.length} entries)
            </span>
            <button onClick={() => setShowConsole(false)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">No logs recorded yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`flex items-start gap-2 ${log.level === 'error' ? 'text-rose-400' : log.level === 'warn' ? 'text-amber-300' : 'text-slate-300'}`}>
                  <span className="text-slate-500 font-mono">[{log.timestamp}]</span>
                  <span className="font-bold text-[10px] uppercase px-1 rounded bg-slate-800">[{log.level}]</span>
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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
        <Spinner size="lg" className="text-cyan-400 mb-3" />
        <p className="text-sm text-slate-400">Loading 3D & WebAR Viewer...</p>
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
