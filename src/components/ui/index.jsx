export function Button({ variant = 'primary', size = 'md', children, style, ...props }) {
  const variants = {
    primary: { background: 'var(--color-accent)', color: 'var(--color-accent-fg)', border: '1px solid var(--color-accent)' },
    secondary: { background: 'var(--color-bg-elevated)', color: 'var(--color-fg)', border: '1px solid var(--color-border-strong)' },
    ghost: { background: 'transparent', color: 'var(--color-fg-muted)', border: '1px solid transparent' },
    danger: { background: 'var(--color-danger)', color: '#fff', border: '1px solid var(--color-danger)' },
    'danger-soft': { background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)' },
  };
  const sizes = {
    sm: { padding: '0.4rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-md)' },
    md: { padding: '0.625rem 1.125rem', fontSize: '0.875rem', borderRadius: 'var(--radius-md)' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '0.9375rem', borderRadius: 'var(--radius-lg)' },
    icon: { padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  };
  return (
    <button
      style={{
        ...variants[variant],
        ...sizes[size],
        fontWeight: 600,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.55 : 1,
        transition: 'background 120ms ease, border-color 120ms ease, transform 80ms ease, box-shadow 120ms ease',
        fontFamily: 'inherit',
        lineHeight: 1,
        display: size === 'icon' ? 'inline-flex' : 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        ...style,
      }}
      onPointerDown={(e) => { if (!props.disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ style, invalid, ...props }) {
  return (
    <input
      style={{
        background: 'var(--color-bg-elevated)',
        border: `1px solid ${invalid ? 'var(--color-danger)' : 'var(--color-border-strong)'}`,
        color: 'var(--color-fg)',
        padding: '0.625rem 0.9375rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9375rem',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
        outline: 'none',
        fontFamily: 'inherit',
        ...style,
      }}
      onFocus={(e) => {
        if (!invalid) e.target.style.borderColor = 'var(--color-accent)';
        e.target.style.boxShadow = 'var(--shadow-focus)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = invalid ? 'var(--color-danger)' : 'var(--color-border-strong)';
        e.target.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
}

export function Card({ children, style, ...props }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ variant = 'default', children, style }) {
  const variants = {
    default: { bg: 'var(--color-bg-subtle)', fg: 'var(--color-fg-muted)', border: 'var(--color-border)' },
    success: { bg: 'var(--color-success-bg)', fg: 'var(--color-success)', border: 'var(--color-success-border)' },
    danger: { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)', border: 'var(--color-danger-border)' },
    warning: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)', border: 'var(--color-warning-border)' },
    info: { bg: 'var(--color-info-bg)', fg: 'var(--color-info)', border: 'var(--color-info-border)' },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      background: v.bg, color: v.fg, border: `1px solid ${v.border}`,
      padding: '0.2rem 0.55rem', borderRadius: '9999px',
      fontSize: '0.6875rem', fontWeight: 600, lineHeight: 1.2,
      letterSpacing: '0.01em',
      ...style,
    }}>
      {children}
    </span>
  );
}

export function Spinner({ size = 18, style }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        ...style,
      }}
    >
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '3rem 1.5rem', textAlign: 'center', gap: '0.75rem',
    }}>
      {Icon && (
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-fg-subtle)',
        }}>
          <Icon size={20} />
        </div>
      )}
      <div>
        <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-fg)' }}>{title}</p>
        {description && <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--color-fg-muted)', maxWidth: '320px' }}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SegmentedControl({ options, value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? '0.3rem 0.625rem' : '0.4375rem 0.875rem';
  const fs = size === 'sm' ? '0.75rem' : '0.8125rem';
  return (
    <div role="tablist" style={{
      display: 'inline-flex', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '3px', gap: '2px',
    }}>
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            style={{
              padding: pad, fontSize: fs, fontWeight: 600,
              background: active ? 'var(--color-bg-elevated)' : 'transparent',
              color: active ? 'var(--color-fg)' : 'var(--color-fg-muted)',
              border: 'none', cursor: 'pointer',
              borderRadius: 'calc(var(--radius-md) - 3px)',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: active ? 'var(--shadow-xs)' : 'none',
              transition: 'background 120ms ease, color 120ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
