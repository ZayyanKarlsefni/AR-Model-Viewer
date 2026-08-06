'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 380, md: 460, lg: 600 };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(11, 15, 25, 0.42)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'modal-bg-in 140ms ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: `${widths[size]}px`,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          animation: 'modal-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {(title || onClose) && (
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              {title && <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h2>}
              {description && <p style={{ margin: title ? '4px 0 0' : 0, fontSize: '0.8125rem', color: 'var(--color-fg-muted)', lineHeight: 1.5 }}>{description}</p>}
            </div>
            {onClose && (
              <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-fg-subtle)', borderRadius: '6px', flexShrink: 0 }}>
                <X size={18} />
              </button>
            )}
          </div>
        )}
        {children && <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>{children}</div>}
        {footer && <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', background: 'var(--color-bg-subtle)' }}>{footer}</div>}
      </div>
      <style jsx global>{`
        @keyframes modal-bg-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modal-in { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes toast-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
