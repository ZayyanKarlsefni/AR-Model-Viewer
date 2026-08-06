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
    <div className="relative flex flex-col items-center justify-center p-3 bg-white/90 rounded-2xl border border-slate-200/90 shadow-lg backdrop-blur-md select-none">
      {/* HOME BUTTON TOP-LEFT */}
      <div className="w-full flex items-center justify-start mb-1">
        <button
          onClick={(e) => handleFaceClick('iso', e)}
          title="Inventor Home / Isometric View"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-200 transition-all shadow-2xs active:scale-95"
        >
          <Home className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* VIEWCUBE & COMPASS WRAPPER */}
      <div className="w-28 h-28 relative flex items-center justify-center">
        {/* COMPASS DIRECTION RING (OUTSIDE CUBE) */}
        <div
          className="absolute inset-1 rounded-full border border-slate-200/80 bg-slate-50/50 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `rotate(${rotation.ry}deg)`,
          }}
        >
          <span className="absolute top-1 text-[10px] font-black text-slate-600">N</span>
          <span className="absolute right-2 text-[10px] font-black text-slate-600">E</span>
          <span className="absolute bottom-1 text-[10px] font-black text-slate-600">S</span>
          <span className="absolute left-2 text-[10px] font-black text-slate-600">W</span>
        </div>

        {/* 3D CUBE */}
        <div className="w-16 h-16 relative perspective-400 z-10">
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
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[10px] font-black tracking-wider text-slate-800 shadow-2xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('translateZ(32px)')}
            >
              FRONT
            </div>

            {/* BACK */}
            <div
              onClick={(e) => handleFaceClick('back', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[10px] font-black tracking-wider text-slate-800 shadow-2xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateY(180deg) translateZ(32px)')}
            >
              BACK
            </div>

            {/* RIGHT */}
            <div
              onClick={(e) => handleFaceClick('right', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[10px] font-black tracking-wider text-slate-800 shadow-2xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateY(90deg) translateZ(32px)')}
            >
              RIGHT
            </div>

            {/* LEFT */}
            <div
              onClick={(e) => handleFaceClick('left', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[10px] font-black tracking-wider text-slate-800 shadow-2xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateY(-90deg) translateZ(32px)')}
            >
              LEFT
            </div>

            {/* TOP */}
            <div
              onClick={(e) => handleFaceClick('top', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[10px] font-black tracking-wider text-slate-800 shadow-2xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateX(90deg) translateZ(32px)')}
            >
              TOP
            </div>

            {/* BOTTOM */}
            <div
              onClick={(e) => handleFaceClick('bottom', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[10px] font-black tracking-wider text-slate-800 shadow-2xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateX(-90deg) translateZ(32px)')}
            >
              BOTTOM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
