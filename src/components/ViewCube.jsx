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

  /* Cube face size: 24px on mobile (translateZ=12px), 32px on desktop (translateZ=32px via md:) */
  const cubeFaceClasses = "absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-150 to-slate-300 border border-slate-400/90 rounded-xs font-black tracking-wider text-slate-800 shadow-xs hover:from-sky-100 hover:to-indigo-200 hover:text-sky-950 hover:border-sky-500 transition-all cursor-pointer text-[8px] md:text-[11px]";

  return (
    <div className="relative flex flex-col items-center justify-center p-1.5 md:p-2.5 bg-white/95 rounded-xl md:rounded-2xl border border-slate-200/90 shadow-lg md:shadow-xl backdrop-blur-md select-none">
      {/* INVENTOR HOME BUTTON TOP-LEFT */}
      <div className="w-full flex items-center justify-start mb-0.5 md:mb-1">
        <button
          onClick={(e) => handleFaceClick('iso', e)}
          title="Inventor Home / Isometric View"
          className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-md bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-700 border border-slate-300 transition-all shadow-2xs active:scale-95 z-20"
        >
          <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
        </button>
      </div>

      {/* PURE 3D VIEWCUBE CONTAINER */}
      <div className="w-16 h-16 md:w-24 md:h-24 relative flex items-center justify-center p-1 md:p-2" style={{ perspective: '400px' }}>
        <div
          className="w-10 h-10 md:w-16 md:h-16 relative transition-transform duration-75 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.rx}deg) rotateY(${rotation.ry}deg)`,
          }}
        >
          {/* FRONT */}
          <div
            onClick={(e) => handleFaceClick('front', e)}
            className={cubeFaceClasses}
            style={faceStyle('translateZ(20px)')}
          >
            <span className="hidden md:inline">FRONT</span>
            <span className="md:hidden">F</span>
          </div>

          {/* BACK */}
          <div
            onClick={(e) => handleFaceClick('back', e)}
            className={cubeFaceClasses}
            style={faceStyle('rotateY(180deg) translateZ(20px)')}
          >
            <span className="hidden md:inline">BACK</span>
            <span className="md:hidden">Bk</span>
          </div>

          {/* RIGHT */}
          <div
            onClick={(e) => handleFaceClick('right', e)}
            className={cubeFaceClasses}
            style={faceStyle('rotateY(90deg) translateZ(20px)')}
          >
            <span className="hidden md:inline">RIGHT</span>
            <span className="md:hidden">R</span>
          </div>

          {/* LEFT */}
          <div
            onClick={(e) => handleFaceClick('left', e)}
            className={cubeFaceClasses}
            style={faceStyle('rotateY(-90deg) translateZ(20px)')}
          >
            <span className="hidden md:inline">LEFT</span>
            <span className="md:hidden">L</span>
          </div>

          {/* TOP */}
          <div
            onClick={(e) => handleFaceClick('top', e)}
            className={cubeFaceClasses}
            style={faceStyle('rotateX(90deg) translateZ(20px)')}
          >
            <span className="hidden md:inline">TOP</span>
            <span className="md:hidden">T</span>
          </div>

          {/* BOTTOM */}
          <div
            onClick={(e) => handleFaceClick('bottom', e)}
            className={cubeFaceClasses}
            style={faceStyle('rotateX(-90deg) translateZ(20px)')}
          >
            <span className="hidden md:inline">BOTTOM</span>
            <span className="md:hidden">B</span>
          </div>
        </div>
      </div>
    </div>
  );
}
