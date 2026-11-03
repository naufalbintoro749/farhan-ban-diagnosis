import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { adminLogout } from '../api/client';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('admin_user');
  const user = storedUser ? JSON.parse(storedUser) : { nama: 'Administrator', email: 'admin' };

  const handleLogout = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        await adminLogout(token);
      } catch {
        // ignore error
      }
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: '📊 Dashboard', id: 'nav-dashboard' },
    { to: '/admin/master', label: '🏷️ Data Master', id: 'nav-master' },
    { to: '/admin/data-teknis', label: '⚙️ Data Teknis', id: 'nav-teknis' },
    { to: '/admin/basis-aturan', label: '🧠 Basis Aturan', id: 'nav-aturan' },
    { to: '/admin/riwayat', label: '📋 Riwayat & Laporan', id: 'nav-riwayat' },
    { to: '/admin/pengguna', label: '👥 Kelola Admin', id: 'nav-pengguna' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--slate-900)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--slate-800)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            FM
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              Farhan Motor
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
              Panel Administrasi
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              id={item.id}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#fff' : 'var(--slate-400)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User profile & Logout at bottom */}
        <div
          style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--slate-800)',
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
              {user.nama}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--slate-400)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.55rem',
              backgroundColor: 'transparent',
              color: 'var(--danger-border)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <span>🚪</span> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#fff',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: 'var(--slate-500)', fontWeight: 500 }}>
            Sistem Pakar Diagnosis Kerusakan Sepeda Motor Berbasis MIL
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                fontSize: '0.84rem',
                padding: '0.4rem 0.8rem',
                backgroundColor: 'var(--slate-100)',
                color: 'var(--slate-700)',
                border: '1px solid var(--slate-300)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🌐 Buka Halaman Publik
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
