'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const DEFAULT_PIN = '1234';

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === DEFAULT_PIN) {
      setIsAuthenticated(true);
      fetchModels();
    } else {
      alert('PIN Salah! Silakan coba lagi.');
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blobs');
      const data = await res.json();
      if (res.ok) {
        setModels(data.models || []);
      } else {
        setMessage('Gagal memuat daftar model: ' + data.error);
      }
    } catch (err) {
      setMessage('Error server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (url, code) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus model ID: ${code}?`)) return;

    try {
      const res = await fetch('/api/admin/blobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (res.ok) {
        alert(`Model ID ${code} berhasil dihapus!`);
        fetchModels();
      } else {
        const data = await res.json();
        alert('Gagal menghapus: ' + data.error);
      }
    } catch (err) {
      alert('Error saat menghapus: ' + err.message);
    }
  };

  const handleCopyLink = (code) => {
    const fullUrl = `${window.location.origin}/viewer?code=${code}`;
    navigator.clipboard.writeText(fullUrl);
    alert(`Link terlayap ke clipboard!\n${fullUrl}`);
  };

  const totalSizeMB = models.reduce((acc, m) => acc + parseFloat(m.size || 0), 0).toFixed(2);

  if (!isAuthenticated) {
    return (
      <main className="admin-login-container">
        <div className="login-card">
          <h1>Admin <span>Dashboard</span></h1>
          <p>Masukkan PIN untuk mengakses pengelola model CAD.</p>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              placeholder="PIN Rahasia (Default: 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="login-input"
            />
            <button type="submit" className="login-btn">Masuk Admin</button>
          </form>
        </div>

        <style jsx>{`
          .admin-login-container {
            min-height: 100vh;
            background: #fcfcfd;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1.5rem;
            font-family: var(--font-jetbrains-mono), monospace;
          }
          .login-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 3rem 2.5rem;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.05);
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 0.5rem;
          }
          h1 span {
            font-weight: 300;
            color: #64748b;
          }
          p {
            font-size: 0.875rem;
            color: #64748b;
            margin: 0 0 2rem;
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .login-input {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 0.85rem 1rem;
            border-radius: 12px;
            text-align: center;
            font-size: 0.95rem;
            outline: none;
            color: #0f172a;
          }
          .login-btn {
            background: #0f172a;
            color: #ffffff;
            border: none;
            padding: 0.85rem;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="admin-container">
      <header className="admin-header">
        <div>
          <h1>Dashboard Admin <span>AR Model</span></h1>
          <p>Kelola file model tersimpan & pantau penggunaan cloud storage.</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
          Keluar
        </button>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-title">Total Model Tersimpan</span>
          <span className="stat-value">{models.length} File</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Penggunaan Penyimpanan</span>
          <span className="stat-value">{totalSizeMB} MB / 250 MB</span>
        </div>
      </div>

      <section className="models-section">
        <div className="section-header">
          <h2>Daftar Model Aktif</h2>
          <button onClick={fetchModels} className="refresh-btn">🔄 Refresh Data</button>
        </div>

        {loading && <p className="status-text">Memuat daftar model...</p>}
        {message && <p className="error-text">{message}</p>}

        {!loading && models.length === 0 && (
          <div className="empty-box">
            <p>Belum ada model CAD yang tersimpan di cloud.</p>
          </div>
        )}

        {!loading && models.length > 0 && (
          <div className="table-wrapper">
            <table className="models-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>ID Model</th>
                  <th>Ukuran</th>
                  <th>Tanggal Unggah</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="code-cell">{m.code}</td>
                    <td>{m.size} MB</td>
                    <td className="date-cell">{new Date(m.uploadedAt).toLocaleString('id-ID')}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleCopyLink(m.code)} className="action-btn copy-btn">
                        Salin Link
                      </button>
                      <button onClick={() => handleDelete(m.url, m.code)} className="action-btn delete-btn">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: #fcfcfd;
          padding: 2.5rem;
          max-width: 1100px;
          margin: 0 auto;
          box-sizing: border-box;
          font-family: var(--font-jetbrains-mono), monospace;
          color: #334155;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1.5rem;
        }

        .admin-header h1 {
          margin: 0 0 0.35rem;
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
        }

        .admin-header h1 span {
          font-weight: 300;
          color: #64748b;
        }

        .admin-header p {
          margin: 0;
          font-size: 0.875rem;
          color: #64748b;
        }

        .logout-btn {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #ef4444;
          padding: 0.55rem 1.15rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
        }

        .stat-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
        }

        .models-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.04);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .refresh-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 0.45rem 0.95rem;
          border-radius: 10px;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .models-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }

        .models-table th {
          background: #f8fafc;
          padding: 0.85rem 1rem;
          color: #64748b;
          font-weight: 700;
          border-bottom: 1px solid #e2e8f0;
        }

        .models-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .code-cell {
          font-weight: 700;
          color: #0f172a;
        }

        .date-cell {
          color: #64748b;
          font-size: 0.8rem;
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          border: none;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .copy-btn {
          background: #f1f5f9;
          color: #0f172a;
        }

        .delete-btn {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
        }

        .empty-box {
          text-align: center;
          padding: 3rem 1rem;
          color: #94a3b8;
        }

        @media (max-width: 640px) {
          .admin-container {
            padding: 1.25rem;
          }
          .stats-row {
            grid-template-columns: 1fr;
          }
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </main>
  );
}
