'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts) => {
    const id = ++idCounter;
    const t = {
      id,
      variant: opts.variant || 'default',
      title: opts.title || '',
      description: opts.description || '',
      duration: opts.duration ?? 3500,
    };
    setToasts((prev) => [...prev, t]);
    if (t.duration > 0) {
      setTimeout(() => dismiss(id), t.duration);
    }
    return id;
  }, [dismiss]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.toast) toast(e.detail.toast);
    };
    window.addEventListener('app:toast', handler);
    return () => window.removeEventListener('app:toast', handler);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ICONS = {
  success: Check,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
};

const STYLES = {
  success: { border: 'var(--color-success-border)', bg: 'var(--color-success-bg)', fg: 'var(--color-success)' },
  error: { border: 'var(--color-danger-border)', bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)' },
  warning: { border: 'var(--color-warning-border)', bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)' },
  info: { border: 'var(--color-info-border)', bg: 'var(--color-info-bg)', fg: 'var(--color-info)' },
  default: { border: 'var(--color-border)', bg: 'var(--color-bg-elevated)', fg: 'var(--color-fg)' },
};

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.variant] || Info;
  const s = STYLES[toast.variant] || STYLES.default;
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.625rem',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '0.75rem 1rem',
        minWidth: '280px',
        maxWidth: '380px',
        boxShadow: 'var(--shadow-lg)',
        pointerEvents: 'auto',
        animation: 'toast-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <Icon size={16} style={{ color: s.fg, flexShrink: 0, marginTop: '2px' }} strokeWidth={2.25} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-fg)' }}>{toast.title}</p>
        )}
        {toast.description && (
          <p style={{ margin: toast.title ? '2px 0 0' : 0, fontSize: '0.8125rem', color: 'var(--color-fg-muted)', wordBreak: 'break-word' }}>{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Close"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-fg-subtle)', flexShrink: 0, borderRadius: '4px' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (opts) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:toast', { detail: { toast: opts } }));
        }
      },
      dismiss: () => {},
    };
  }
  return ctx;
}

export const toast = (opts) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { toast: opts } }));
  }
};
