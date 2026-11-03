import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HondaLogo, YamahaLogo, MILBadgeIcon } from '../components/BrandIcons';

export default function HomePage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const handleSelectBrand = (merekId: number, merekNama: string) => {
    navigate('/diagnosis', {
      state: { selectedMerekId: merekId, selectedMerekNama: merekNama },
    });
  };

  return (
    <div style={s.page}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={s.hero}>
        {/* Decorative blobs */}
        <div style={s.blob1} />
        <div style={s.blob2} />
        <div style={s.blobCenter} />

        <div style={s.heroGrid}>
          {/* LEFT */}
          <div style={s.leftCol}>
            <div style={s.pill}>
              <span style={s.pillDot} />
              <span style={s.pillText}>Sistem Pakar Forward Chaining · Farhan Motor</span>
            </div>

            <h1 style={s.title}>
              Diagnosis Motor<br />
              <span style={s.titleBlue}>Lebih Cepat,</span><br />
              Lebih Akurat.
            </h1>

            <p style={s.desc}>
              Deteksi kerusakan <strong>Honda &amp; Yamaha</strong> hanya dengan memasukkan
              kode kedipan <strong>MIL</strong>. Sistem pakar akan menganalisis dan memberikan
              solusi perbaikan secara otomatis.
            </p>

            {/* CTA */}
            <div style={s.ctaRow}>
              <button style={s.btnPrimary} onClick={() => navigate('/diagnosis')}>
                <span>Mulai Diagnosa</span>
                <span style={s.btnArrow}>→</span>
              </button>
              <button style={s.btnGhost} onClick={() => navigate('/panduan')}>
                <span style={{ fontSize: '1rem' }}>📖</span>
                <span>Panduan</span>
              </button>
            </div>

            {/* Brand Pills */}
            <div style={s.brandRow}>
              <span style={s.brandLabel}>Langsung pilih:</span>
              <button style={s.pillHonda} onClick={() => handleSelectBrand(1, 'Honda')}>
                <span style={s.dotRed} />Honda
              </button>
              <button style={s.pillYamaha} onClick={() => handleSelectBrand(2, 'Yamaha')}>
                <span style={s.dotBlue} />Yamaha
              </button>
            </div>

            {/* 3 Feature Cards */}
            <div style={s.featureGrid}>
              {[
                { id: 1, icon: '⚡', title: 'Cepat & Akurat', sub: 'Analisis kode MIL real-time', bg: '#EFF6FF', to: '/diagnosis' },
                { id: 2, icon: '🛡️', title: 'Honda & Yamaha', sub: '2 merek motor populer', bg: '#FEF2F2', to: '/diagnosis' },
                { id: 3, icon: '⚙️', title: 'Solusi Lengkap', sub: 'Rekomendasi perbaikan', bg: '#F0FDF4', to: '/panduan' },
              ].map(f => (
                <button
                  key={f.id}
                  style={{
                    ...s.featureCard,
                    ...(hoveredCard === f.id ? s.featureCardHover : {}),
                  }}
                  onMouseEnter={() => setHoveredCard(f.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate(f.to)}
                >
                  <div style={{ ...s.featureIcon, background: f.bg }}>
                    <span>{f.icon}</span>
                  </div>
                  <div style={s.featureText}>
                    <div style={s.featureTitle}>{f.title}</div>
                    <div style={s.featureSub}>{f.sub}</div>
                  </div>
                  {hoveredCard === f.id && <span style={s.featureArrow}>→</span>}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Bike showcase */}
          <div style={s.rightCol}>
            <div style={s.bikeAura} />

            {/* Floating diag card */}
            <div style={s.floatCard}>
              <MILBadgeIcon size={34} />
              <div>
                <div style={s.floatCardLabel}>
                  Kode Kedipan MIL
                  <span className="mil-blink" style={s.milDot} />
                </div>
                <div style={s.floatCardVal}>
                  (1,3)
                  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" style={{ marginLeft: 6 }}>
                    <path d="M1 7H9L12 2L16 12L20 3L23 10L26 7H39" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Motorcycle */}
            <div className="float-motor" style={s.bikeWrap}>
              <img src="/motorcycle.png" alt="Sepeda Motor" style={s.bikeImg} />
            </div>

            {/* Live badge */}
            <div style={s.liveBadge}>
              <span style={s.liveDot} />
              <span style={s.liveText}>Sistem Pakar Siap Mendiagnosa</span>
            </div>

            {/* Brand buttons */}
            <div style={s.brandBtns}>
              <div style={s.brandHint}>Klik untuk diagnosa:</div>
              <HondaLogo size={50} onClick={() => handleSelectBrand(1, 'Honda')} interactive />
              <YamahaLogo size={50} onClick={() => handleSelectBrand(2, 'Yamaha')} interactive />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────── */}
      <section style={s.statsStrip}>
        {[
        { icon: '🏍️', value: '2', label: 'Merek Motor', color: '#2563EB' },
          { icon: '💡', value: '50+', label: 'Kode MIL', color: '#D97706' },
          { icon: '📋', value: '100+', label: 'Aturan Diagnosis', color: '#059669' },
          { icon: '🔧', value: '∞', label: 'Solusi Perbaikan', color: '#7C3AED' },
        ].map((s2, i, arr) => (
          <div key={i} style={s.statRow}>
            <div style={s.statWrap}>
              <div style={{ ...s.statIcon, background: `${s2.color}15` }}>
                <span style={{ fontSize: '1.2rem' }}>{s2.icon}</span>
              </div>
              <div>
                <div style={{ ...s.statNum, color: s2.color }}>{s2.value}</div>
                <div style={s.statLbl}>{s2.label}</div>
              </div>
            </div>
            {i < arr.length - 1 && <div style={s.statSep} />}
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section style={s.howSection}>
        {/* Section header */}
        <div style={s.sectionHead}>
          <div style={s.sectionBadge}>🧠 Forward Chaining Engine</div>
          <h2 style={s.sectionTitle}>Cara Kerja Sistem</h2>
          <p style={s.sectionSub}>3 langkah mudah untuk diagnosis kerusakan motor Anda</p>
        </div>

        <div style={s.stepsWrap}>
          {[
            {
              n: 1, icon: '🏍️', title: 'Pilih Merek',
              desc: 'Tentukan merek motor Honda atau Yamaha yang akan didiagnosis',
              color: '#1E6DE8', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
            },
            {
              n: 2, icon: '💡', title: 'Input Kode MIL',
              desc: 'Masukkan pola kedipan lampu MIL yang terbaca di dashboard',
              color: '#0284C7', bg: 'linear-gradient(135deg,#E0F2FE,#BAE6FD)',
            },
            {
              n: 3, icon: '✅', title: 'Terima Solusi',
              desc: 'Sistem menganalisis dan memberikan rekomendasi perbaikan',
              color: '#059669', bg: 'linear-gradient(135deg,#ECFDF5,#A7F3D0)',
            },
          ].map((step, i) => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <div
                style={{
                  ...s.stepCard,
                  ...(hoveredStep === step.n ? { ...s.stepCardHover, boxShadow: `0 16px 40px ${step.color}20` } : {}),
                }}
                onMouseEnter={() => setHoveredStep(step.n)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Number badge */}
                <div style={{ ...s.stepNum, background: step.color }}>
                  {step.n}
                </div>
                {/* Icon */}
                <div style={{ ...s.stepIconBox, background: step.bg }}>
                  <span style={{ fontSize: '1.8rem' }}>{step.icon}</span>
                </div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepDesc}>{step.desc}</div>
                {/* Bottom accent bar */}
                <div style={{ ...s.stepBar, background: step.color }} />
              </div>

              {/* Connector arrow */}
              {i < 2 && (
                <div style={s.connector}>
                  <svg width="44" height="20" viewBox="0 0 44 20" fill="none">
                    <path d="M2 10H36" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round"/>
                    <path d="M32 5L40 10L32 15" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── STYLES ─────────────────────────────────────────────────── */
const s = {
  page: {
    width: '100%',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },

  /* HERO */
  hero: {
    position: 'relative' as const,
    padding: '0.5rem 0 2.5rem',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute' as const,
    top: '-120px', right: '-100px',
    width: '500px', height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, rgba(59,130,246,0.08) 40%, transparent 65%)',
    pointerEvents: 'none' as const,
    filter: 'blur(50px)',
    zIndex: 0,
  },
  blob2: {
    position: 'absolute' as const,
    bottom: '-80px', left: '-60px',
    width: '380px', height: '380px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(147,197,253,0.08) 40%, transparent 65%)',
    pointerEvents: 'none' as const,
    filter: 'blur(50px)',
    zIndex: 0,
  },
  blobCenter: {
    position: 'absolute' as const,
    top: '20%', left: '38%',
    width: '700px', height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)',
    pointerEvents: 'none' as const,
    filter: 'blur(60px)',
    zIndex: 0,
  },
  heroGrid: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: 'minmax(430px, 1.2fr) 1fr',
    alignItems: 'center',
    gap: '2rem',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  /* Pill / tagline */
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '9999px',
    padding: '0.3rem 0.9rem',
    width: 'fit-content',
    marginBottom: '1.1rem',
  },
  pillDot: {
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: '#1E6DE8',
    boxShadow: '0 0 0 2px rgba(30,109,232,0.2)',
    display: 'inline-block',
  },
  pillText: {
    fontSize: '0.77rem', fontWeight: 700,
    color: '#1D4ED8', letterSpacing: '0.01em',
  },
  /* Title */
  title: {
    fontSize: '2.7rem',
    fontWeight: 800,
    lineHeight: 1.18,
    letterSpacing: '-0.028em',
    color: '#0F172A',
    margin: '0 0 1.15rem',
  },
  titleBlue: {
    color: '#1E6DE8',
  },
  desc: {
    fontSize: '0.97rem',
    lineHeight: 1.72,
    color: '#475569',
    maxWidth: '520px',
    margin: '0 0 1.8rem',
  },
  /* CTA */
  ctaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.6rem',
    flexWrap: 'wrap' as const,
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#1E6DE8',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '0.82rem 2rem',
    fontSize: '0.97rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(30,109,232,0.35)',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  btnArrow: {
    fontSize: '1.1rem',
    fontWeight: 400,
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#fff',
    color: '#334155',
    border: '1.5px solid #E2E8F0',
    borderRadius: '12px',
    padding: '0.8rem 1.6rem',
    fontSize: '0.97rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  /* Brand pills */
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },
  brandLabel: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#94A3B8',
  },
  pillHonda: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '9999px',
    padding: '0.38rem 0.9rem',
    fontSize: '0.81rem',
    fontWeight: 700,
    color: '#DC2626',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  pillYamaha: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '9999px',
    padding: '0.38rem 0.9rem',
    fontSize: '0.81rem',
    fontWeight: 700,
    color: '#1D4ED8',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  dotRed: {
    display: 'inline-block',
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: '#DC2626',
  },
  dotBlue: {
    display: 'inline-block',
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: '#1D4ED8',
  },
  /* Feature cards */
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    maxWidth: '560px',
  },
  featureCard: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: '#fff',
    border: '1px solid #F1F5F9',
    borderRadius: '14px',
    padding: '0.75rem 0.9rem',
    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
    cursor: 'pointer',
    transition: 'all 0.22s ease',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    outline: 'none',
  },
  featureCardHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(30,109,232,0.1)',
    borderColor: '#BFDBFE',
  },
  featureIcon: {
    width: '34px', height: '34px',
    minWidth: '34px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  featureText: { display: 'flex', flexDirection: 'column' as const, flex: 1 },
  featureTitle: { fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.25 },
  featureSub: { fontSize: '0.68rem', color: '#94A3B8', marginTop: '1px', lineHeight: 1.3 },
  featureArrow: { fontSize: '0.85rem', color: '#1E6DE8', fontWeight: 700 },

  /* RIGHT COL */
  rightCol: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '460px',
  },
  bikeAura: {
    position: 'absolute' as const,
    width: '480px', height: '380px',
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, rgba(96,165,250,0.08) 45%, transparent 72%)',
    pointerEvents: 'none' as const,
    zIndex: 0,
    filter: 'blur(24px)',
    bottom: '40px',
  },
  bikeWrap: {
    position: 'relative' as const,
    zIndex: 2,
    width: '100%',
    maxWidth: '520px',
    filter: 'drop-shadow(0 20px 40px rgba(30,64,175,0.18)) drop-shadow(0 4px 12px rgba(59,130,246,0.12))',
  },
  bikeImg: {
    width: '100%', height: 'auto',
    objectFit: 'contain' as const,
    transform: 'scale(1.08) translateX(-10px)',
  },
  floatCard: {
    position: 'absolute' as const,
    top: '16px', left: '4px',
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: '0.65rem 1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    boxShadow: '0 8px 28px rgba(30,64,175,0.12), 0 2px 8px rgba(30,64,175,0.06)',
    border: '1px solid rgba(219,234,254,0.9)',
    zIndex: 4,
  },
  floatCardLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.74rem',
    fontWeight: 700,
    color: '#1E3A8A',
  },
  milDot: {
    display: 'inline-block',
    width: '7px', height: '7px',
    borderRadius: '50%',
    background: '#3B82F6',
    boxShadow: '0 0 8px rgba(59,130,246,0.7)',
  },
  floatCardVal: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.84rem',
    fontWeight: 700,
    color: '#1E6DE8',
    marginTop: '2px',
  },
  liveBadge: {
    position: 'absolute' as const,
    bottom: '14px', left: '36px',
    background: 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(12px)',
    borderRadius: '9999px',
    padding: '0.42rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    boxShadow: '0 4px 16px rgba(30,64,175,0.09)',
    border: '1px solid #DBEAFE',
    zIndex: 3,
  },
  liveDot: {
    width: '7px', height: '7px',
    borderRadius: '50%',
    background: '#3B82F6',
    boxShadow: '0 0 0 3px rgba(59,130,246,0.2)',
    display: 'inline-block',
  },
  liveText: { fontSize: '0.78rem', fontWeight: 600, color: '#1E3A8A' },
  brandBtns: {
    position: 'absolute' as const,
    right: '0px', top: '28px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.7rem',
    zIndex: 4,
  },
  brandHint: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#94A3B8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },

  /* STATS STRIP */
  statsStrip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    margin: '0 0 0.5rem',
    padding: '1.6rem 2rem',
    background: '#fff',
    border: '1px solid #F1F5F9',
    borderRadius: '20px',
    boxShadow: '0 2px 16px rgba(15,23,42,0.04)',
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
  },
  statIcon: {
    width: '44px', height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: '1.6rem',
    fontWeight: 800,
    lineHeight: 1.15,
  },
  statLbl: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#94A3B8',
    letterSpacing: '0.02em',
    marginTop: '1px',
  },
  statSep: {
    width: '1px',
    height: '42px',
    background: '#F1F5F9',
    margin: '0 0.5rem',
  },

  /* HOW IT WORKS */
  howSection: {
    marginTop: '2rem',
    paddingTop: '0.5rem',
  },
  sectionHead: {
    textAlign: 'center' as const,
    marginBottom: '2.2rem',
  },
  sectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#F8FAFF',
    border: '1px solid #E0EAFF',
    borderRadius: '9999px',
    padding: '0.32rem 1rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#1D4ED8',
    marginBottom: '0.8rem',
  },
  sectionTitle: {
    fontSize: '1.7rem',
    fontWeight: 800,
    color: '#0F172A',
    letterSpacing: '-0.025em',
    margin: '0 0 0.45rem',
  },
  sectionSub: {
    fontSize: '0.91rem',
    color: '#64748B',
    margin: 0,
  },
  stepsWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCard: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    width: '210px',
    background: '#fff',
    border: '1px solid #F1F5F9',
    borderRadius: '20px',
    padding: '2rem 1.4rem 1.6rem',
    boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
    transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
    overflow: 'hidden',
  },
  stepCardHover: {
    transform: 'translateY(-6px)',
    borderColor: '#E0EAFF',
  },
  stepNum: {
    position: 'absolute' as const,
    top: '14px', right: '14px',
    width: '24px', height: '24px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#fff',
  },
  stepIconBox: {
    width: '64px', height: '64px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  stepTitle: {
    fontSize: '0.94rem',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '0.4rem',
    letterSpacing: '-0.01em',
  },
  stepDesc: {
    fontSize: '0.77rem',
    color: '#64748B',
    lineHeight: 1.55,
  },
  stepBar: {
    position: 'absolute' as const,
    bottom: 0, left: '30%', right: '30%',
    height: '3px',
    borderRadius: '3px 3px 0 0',
    opacity: 0.6,
  },
  connector: {
    padding: '0 0.2rem',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.2rem',
  },
};
