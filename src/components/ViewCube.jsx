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
        if (typeof viewer.getCameraOrbit !== 'function') return;
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

    handleCameraChange();
    if (typeof window !== 'undefined' && window.customElements?.whenDefined) {
      window.customElements.whenDefined('model-viewer').then(handleCameraChange).catch(() => {});
    }
    viewer.addEventListener('camera-change', handleCameraChange);
    viewer.addEventListener('load', handleCameraChange);
    return () => {
      viewer.removeEventListener('camera-change', handleCameraChange);
      viewer.removeEventListener('load', handleCameraChange);
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
  const cubeFaceClasses = "absolute inset-0 flex items-center justify-center bg-[#FAF6EE] border border-[#16335C]/50 rounded-xs font-mono font-bold tracking-wider text-[#16335C] shadow-2xs hover:bg-[#16335C] hover:text-[#FAF6EE] hover:border-[#16335C] transition-colors cursor-pointer text-[8px] md:text-[10px] uppercase select-none";

  return (
    <div className="relative flex flex-col items-center justify-center p-1.5 md:p-2 bg-[#FAF6EE]/95 rounded-lg border border-[#16335C]/30 shadow-md backdrop-blur-md select-none font-mono">
      {/* INVENTOR HOME BUTTON TOP-LEFT */}
      <div className="w-full flex items-center justify-start mb-0.5 md:mb-1">
        <button
          onClick={(e) => handleFaceClick('iso', e)}
          title="Home / Isometric View"
          className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-sm bg-[#FAF6EE] hover:bg-[#16335C] text-[#16335C] hover:text-[#FAF6EE] border border-[#16335C]/30 transition-colors shadow-2xs active:scale-95 z-20 cursor-pointer"
        >
          <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
        </button>
      </div>

      {/* PURE 3D VIEWCUBE CONTAINER */}
      <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center p-1 md:p-2" style={{ perspective: '400px' }}>
        <div
          className="w-10 h-10 relative transition-transform duration-75 ease-out"
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
