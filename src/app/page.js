'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleOpenModel = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/viewer?code=${code.trim()}`);
  };

  return (
    <main className="portal-container">
      {/* Background soft dark aura eclipse */}
      <div className="portal-bg-aura-top"></div>

      <div className="portal-content">
        <header className="portal-header">
          <div className="logo-dot"></div>
          <h1 className="logo-text">AR Model <span>Lite</span></h1>
        </header>

        <section className="portal-card">
          <h2>Portal Client AR Model</h2>
          <p>Masukkan Kode Model (GUID) yang tertera pada lembar gambar kerja Anda untuk membuka visualisasi interaktif 3D & Augmented Reality.</p>
          
          <form onSubmit={handleOpenModel} className="portal-form">
            <input
              type="text"
              placeholder="Contoh: b73ce3c0b6fd42bd971714777ea7ef03"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="portal-input"
            />
            <button type="submit" className="portal-btn">
              Buka Model 3D
            </button>
          </form>
        </section>
      </div>

      <footer className="portal-footer">
        <p>© 2026 AR Model Lite. All Rights Reserved.</p>
      </footer>

      <style jsx>{`
        .portal-container {
          min-height: 100vh;
          background: #fcfcfd;
          color: #334155;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          position: relative;
          overflow: hidden;
          padding: 2rem;
          box-sizing: border-box;
        }

        /* Top soft dark aura */
        .portal-bg-aura-top {
          position: absolute;
          top: -250px;
          width: 800px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(15, 23, 42, 0.03) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }

        .portal-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 480px;
          width: 100%;
          z-index: 10;
          padding: 3rem 0;
        }

        .portal-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 3rem;
          animation: fadeIn 0.5s ease;
        }

        .logo-dot {
          width: 10px;
          height: 10px;
          background-color: #0f172a;
          border-radius: 50%;
        }

        .logo-text {
          margin: 0;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.75px;
          color: #0f172a;
          font-family: var(--font-plus-jakarta), sans-serif;
        }

        .logo-text span {
          font-weight: 300;
          color: #64748b;
        }

        /* Portal Main Card */
        .portal-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          padding: 3rem 2.5rem;
          text-align: center;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.04);
          width: 100%;
          box-sizing: border-box;
          animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .portal-card h2 {
          margin: 0 0 0.85rem;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #0f172a;
          font-family: var(--font-plus-jakarta), sans-serif;
        }

        .portal-card p {
          margin: 0 0 2.25rem;
          font-size: 0.925rem;
          line-height: 1.6;
          color: #64748b;
        }

        .portal-form {
          display: flex;
          flex-direction: column;
          gap: 0.95rem;
        }

        .portal-input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          padding: 0.95rem 1.25rem;
          border-radius: 14px;
          font-size: 0.925rem;
          font-weight: 500;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s ease;
          text-align: center;
        }

        .portal-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #0f172a;
          box-shadow: 0 0 0 1px #0f172a;
        }

        .portal-input::placeholder {
          color: #94a3b8;
        }

        .portal-btn {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 0.95rem 1.25rem;
          border-radius: 14px;
          font-size: 0.925rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.2);
        }

        .portal-btn:hover {
          background: #1e293b;
          transform: translateY(-1px);
          box-shadow: 0 12px 20px -4px rgba(15, 23, 42, 0.3);
        }

        .portal-btn:active {
          transform: translateY(0);
        }

        .portal-footer {
          text-align: center;
          font-size: 0.8rem;
          color: #94a3b8;
          z-index: 10;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 480px) {
          .portal-card {
            padding: 2.25rem 1.75rem;
            border-radius: 20px;
          }
          .portal-header {
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </main>
  );
}
