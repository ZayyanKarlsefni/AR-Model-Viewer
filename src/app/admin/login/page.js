'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box, Lock, LogIn } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          window.location.href = '/admin';
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (err) {
      setError('Connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.muted}>Checking session...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>
            <Box size={16} strokeWidth={2.5} />
          </div>
          <span style={styles.logoText}>CADimago <span style={styles.logoTag}>Admin</span></span>
        </div>
        <div style={styles.lockIcon}>
          <Lock size={20} strokeWidth={2} />
        </div>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>Enter password to access model management.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoFocus
            disabled={loading}
            invalid={!!error}
            aria-label="Password admin"
          />
          {error && <p style={styles.error}>{error}</p>}
          <Button type="submit" size="lg" disabled={loading || !password.trim()} style={styles.button}>
            <LogIn size={16} strokeWidth={2.5} />
            {loading ? 'Verifying...' : 'Sign In'}
          </Button>
        </form>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={13} /> Kembali ke Portal
        </Link>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-bg)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.5rem',
  },
  card: {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-2xl)',
    padding: '2.5rem',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.75rem',
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
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--color-fg)',
  },
  logoTag: {
    fontWeight: 400,
    color: 'var(--color-fg-subtle)',
  },
  lockIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-fg-muted)',
    margin: '0 auto 1.25rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: '0 0 0.5rem',
  },
  subtitle: {
    fontSize: '0.8125rem',
    color: 'var(--color-fg-muted)',
    margin: '0 0 1.75rem',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  input: {
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
  error: {
    color: 'var(--color-danger)',
    fontSize: '0.75rem',
    margin: 0,
    background: 'var(--color-danger-bg)',
    border: '1px solid var(--color-danger-border)',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
  },
  muted: {
    color: 'var(--color-fg-subtle)',
    fontSize: '0.85rem',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    marginTop: '1.5rem',
    fontSize: '0.75rem',
    color: 'var(--color-fg-muted)',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
