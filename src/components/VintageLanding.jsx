'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function VintageLanding({ code, file, errorMessage, onEnterViewer }) {
  const [copied, setCopied] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [inputError, setInputError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const copyTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const cleanCode = code ? code.trim() : null;
  const hasCode = Boolean(cleanCode || file);
  const displayCode = cleanCode || (file ? file.split('/').pop() : manualCode.trim());

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCopyCode = async () => {
    if (!displayCode) return;
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(displayCode);
        setCopied(true);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch {
      // Fallback
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = displayCode;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // No-op
    }
  };

  const handleProceed = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const trimmed = manualCode.trim();
    if (!hasCode || isEditing) {
      if (!trimmed) {
        setInputError('PLEASE ENTER A DRAWING OR MODEL CODE FIRST.');
        return;
      }
      setInputError(null);
      setIsEditing(false);
      triggerTransition(trimmed);
      return;
    }
    setInputError(null);
    triggerTransition(cleanCode || undefined);
  };

  const triggerTransition = (targetCode) => {
    setIsTransitioning(true);
    setTimeout(() => {
      onEnterViewer?.(targetCode);
    }, 400);
  };

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#FAF6EE] text-[#16335C] font-mono transition-all duration-500 ease-out ${
        isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
      }`}
    >
      {/* MINIMALIST EDITORIAL HEADER */}
      <header className="relative z-10 w-full px-6 pt-6 pb-4 sm:px-12 sm:pt-8 md:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* BRAND */}
          <div className="flex items-center gap-2.5">
            <svg
              className="h-4 w-4 text-[#16335C]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#16335C]">
              CADIMAGO
            </span>
          </div>

          {/* DOCUMENT IDENTIFIER */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#16335C]/80 uppercase">
            {hasCode && !isEditing ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[#16335C]/50">DOC:</span>
                <span className="font-bold tracking-wide text-[#16335C]">{displayCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="ml-1 text-[11px] font-medium underline underline-offset-4 hover:text-[#0D1F38] transition-colors cursor-pointer"
                  title="Copy document code"
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
                <span className="text-[#16335C]/20">/</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setManualCode(displayCode || '');
                    setInputError(null);
                  }}
                  className="text-[11px] font-medium underline underline-offset-4 hover:text-[#0D1F38] transition-colors cursor-pointer"
                  title="Edit document code"
                >
                  EDIT
                </button>
              </div>
            ) : (
              <span className="text-xs text-[#16335C]/60 tracking-wider">3D DIGITAL ARCHIVE</span>
            )}
          </div>
        </div>
      </header>

      {/* EDITORIAL HERO SECTION */}
      <main className="relative z-10 flex-1 w-full px-6 sm:px-12 md:px-16 flex flex-col justify-center my-6 sm:my-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm tracking-[0.22em] uppercase text-[#16335C]/60 mb-3 font-semibold">
              ENGINEERING & FABRICATION ARCHIVE
            </p>
            <h1
              style={{ fontFamily: 'var(--font-mono)' }}
              className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#16335C] tracking-wide leading-[1.25] uppercase break-words"
            >
              3D INTERACTIVE MODEL INSPECTION
            </h1>
            <p className="mt-4 sm:mt-5 text-[9px] sm:text-xs md:text-sm text-[#16335C]/80 leading-relaxed max-w-xs sm:max-w-xl uppercase tracking-normal">
              {hasCode
                ? 'QR CODE SCANNED SUCCESSFULLY. ENTER THE 3D INTERACTIVE WORKSPACE TO DIRECTLY INSPECT GEOMETRIC ASSEMBLY, ORTHOGRAPHIC PROJECTION, AND SPATIAL SCALE.'
                : 'ACCESS INTERACTIVE 3D CAD ARCHIVES FROM YOUR WORKING BLUEPRINTS. ENTER YOUR DRAWING CODE TO DIRECTLY INSPECT GEOMETRIC ASSEMBLY, ORTHOGRAPHIC PROJECTION, AND SPATIAL SCALE.'}
            </p>

            {/* ERROR NOTICE (IF RETURNING FROM FAILED MODEL LOAD) */}
            {errorMessage && (
              <div className="mt-5 p-3.5 bg-rose-50/90 border-l-2 border-rose-700 text-xs text-rose-900 leading-relaxed uppercase">
                <span className="font-bold block">MODEL LOAD FAILURE:</span>
                {errorMessage}
              </div>
            )}

            {/* INPUT CODE FORM (WHEN NO CODE OR EDITING) */}
            {(!hasCode || isEditing) && (
              <form onSubmit={handleProceed} className="mt-6 flex flex-col gap-2 max-w-md">
                <label htmlFor="model-code-input" className="text-xs text-[#16335C]/70 uppercase tracking-wide">
                  ENTER CAD DRAWING OR MODEL CODE:
                </label>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    id="model-code-input"
                    type="text"
                    value={manualCode}
                    onChange={(e) => {
                      setManualCode(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="E.G. INV-2026-001"
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white/60 border border-[#16335C]/30 text-[#16335C] placeholder:text-[#16335C]/30 focus:outline-[#16335C] uppercase"
                  />
                  {hasCode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setInputError(null);
                      }}
                      className="px-3.5 py-2.5 text-xs text-[#16335C] hover:bg-[#16335C]/10 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
                {inputError && (
                  <span className="text-xs text-rose-800 font-medium uppercase">
                    {inputError}
                  </span>
                )}
              </form>
            )}

            {/* PRIMARY ACTION BUTTON */}
            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={handleProceed}
                disabled={isTransitioning}
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-[#16335C] hover:bg-[#0D1F38] text-[#FAF6EE] text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                OPEN 3D VIEWER
              </button>
              <span className="text-[11px] text-[#16335C]/60 uppercase tracking-wider">
                STREAMING 3D WEBGL CANVAS WITH AR SUPPORT
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* SEAMLESS ENGRAVING ILLUSTRATION ANCHORED TO HORIZON */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none mt-4 sm:mt-2">
        <div className="relative w-full max-w-7xl mx-auto h-[260px] sm:h-[360px] md:h-[440px] lg:h-[480px]">
          <Image
            src="/images/engraving-editorial-transparent.png"
            alt="19th-century industrial engineering workshop lithograph engraving with engineers inspecting working blueprints and steel trusses"
            fill
            priority
            sizes="100vw"
            className="object-contain object-bottom transition-all duration-1000 ease-out"
          />
        </div>
      </div>

      {/* MINIMALIST EDITORIAL FOOTER */}
      <footer className="relative z-10 w-full px-6 py-4 sm:px-12 md:px-16 border-t border-[#16335C]/10">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-1 text-[8px] sm:text-[11px] text-[#16335C]/50 uppercase tracking-normal sm:tracking-wider text-center sm:text-left">
          <span>CADIMAGO STUDIO • 3D MODEL & WEBAR INTERACTIVE PLATFORM</span>
          <span>OPTIMIZED FOR FIELD QR CODE PHYSICAL DRAWING INSPECTION</span>
        </div>
      </footer>
    </div>
  );
}
