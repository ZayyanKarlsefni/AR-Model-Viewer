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
    <div className="relative flex flex-col items-center justify-center p-3 bg-white/40 rounded-2xl backdrop-blur-xs select-none">
      {/* INVENTOR HOME BUTTON TOP-LEFT */}
      <button
        onClick={(e) => handleFaceClick('iso', e)}
        title="Inventor Home / Isometric View"
        className="absolute top-1 left-1 z-30 flex h-6 w-6 items-center justify-center rounded-md bg-white/80 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-300 transition-all shadow-2xs active:scale-95"
      >
        <Home className="h-3.5 w-3.5" />
      </button>

      {/* INVENTOR 3D VIEWCUBE CONTAINER */}
      <div className="w-24 h-24 relative flex items-center justify-center">
        {/* 3D COMPASS BASE RING */}
        <div
          className="absolute inset-0 rounded-full border-2 border-slate-300/80 bg-slate-200/30 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `rotate(${rotation.ry}deg)`,
          }}
        >
          <span className="absolute top-0.5 text-[9px] font-black text-slate-500">N</span>
          <span className="absolute right-1 text-[9px] font-black text-slate-500">E</span>
          <span className="absolute bottom-0.5 text-[9px] font-black text-slate-500">S</span>
          <span className="absolute left-1 text-[9px] font-black text-slate-500">W</span>
        </div>

        {/* 3D CUBE GEOMETRY */}
        <div className="w-14 h-14 relative perspective-400">
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
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black tracking-wider text-slate-700 shadow-xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('translateZ(28px)')}
            >
              FRONT
            </div>

            {/* BACK */}
            <div
              onClick={(e) => handleFaceClick('back', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black tracking-wider text-slate-700 shadow-xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateY(180deg) translateZ(28px)')}
            >
              BACK
            </div>

            {/* RIGHT */}
            <div
              onClick={(e) => handleFaceClick('right', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black tracking-wider text-slate-700 shadow-xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateY(90deg) translateZ(28px)')}
            >
              RIGHT
            </div>

            {/* LEFT */}
            <div
              onClick={(e) => handleFaceClick('left', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black tracking-wider text-slate-700 shadow-xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateY(-90deg) translateZ(28px)')}
            >
              LEFT
            </div>

            {/* TOP */}
            <div
              onClick={(e) => handleFaceClick('top', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black tracking-wider text-slate-700 shadow-xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateX(90deg) translateZ(28px)')}
            >
              TOP
            </div>

            {/* BOTTOM */}
            <div
              onClick={(e) => handleFaceClick('bottom', e)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400 rounded-xs text-[10px] font-black tracking-wider text-slate-700 shadow-xs hover:from-sky-200 hover:to-indigo-300 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer"
              style={faceStyle('rotateX(-90deg) translateZ(28px)')}
            >
              BOTTOM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
