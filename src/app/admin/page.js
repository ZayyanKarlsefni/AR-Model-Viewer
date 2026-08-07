'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box, LogOut, RefreshCw, Search, Copy, Trash2, HardDrive, Files,
  Eye, Smartphone, Monitor, Tablet, Inbox, AlertCircle, ExternalLink,
} from 'lucide-react';
import { Button, Input, Card, Badge, Spinner, EmptyState, SegmentedControl } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

function parseCode(pathname) {
  if (!pathname) return '—';
  return pathname.replace(/^models\//, '').replace(/\.(glb|step|stp)$/i, '').replace(/_compressed$/, '');
}

function parseDeviceIcon(device) {
  if (!device) return Monitor;
  const d = device.toLowerCase();
  if (d.includes('iphone') || d.includes('android') || d.includes('mobile')) return Smartphone;
  if (d.includes('ipad') || d.includes('tablet')) return Tablet;
  return Monitor;
}

function formatSize(mb) {
  const n = parseFloat(mb || 0);
  if (n >= 1024) return `${(n / 1024).toFixed(2)} GB`;
  return `${n.toFixed(2)} MB`;
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [models, setModels] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [visitSearch, setVisitSearch] = useState('');
  const [tab, setTab] = useState('models');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [redirecting, setRedirecting] = useState(false);

  const fetchModels = async function () {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blobs', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        const normalized = (data.models || []).map((m) => ({
          ...m,
          code: parseCode(m.pathname || m.code),
          sizeNum: parseFloat(m.size || 0),
        }));
        setModels(normalized);
        setMessage('');
      } else {
        setMessage(data.error || 'Failed to load models');
      }
    } catch (err) {
      setMessage('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisits = async function () {
    try {
      const res = await fetch('/api/admin/visits', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setVisits(data.visits || []);
    } catch (e) {
      console.error('Error fetching visits:', e);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      setRedirecting(true);
      window.location.replace('/admin/login');
    }, 6000);

    fetch('/api/admin/me', { cache: 'no-store', signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        clearTimeout(timeoutId);
        if (!data.authenticated) {
          setRedirecting(true);
          window.location.replace('/admin/login');
          return;
        }
        setAuthChecked(true);
        fetchModels();
        fetchVisits();
      })
      .catch(() => {
        clearTimeout(timeoutId);
        setRedirecting(true);
        window.location.replace('/admin/login');
      });

    return () => clearTimeout(timeoutId);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchModels(), fetchVisits()]);
    setRefreshing(false);
    toast({ variant: 'success', title: 'Data refreshed' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch('/api/admin/blobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: deleteTarget.url }),
      });
      if (res.ok) {
        toast({ variant: 'success', title: 'Model deleted', description: `ID ${deleteTarget.code}` });
        setDeleteTarget(null);
        fetchModels();
      } else {
        const data = await res.json();
        toast({ variant: 'error', title: 'Gagal mengDelete', description: data.error });
      }
    } catch (err) {
      toast({ variant: 'error', title: 'Error', description: err.message });
    }
  };

  const handleCopyLink = (code) => {
    const fullUrl = `${window.location.origin}/viewer?code=${code}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast({ variant: 'success', title: 'Link copied', description: fullUrl, duration: 5000 });
    }).catch(() => {
      toast({ variant: 'error', title: 'Copy failed' });
    });
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const totalSizeMB = useMemo(() => models.reduce((acc, m) => acc + (m.sizeNum || 0), 0), [models]);
  const filteredModels = useMemo(() => {
    if (!search.trim()) return models;
    const q = search.toLowerCase();
    return models.filter((m) => m.code?.toLowerCase().includes(q));
  }, [models, search]);
  const filteredVisits = useMemo(() => {
    if (!visitSearch.trim()) return visits;
    const q = visitSearch.toLowerCase();
    return visits.filter((v) => v.code?.toLowerCase().includes(q) || v.device?.toLowerCase().includes(q));
  }, [visits, visitSearch]);

  if (!authChecked) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
        <Spinner size={16} />
        <span style={{ color: 'var(--color-fg-subtle)', fontSize: '0.85rem' }}>
          {redirecting ? 'Mengarahkan ke halaman login...' : 'Memuat dashboard admin...'}
        </span>
        {redirecting && (
          <a href="/admin/login" style={{ fontSize: '0.8rem', color: '#4F46E5', textDecoration: 'underline' }}>
            Klik di sini jika tidak terarah otomatis
          </a>
        )}
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoMark}>
            <Box size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={styles.h1}>Admin Dashboard</h1>
            <p style={styles.subtitle}>Manage models &amp; monitor client visits.</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={14} strokeWidth={2.25} className={refreshing ? 'spin' : ''} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} strokeWidth={2.25} />
            Sign Out
          </Button>
        </div>
      </header>

      <div style={styles.statsRow}>
        <StatCard icon={Files} label="Total Models" value={`${models.length} file`} />
        <StatCard icon={HardDrive} label="Storage" value={`${formatSize(totalSizeMB)} / 250 MB`} />
        <StatCard icon={Eye} label="Recorded Visits" value={`${visits.length} akses`} />
      </div>

      <div style={styles.tabsRow}>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          size="sm"
          options={[
            { value: 'models', label: 'Models', icon: Files },
            { value: 'visits', label: 'Access History', icon: Eye },
          ]}
        />
      </div>

      {tab === 'models' && (
        <Card style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Active Models</h2>
            <div style={styles.searchWrap}>
              <Search size={14} style={styles.searchIcon} />
              <input
                placeholder="Search model code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingRow}><Spinner size={16} /> <span style={styles.muted}>Loading...</span></div>
          ) : message ? (
            <div style={styles.errorBanner}><AlertCircle size={15} /> {message}</div>
          ) : filteredModels.length === 0 ? (
            <EmptyState icon={Inbox} title={search ? 'No matching models' : 'No models yet'} description={search ? 'Try a different keyword.' : 'Models uploaded from the plugin will appear here.'} />
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Model Code</th>
                    <th style={{ ...styles.th, width: '110px' }}>Size</th>
                    <th style={{ ...styles.th, width: '180px' }}>Uploaded</th>
                    <th style={{ ...styles.th, width: '180px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.map((m, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.codeCell}>
                        <span style={styles.codeText}>{m.code}</span>
                      </td>
                      <td style={styles.td}>{formatSize(m.size)}</td>
                      <td style={{ ...styles.td, color: 'var(--color-fg-muted)', fontSize: '0.8125rem' }}>{formatDate(m.uploadedAt)}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.actionsCell}>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyLink(m.code)} title="Copy link">
                            <Copy size={13} />
                          </Button>
                          <a href={`${window.location.origin}/viewer?code=${m.code}`} target="_blank" rel="noreferrer" title="Open viewer">
                            <Button variant="ghost" size="sm" as="span">
                              <ExternalLink size={13} />
                            </Button>
                          </a>
                          <Button variant="danger-soft" size="sm" onClick={() => setDeleteTarget(m)} title="Delete">
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'visits' && (
        <Card style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Access History Klien</h2>
            <div style={styles.searchWrap}>
              <Search size={14} style={styles.searchIcon} />
              <input
                placeholder="Search code or device..."
                value={visitSearch}
                onChange={(e) => setVisitSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {filteredVisits.length === 0 ? (
            <EmptyState icon={Eye} title={visitSearch ? 'No matches' : 'No visits yet'} description={visitSearch ? 'Try a different keyword.' : 'Client viewer activity will appear here.'} />
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Model Code</th>
                    <th style={{ ...styles.th, width: '170px' }}>Device</th>
                    <th style={{ ...styles.th, width: '170px' }}>Access Time</th>
                    <th style={{ ...styles.th, width: '130px' }}>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits.map((v, i) => {
                    const DeviceIcon = parseDeviceIcon(v.device);
                    return (
                      <tr key={i} style={styles.tr}>
                        <td style={styles.codeCell}>
                          <span style={styles.codeText}>{v.code ? v.code.substring(0, 16) : '—'}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.deviceCell}>
                            <DeviceIcon size={13} style={{ color: 'var(--color-fg-subtle)' }} />
                            {v.device || '—'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, color: 'var(--color-fg-muted)', fontSize: '0.8125rem' }}>{formatDate(v.timestamp)}</td>
                        <td style={styles.td}>
                          {v.isAr ? <Badge variant="info">AR</Badge> : <Badge>3D</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete model?"
        description={`Model with code ${deleteTarget?.code} will be permanently deleted from storage.`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={14} />
              Delete
            </Button>
          </>
        }
      />

      <style jsx>{`
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card style={styles.statCard}>
      <div style={styles.statIconWrap}>
        <Icon size={16} strokeWidth={2.25} />
      </div>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </Card>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-bg)',
    padding: '2rem 1.5rem',
    maxWidth: '1140px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--color-accent)',
    color: 'var(--color-accent-fg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '2px 0 0',
    fontSize: '0.8125rem',
    color: 'var(--color-fg-muted)',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  statCard: {
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  statIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-fg-muted)',
    flexShrink: 0,
  },
  statLabel: {
    margin: 0,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--color-fg-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statValue: {
    margin: '2px 0 0',
    fontSize: '1.0625rem',
    fontWeight: 700,
    color: 'var(--color-fg)',
    letterSpacing: '-0.01em',
  },
  tabsRow: {
    marginBottom: '1rem',
  },
  section: {
    padding: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.25rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.625rem',
    color: 'var(--color-fg-subtle)',
    pointerEvents: 'none',
  },
  searchInput: {
    background: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.45rem 0.75rem 0.45rem 2rem',
    fontSize: '0.8125rem',
    color: 'var(--color-fg)',
    outline: 'none',
    fontFamily: 'inherit',
    width: '240px',
    transition: 'border-color 120ms ease, box-shadow 120ms ease',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '2rem 0',
    justifyContent: 'center',
  },
  muted: { color: 'var(--color-fg-subtle)', fontSize: '0.85rem' },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--color-danger)',
    background: 'var(--color-danger-bg)',
    border: '1px solid var(--color-danger-border)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.8125rem',
  },
  tableWrap: {
    overflowX: 'auto',
    margin: '0 -0.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    minWidth: '560px',
  },
  th: {
    textAlign: 'left',
    padding: '0.625rem 0.75rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--color-fg-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-bg-subtle)',
  },
  tr: {
    borderBottom: '1px solid var(--color-border)',
    transition: 'background 100ms ease',
  },
  td: {
    padding: '0.75rem',
    color: 'var(--color-fg)',
    verticalAlign: 'middle',
  },
  codeCell: {
    padding: '0.75rem',
  },
  codeText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--color-fg)',
  },
  actionsCell: {
    display: 'inline-flex',
    gap: '0.25rem',
    justifyContent: 'flex-end',
  },
  deviceCell: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8125rem',
  },
};
