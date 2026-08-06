'use client';

import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';

export default function ViewCube({ modelViewerRef, onSelectAngle }) {
  const [rotation, setRotation] = useState({ rx: -20, ry: 45 });

  useEffect(() => {
    const viewer = modelViewerRef?.current;
    if (!viewer) return;

    const handleCameraChange = () => {
      try {
        const orbit = viewer.getCameraOrbit();
        if (!orbit) return;
        const thetaDeg = (orbit.theta * 180) / Math.PI;
        const phiDeg = (orbit.phi * 180) / Math.PI;

        const ry = -thetaDeg;
        const rx = phiDeg - 90;

        setRotation({ rx, ry });
      } catch {
        // Fallback
      }
    };

    viewer.addEventListener('camera-change', handleCameraChange);
    return () => {
      viewer.removeEventListener('camera-change', handleCameraChange);
    };
  }, [modelViewerRef]);

  const handleFaceClick = (preset, e) => {
    if (e) e.stopPropagation();
    if (onSelectAngle) {
      onSelectAngle(preset);
    }
  };

  const faceStyle = (transformStr) => ({
    transform: transformStr,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  });

  return (
    <div className="relative flex flex-col items-center justify-center p-2.5 bg-white/95 rounded-2xl border border-slate-200/90 shadow-xl backdrop-blur-md select-none">
      {/* INVENTOR HOME BUTTON TOP-LEFT */}
      <div className="w-full flex items-center justify-start mb-1">
        <button
          onClick={(e) => handleFaceClick('iso', e)}
          title="Inventor Home / Isometric View"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-300 transition-all shadow-2xs active:scale-95 z-20"
        >
          <Home className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* PURE 3D VIEWCUBE CONTAINER (NO RING) */}
      <div className="w-24 h-24 relative flex items-center justify-center perspective-400 p-2">
        <div
          className="w-16 h-16 relative transition-transform duration-75 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.rx}deg) rotateY(${rotation.ry}deg)`,
          }}
        >
          {/* FRONT */}
          <div
            onClick={(e) => handleFaceClick('front', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-150 to-slate-300 border border-slate-400/90 rounded-xs text-[11px] font-black tracking-wider text-slate-800 shadow-xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
            style={faceStyle('translateZ(32px)')}
          >
            FRONT
          </div>

          {/* BACK */}
          <div
            onClick={(e) => handleFaceClick('back', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-150 to-slate-300 border border-slate-400/90 rounded-xs text-[11px] font-black tracking-wider text-slate-800 shadow-xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
            style={faceStyle('rotateY(180deg) translateZ(32px)')}
          >
            BACK
          </div>

          {/* RIGHT */}
          <div
            onClick={(e) => handleFaceClick('right', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-150 to-slate-300 border border-slate-400/90 rounded-xs text-[11px] font-black tracking-wider text-slate-800 shadow-xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
            style={faceStyle('rotateY(90deg) translateZ(32px)')}
          >
            RIGHT
          </div>

          {/* LEFT */}
          <div
            onClick={(e) => handleFaceClick('left', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-150 to-slate-300 border border-slate-400/90 rounded-xs text-[11px] font-black tracking-wider text-slate-800 shadow-xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
            style={faceStyle('rotateY(-90deg) translateZ(32px)')}
          >
            LEFT
          </div>

          {/* TOP */}
          <div
            onClick={(e) => handleFaceClick('top', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-150 to-slate-300 border border-slate-400/90 rounded-xs text-[11px] font-black tracking-wider text-slate-800 shadow-xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
            style={faceStyle('rotateX(90deg) translateZ(32px)')}
          >
            TOP
          </div>

          {/* BOTTOM */}
          <div
            onClick={(e) => handleFaceClick('bottom', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-150 to-slate-300 border border-slate-400/90 rounded-xs text-[11px] font-black tracking-wider text-slate-800 shadow-xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
            style={faceStyle('rotateX(-90deg) translateZ(32px)')}
          >
            BOTTOM
          </div>
        </div>
      </div>
    </div>
  );
}
