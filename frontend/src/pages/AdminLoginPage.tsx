import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/client';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await adminLogin(email, password);
      if (res.token) {
        localStorage.setItem('admin_token', res.token);
        if (res.admin) {
          localStorage.setItem('admin_user', JSON.stringify(res.admin));
        }
        navigate('/admin/dashboard');
      } else {
        setErrorMsg('Respon token autentikasi tidak valid.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Periksa kembali email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--slate-900)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Header Branding */}
        <div
          style={{
            padding: '2.5rem 2rem 1.75rem',
            textAlign: 'center',
            backgroundColor: 'var(--slate-50)',
            borderBottom: '1px solid var(--slate-200)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontSize: '1.4rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.35)',
            }}
          >
            FM
          </div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--slate-900)',
              margin: 0,
            }}
          >
            Panel Masuk Admin
          </h1>
          <p
            style={{
              color: 'var(--slate-500)',
              fontSize: '0.86rem',
              marginTop: '0.35rem',
            }}
          >
            Farhan Motor — Sistem Pakar Diagnosis MIL
          </p>
        </div>

        {/* Login Form */}
        <div style={{ padding: '2rem' }}>
          {errorMsg && (
            <div
              data-testid="error-login"
              style={{
                marginBottom: '1.25rem',
                padding: '0.8rem 1rem',
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                htmlFor="admin-email"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  marginBottom: '0.4rem',
                }}
              >
                Email Admin
              </label>
              <input
                id="admin-email"
                data-testid="input-email"
                type="email"
                required
                placeholder="admin@farhanmotor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--slate-300)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                  marginBottom: '0.4rem',
                }}
              >
                Kata Sandi
              </label>
              <input
                id="admin-password"
                data-testid="input-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--slate-300)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              data-testid="btn-login-submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                'Masuk ke Panel Admin'
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              borderTop: '1px solid var(--slate-100)',
              paddingTop: '1.25rem',
            }}
          >
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate-500)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              ← Kembali ke Halaman Publik
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
