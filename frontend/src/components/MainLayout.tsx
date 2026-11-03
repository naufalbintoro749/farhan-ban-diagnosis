import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FarhanMotorLogo } from './BrandIcons';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAboutModal, setShowAboutModal] = useState(false);

  const isHome = location.pathname === '/';
  const isPanduan = location.pathname === '/panduan';
  const isDiagnosis = location.pathname.startsWith('/diagnosis');
  const isRiwayat = location.pathname === '/riwayat';

  const navItems = [
    { to: '/', label: 'Beranda', icon: '🏠', active: isHome },
    { to: '/diagnosis', label: 'Diagnosa', icon: '🔍', active: isDiagnosis },
    { to: '/riwayat', label: 'Riwayat', icon: '⏱', active: isRiwayat },
    { to: '/panduan', label: 'Panduan', icon: '📖', active: isPanduan },
  ];

  return (
    <div className="app-container" style={styles.appContainer}>
      {/* ── LEFT SIDEBAR ────────────────────────────────────────── */}
      <aside style={styles.sidebar}>
        {/* Logo Section */}
        <div style={styles.logoContainer} onClick={() => navigate('/')}>
          <FarhanMotorLogo size={52} />
          <h2 style={styles.logoText}>Farhan Motor</h2>
        </div>

        {/* Navigation Items */}
        <nav style={styles.navList}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive || item.active ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}

          {/* Button Tentang */}
          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            style={{
              ...styles.navItem,
              border: 'none',
              background: 'transparent',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <span style={styles.navIcon}>ℹ️</span>
            <span style={styles.navLabel}>Tentang</span>
          </button>
        </nav>

        {/* Decorative Wave Graphic */}
        <div style={styles.sidebarWaveBg}>
          <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.waveSvg}>
            <path
              d="M0 60C50 90 120 30 180 70C210 90 230 110 240 120H0V60Z"
              fill="rgba(255, 255, 255, 0.07)"
            />
            <path
              d="M0 80C60 50 140 100 200 65C220 53 235 60 240 70V120H0V80Z"
              fill="rgba(255, 255, 255, 0.05)"
            />
          </svg>
        </div>

        {/* Bottom Tagline */}
        <div style={styles.sidebarFooter}>
          <p style={styles.footerQuote}>&ldquo;Solusi cepat untuk motor Anda.&rdquo;</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────── */}
      <div style={styles.mainWrapper}>
        {/* Top Header Bar */}
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            {isHome ? (
              <div style={styles.badgePakar}>
                <span style={styles.badgeDot} />
                <span style={styles.badgeText}>Sistem Pakar</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={styles.backBtn}
              >
                ← Kembali
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main style={styles.mainCanvas}>
          <Outlet />
        </main>
      </div>

      {/* ── MODAL TENTANG SISTEM ─────────────────────────────────── */}
      {showAboutModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAboutModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FarhanMotorLogo size={36} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A', fontWeight: 700 }}>
                  Tentang Farhan Motor
                </h3>
              </div>
              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={() => setShowAboutModal(false)}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ margin: '0 0 1rem', lineHeight: 1.6, color: '#334155' }}>
                <strong>Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL)</strong> adalah aplikasi
                yang dirancang untuk bengkel <strong>Farhan Motor</strong> guna membantu mekanik dan
                pemilik kendaraan mendeteksi kerusakan sepeda motor Honda &amp; Yamaha berbasis pola
                kedipan lampu <em>Malfunction Indicator Lamp</em> (MIL).
              </p>
              <div style={styles.modalFeatureBox}>
                <div style={{ fontWeight: 600, color: '#1E6DE8', marginBottom: '4px' }}>
                  🧠 Metode Forward Chaining
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                  Inferensi runut maju yang menganalisis fakta kode kedipan MIL yang terbaca dan
                  mencocokkannya dengan basis pengetahuan pakar untuk menyimpulkan kerusakan,
                  komponen bermasalah, serta langkah perbaikan yang tepat.
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '1.25rem', textAlign: 'center' }}>
                Versi 1.0.0 &bull; &copy; {new Date().getFullYear()} Farhan Motor
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#F4F8FD',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  sidebar: {
    width: '240px',
    minWidth: '240px',
    background: 'linear-gradient(180deg, #094799 0%, #063777 100%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    zIndex: 10,
    boxShadow: '4px 0 20px rgba(9, 71, 153, 0.15)',
    overflow: 'hidden',
  },
  logoContainer: {
    padding: '2rem 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  logoText: {
    margin: '0.75rem 0 0',
    fontSize: '1.2rem',
    fontWeight: 800,
    letterSpacing: '-0.01em',
    color: '#ffffff',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.4rem',
    padding: '0.75rem 1rem',
    flex: 1,
    zIndex: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.75rem 1.15rem',
    borderRadius: '9999px',
    color: 'rgba(255, 255, 255, 0.82)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    backgroundColor: '#1E6DE8',
    color: '#ffffff',
    fontWeight: 700,
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
  },
  navIcon: {
    fontSize: '1.15rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    letterSpacing: '0.01em',
  },
  sidebarWaveBg: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '140px',
    pointerEvents: 'none' as const,
    zIndex: 1,
  },
  waveSvg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  sidebarFooter: {
    padding: '1.5rem',
    zIndex: 2,
    marginTop: 'auto',
  },
  footerQuote: {
    margin: 0,
    fontSize: '0.82rem',
    color: 'rgba(255, 255, 255, 0.65)',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    minHeight: '100vh',
    background: '#F4F8FD',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 2.25rem 0.75rem',
    background: 'transparent',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  badgePakar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#EBF3FE',
    border: '1px solid #D6E4FA',
    padding: '0.35rem 0.9rem',
    borderRadius: '9999px',
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#1E6DE8',
  },
  badgeText: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#1557BF',
    letterSpacing: '0.02em',
  },
  backBtn: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '9999px',
    padding: '0.4rem 1.1rem',
    fontSize: '0.87rem',
    fontWeight: 600,
    color: '#1E6DE8',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 0.15s ease',
  },
  mainCanvas: {
    flex: 1,
    padding: '1rem 2.25rem 2.5rem',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '1rem',
  },
  modalCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease-out',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #F1F5F9',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.1rem',
    color: '#64748B',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '1.5rem',
  },
  modalFeatureBox: {
    background: '#F0F6FE',
    border: '1px solid #DCE9FC',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
  },
};
