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
        // orbit.theta (rads around Y), orbit.phi (rads from top Y)
        const thetaDeg = (orbit.theta * 180) / Math.PI;
        const phiDeg = (orbit.phi * 180) / Math.PI;

        const ry = -thetaDeg;
        const rx = phiDeg - 90;

        setRotation({ rx, ry });
      } catch {
        // Fallback if getCameraOrbit is initializing
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
    <div className="relative flex flex-col items-center gap-1.5 p-2 bg-white/90 rounded-2xl border border-slate-200/90 shadow-md backdrop-blur-md">
      {/* 3D CUBE CONTAINER */}
      <div className="w-16 h-16 relative perspective-400 select-none cursor-pointer">
        <div
          className="w-full h-full relative transition-transform duration-100 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.rx}deg) rotateY(${rotation.ry}deg)`,
          }}
        >
          {/* FRONT */}
          <div
            onClick={(e) => handleFaceClick('front', e)}
            className="absolute inset-0 flex items-center justify-center bg-white border border-slate-300 rounded-sm text-[10px] font-extrabold text-slate-700 shadow-2xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            style={{ transform: 'translateZ(32px)' }}
          >
            FRONT
          </div>

          {/* BACK */}
          <div
            onClick={(e) => handleFaceClick('back', e)}
            className="absolute inset-0 flex items-center justify-center bg-white border border-slate-300 rounded-sm text-[10px] font-extrabold text-slate-700 shadow-2xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            style={{ transform: 'rotateY(180deg) translateZ(32px)' }}
          >
            BACK
          </div>

          {/* RIGHT */}
          <div
            onClick={(e) => handleFaceClick('right', e)}
            className="absolute inset-0 flex items-center justify-center bg-white border border-slate-300 rounded-sm text-[10px] font-extrabold text-slate-700 shadow-2xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            style={{ transform: 'rotateY(90deg) translateZ(32px)' }}
          >
            RIGHT
          </div>

          {/* LEFT */}
          <div
            onClick={(e) => handleFaceClick('left', e)}
            className="absolute inset-0 flex items-center justify-center bg-white border border-slate-300 rounded-sm text-[10px] font-extrabold text-slate-700 shadow-2xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            style={{ transform: 'rotateY(-90deg) translateZ(32px)' }}
          >
            LEFT
          </div>

          {/* TOP */}
          <div
            onClick={(e) => handleFaceClick('top', e)}
            className="absolute inset-0 flex items-center justify-center bg-white border border-slate-300 rounded-sm text-[10px] font-extrabold text-slate-700 shadow-2xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            style={{ transform: 'rotateX(90deg) translateZ(32px)' }}
          >
            TOP
          </div>

          {/* BOTTOM */}
          <div
            onClick={(e) => handleFaceClick('bottom', e)}
            className="absolute inset-0 flex items-center justify-center bg-white border border-slate-300 rounded-sm text-[10px] font-extrabold text-slate-700 shadow-2xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            style={{ transform: 'rotateX(-90deg) translateZ(32px)' }}
          >
            BOTTOM
          </div>
        </div>
      </div>

      {/* ISOMETRIC / HOME SHORTCUT */}
      <button
        onClick={(e) => handleFaceClick('iso', e)}
        title="Isometric / Home View"
        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition-colors border border-slate-200"
      >
        <Home className="h-3 w-3" />
        <span>ISO</span>
      </button>
    </div>
  );
}
