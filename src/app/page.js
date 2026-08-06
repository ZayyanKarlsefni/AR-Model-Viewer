'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Box, ShieldCheck } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function Home() {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setSubmitting(true);
    router.push(`/viewer?code=${trimmed}`);
  };

  return (
    <main style={styles.page}>
      <div style={styles.aura} aria-hidden />

      <header style={styles.header}>
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>
            <Box size={16} strokeWidth={2.5} />
          </div>
          <span style={styles.logoText}>CADimago</span>
        </div>
      </header>

      <section style={styles.hero}>
        <div style={styles.eyebrow}>
          <ShieldCheck size={13} strokeWidth={2.25} />
          <span>Client Portal</span>
        </div>
        <h1 style={styles.title}>
          Open 3D models from<br />
          your working drawings
        </h1>
        <p style={styles.subtitle}>
          Enter the code from your drawing to launch interactive
          3D and Augmented Reality visualization.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputRow}>
            <Input
              type="text"
              placeholder="Example: b73ce3c0b6fd42bd971714777ea7ef03"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
              aria-label="Model code"
              autoComplete="off"
              spellCheck={false}
            />
            <Button type="submit" size="lg" disabled={!code.trim() || submitting} style={styles.submitBtn}>
              Open
              <ArrowRight size={16} strokeWidth={2.5} />
            </Button>
          </div>
          <p style={styles.hint}>32-character alphanumeric code.</p>
        </form>
      </section>

      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} CADimago</span>
        <span style={styles.dot}>·</span>
        <span>CAD &amp; AR Visualization</span>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
  },
  aura: {
    position: 'absolute',
    top: '-30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '900px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(11, 15, 25, 0.025) 0%, transparent 65%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    width: '100%',
    maxWidth: '520px',
    zIndex: 1,
    marginBottom: '4rem',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  },
  logoMark: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'var(--color-accent)',
    color: 'var(--color-accent-fg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.0625rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--color-fg)',
  },
  logoTag: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--color-fg-subtle)',
    background: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    padding: '0.15rem 0.4rem',
    borderRadius: '5px',
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '520px',
    width: '100%',
    zIndex: 1,
    animation: 'hero-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-fg-muted)',
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    padding: '0.3rem 0.7rem',
    borderRadius: '9999px',
    marginBottom: '1.75rem',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.75rem, 5vw, 2.375rem)',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    color: 'var(--color-fg)',
  },
  subtitle: {
    margin: '1rem 0 2.5rem',
    fontSize: '0.9375rem',
    lineHeight: 1.6,
    color: 'var(--color-fg-muted)',
    maxWidth: '380px',
  },
  form: {
    width: '100%',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    width: '100%',
  },
  input: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
  },
  submitBtn: {
    flexShrink: 0,
  },
  hint: {
    margin: '0.75rem 0 0',
    fontSize: '0.75rem',
    color: 'var(--color-fg-subtle)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: 'var(--color-fg-subtle)',
    zIndex: 1,
    marginTop: '4rem',
  },
  dot: {
    color: 'var(--color-border-strong)',
  },
};
