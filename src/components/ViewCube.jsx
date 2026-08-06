'use client';

import { useEffect, useState } from 'react';
import {
  Home, ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';

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
    <div className="relative flex flex-col items-center gap-2 p-3 bg-white/95 rounded-2xl border border-slate-200/90 shadow-xl backdrop-blur-md select-none">
      {/* INVENTOR HOME BUTTON TOP-LEFT */}
      <button
        onClick={(e) => handleFaceClick('iso', e)}
        title="Inventor Home / Isometric View"
        className="absolute top-2.5 left-2.5 z-30 flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-300 transition-all shadow-2xs active:scale-95"
      >
        <Home className="h-3.5 w-3.5" />
      </button>

      {/* 3D VIEWCUBE WRAPPER WITH DIRECTIONAL ARROWS */}
      <div className="relative flex items-center justify-center p-4 mt-3">
        {/* UP ARROW (TOP) */}
        <button
          onClick={(e) => handleFaceClick('top', e)}
          title="Switch to TOP View"
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex h-5 w-6 items-center justify-center rounded bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-300 shadow-2xs transition-all active:scale-95"
        >
          <ChevronUp className="h-4 w-4" />
        </button>

        {/* DOWN ARROW (BOTTOM) */}
        <button
          onClick={(e) => handleFaceClick('bottom', e)}
          title="Switch to BOTTOM View"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 flex h-5 w-6 items-center justify-center rounded bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-300 shadow-2xs transition-all active:scale-95"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* LEFT ARROW (LEFT) */}
        <button
          onClick={(e) => handleFaceClick('left', e)}
          title="Switch to LEFT View"
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 flex h-6 w-5 items-center justify-center rounded bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-300 shadow-2xs transition-all active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* RIGHT ARROW (RIGHT) */}
        <button
          onClick={(e) => handleFaceClick('right', e)}
          title="Switch to RIGHT View"
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 flex h-6 w-5 items-center justify-center rounded bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-300 shadow-2xs transition-all active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* INVENTOR 3D VIEWCUBE CUBE */}
        <div className="w-16 h-16 relative perspective-400 my-1">
          <div
            className="w-full h-full relative transition-transform duration-75 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotation.rx}deg) rotateY(${rotation.ry}deg)`,
            }}
          >
            {/* FRONT */}
            <div
              onClick={(e) => handleFaceClick('front', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black text-slate-800 shadow-2xs hover:from-sky-400 hover:to-sky-600 hover:text-white hover:border-sky-600 transition-all cursor-pointer"
              style={faceStyle('translateZ(32px)')}
            >
              FRONT
            </div>

            {/* BACK */}
            <div
              onClick={(e) => handleFaceClick('back', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black text-slate-800 shadow-2xs hover:from-sky-400 hover:to-sky-600 hover:text-white hover:border-sky-600 transition-all cursor-pointer"
              style={faceStyle('rotateY(180deg) translateZ(32px)')}
            >
              BACK
            </div>

            {/* RIGHT */}
            <div
              onClick={(e) => handleFaceClick('right', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black text-slate-800 shadow-2xs hover:from-sky-400 hover:to-sky-600 hover:text-white hover:border-sky-600 transition-all cursor-pointer"
              style={faceStyle('rotateY(90deg) translateZ(32px)')}
            >
              RIGHT
            </div>

            {/* LEFT */}
            <div
              onClick={(e) => handleFaceClick('left', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black text-slate-800 shadow-2xs hover:from-sky-400 hover:to-sky-600 hover:text-white hover:border-sky-600 transition-all cursor-pointer"
              style={faceStyle('rotateY(-90deg) translateZ(32px)')}
            >
              LEFT
            </div>

            {/* TOP */}
            <div
              onClick={(e) => handleFaceClick('top', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black text-slate-800 shadow-2xs hover:from-sky-400 hover:to-sky-600 hover:text-white hover:border-sky-600 transition-all cursor-pointer"
              style={faceStyle('rotateX(90deg) translateZ(32px)')}
            >
              TOP
            </div>

            {/* BOTTOM */}
            <div
              onClick={(e) => handleFaceClick('bottom', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black text-slate-800 shadow-2xs hover:from-sky-400 hover:to-sky-600 hover:text-white hover:border-sky-600 transition-all cursor-pointer"
              style={faceStyle('rotateX(-90deg) translateZ(32px)')}
            >
              BOTTOM
            </div>
          </div>
        </div>
      </div>

      {/* QUICK FACE SHORTCUT BAR */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
        <button
          onClick={(e) => handleFaceClick('front', e)}
          className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-white hover:text-sky-600 rounded transition-colors"
        >
          Front
        </button>
        <button
          onClick={(e) => handleFaceClick('top', e)}
          className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-white hover:text-sky-600 rounded transition-colors"
        >
          Top
        </button>
        <button
          onClick={(e) => handleFaceClick('right', e)}
          className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-white hover:text-sky-600 rounded transition-colors"
        >
          Right
        </button>
        <button
          onClick={(e) => handleFaceClick('left', e)}
          className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-white hover:text-sky-600 rounded transition-colors"
        >
          Left
        </button>
      </div>
    </div>
  );
}
