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
    e.stopPropagation();
    if (onSelectAngle) {
      onSelectAngle(preset);
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-2 p-3 bg-white/95 rounded-2xl border border-slate-200/90 shadow-xl backdrop-blur-md select-none">
      {/* INVENTOR HOME BUTTON TOP-LEFT */}
      <button
        onClick={(e) => handleFaceClick('iso', e)}
        title="Inventor Home / Isometric View"
        className="absolute top-2 left-2 z-30 flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-600 border border-slate-300 transition-all shadow-2xs active:scale-95"
      >
        <Home className="h-3.5 w-3.5" />
      </button>

      {/* INVENTOR 3D VIEWCUBE CONTAINER */}
      <div className="w-20 h-20 relative perspective-400 mt-4 mb-1">
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
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[11px] font-black text-slate-800 shadow-2xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all"
            style={{ transform: 'translateZ(40px)' }}
          >
            FRONT
          </div>

          {/* BACK */}
          <div
            onClick={(e) => handleFaceClick('back', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[11px] font-black text-slate-800 shadow-2xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all"
            style={{ transform: 'rotateY(180deg) translateZ(40px)' }}
          >
            BACK
          </div>

          {/* RIGHT */}
          <div
            onClick={(e) => handleFaceClick('right', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[11px] font-black text-slate-800 shadow-2xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all"
            style={{ transform: 'rotateY(90deg) translateZ(40px)' }}
          >
            RIGHT
          </div>

          {/* LEFT */}
          <div
            onClick={(e) => handleFaceClick('left', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[11px] font-black text-slate-800 shadow-2xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all"
            style={{ transform: 'rotateY(-90deg) translateZ(40px)' }}
          >
            LEFT
          </div>

          {/* TOP */}
          <div
            onClick={(e) => handleFaceClick('top', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[11px] font-black text-slate-800 shadow-2xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all"
            style={{ transform: 'rotateX(90deg) translateZ(40px)' }}
          >
            TOP
          </div>

          {/* BOTTOM */}
          <div
            onClick={(e) => handleFaceClick('bottom', e)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-400/90 rounded-xs text-[11px] font-black text-slate-800 shadow-2xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all"
            style={{ transform: 'rotateX(-90deg) translateZ(40px)' }}
          >
            BOTTOM
          </div>
        </div>
      </div>

      {/* COMPASS DIRECTION RING */}
      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
        <span>N</span>
        <span>•</span>
        <span>E</span>
        <span>•</span>
        <span>S</span>
        <span>•</span>
        <span>W</span>
      </div>
    </div>
  );
}
