import { useNavigate } from 'react-router-dom';

export default function PanduanPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Page Title & Subtitle */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Panduan Penggunaan Sistem</h1>
        <p style={styles.pageSubtitle}>
          Ikuti langkah-langkah berikut untuk menggunakan sistem diagnosa dengan benar.
        </p>
      </div>

      {/* 2-Column Responsive Grid */}
      <div style={styles.grid}>
        {/* ── LEFT COLUMN ────────────────────────────────────────── */}
        <div style={styles.col}>
          {/* Card: Apa itu Lampu MIL? */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrap}>
                <span style={{ fontSize: '1.2rem' }}>💡</span>
              </div>
              <h2 style={styles.cardTitle}>Apa itu Lampu MIL?</h2>
            </div>

            <p style={styles.cardText}>
              <strong>MIL</strong> (<em>Malfunction Indicator Lamp</em>) adalah lampu indikator kerusakan
              pada sepeda motor injeksi. Ketika sistem injeksi mendeteksi adanya masalah, lampu MIL
              akan berkedip dengan pola tertentu yang merepresentasikan kode kesalahan spesifik.
            </p>

            <div style={styles.infoBox}>
              <span style={{ fontSize: '1rem', marginTop: '2px' }}>ℹ️</span>
              <span style={{ fontSize: '0.86rem', lineHeight: 1.55 }}>
                Lampu MIL biasanya terletak di panel instrumen dan berwarna oranye atau kuning. Pola
                kedipannya berbeda-beda tergantung jenis kerusakan.
              </span>
            </div>
          </div>

          {/* Card: Contoh Kode MIL */}
          <div style={styles.card}>
            <h3 style={styles.subCardTitle}>Contoh Kode MIL</h3>

            {/* Contoh 1: Kode 12 */}
            <div style={styles.sampleBlock}>
              <div style={styles.sampleLabel}>Contoh &mdash; Kode MIL 12:</div>
              <div style={styles.patternRow}>
                <div style={styles.barLong} title="Kedipan Panjang (1,3s)" />
                <div style={styles.barShort} title="Kedipan Pendek (0,3s)" />
                <div style={styles.barShort} title="Kedipan Pendek (0,3s)" />
                <span style={styles.patternMath}>&larr;&nbsp; 1 panjang + 2 pendek = <strong>12</strong></span>
              </div>
            </div>

            {/* Contoh 2: Kode 21 */}
            <div style={styles.sampleBlock}>
              <div style={styles.sampleLabel}>Contoh &mdash; Kode MIL 21:</div>
              <div style={styles.patternRow}>
                <div style={styles.barLong} title="Kedipan Panjang (1,3s)" />
                <div style={styles.barLong} title="Kedipan Panjang (1,3s)" />
                <div style={styles.barShort} title="Kedipan Pendek (0,3s)" />
                <span style={styles.patternMath}>&larr;&nbsp; 2 panjang + 1 pendek = <strong>21</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ───────────────────────────────────────── */}
        <div style={styles.col}>
          {/* Card: Cara Membaca Pola Kedipan MIL */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrap}>
                <span style={{ fontSize: '1.2rem' }}>🏍️</span>
              </div>
              <h2 style={styles.cardTitle}>Cara Membaca Pola Kedipan MIL</h2>
            </div>

            {/* Steps list */}
            <div style={styles.stepsList}>
              <div style={styles.stepItem}>
                <div style={styles.stepBadge}>1</div>
                <div style={styles.stepDesc}>
                  Nyalakan kontak sepeda motor (kunci ON) tanpa menghidupkan mesin.
                </div>
              </div>

              <div style={styles.stepItem}>
                <div style={styles.stepBadge}>2</div>
                <div style={styles.stepDesc}>
                  Perhatikan lampu MIL &mdash; lampu akan mulai berkedip setelah beberapa detik.
                </div>
              </div>

              <div style={styles.stepItem}>
                <div style={styles.stepBadge}>3</div>
                <div style={styles.stepDesc}>
                  Hitung pola kedipan: <strong>kedipan panjang (&plusmn;1,3 detik)</strong> merepresentasikan
                  puluhan, dan <strong>kedipan pendek (&plusmn;0,3 detik)</strong> merepresentasikan satuan.
                </div>
              </div>

              <div style={styles.stepItem}>
                <div style={styles.stepBadge}>4</div>
                <div style={styles.stepDesc}>
                  Gabungkan nilai puluhan dan satuan untuk mendapatkan kode MIL. Contoh:{' '}
                  <strong>1 kedipan panjang + 2 kedipan pendek = Kode 12</strong>.
                </div>
              </div>

              <div style={styles.stepItem}>
                <div style={styles.stepBadge}>5</div>
                <div style={styles.stepDesc}>
                  Jika ada lebih dari satu kode, ulangi proses setelah jeda singkat antar kode
                  (biasanya &plusmn;1,3 detik).
                </div>
              </div>
            </div>

            {/* Warning / Keterangan Box */}
            <div style={styles.keteranganBox}>
              <div style={styles.keteranganHeader}>
                <span style={{ fontSize: '0.95rem' }}>⚠️</span>
                <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Keterangan</span>
              </div>
              <div style={styles.keteranganText}>
                Kedipan panjang (puluhan) = 1,3 detik &nbsp;|&nbsp; Kedipan pendek (satuan) = 0,3 detik
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              style={styles.ctaButton}
              onClick={() => navigate('/diagnosis')}
            >
              <span style={{ fontSize: '1.05rem' }}>🔍</span>
              <span>Mulai Diagnosa Sekarang</span>
              <span style={{ fontSize: '1.05rem', marginLeft: '4px' }}>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    paddingBottom: '2.5rem',
  },
  pageHeader: {
    marginBottom: '1.5rem',
  },
  pageTitle: {
    fontSize: '1.65rem',
    fontWeight: 800,
    color: '#0F172A',
    margin: '0 0 0.35rem',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '0.92rem',
    color: '#64748B',
    margin: 0,
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  col: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
    border: '1px solid #E8EFF8',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  cardIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#EBF3FE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: 0,
  },
  cardText: {
    fontSize: '0.88rem',
    lineHeight: 1.65,
    color: '#334155',
    margin: '0 0 1rem',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    background: '#F0F7FF',
    border: '1px solid #D4E6FA',
    borderRadius: '10px',
    padding: '0.75rem 0.95rem',
    color: '#1E40AF',
  },
  subCardTitle: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 1rem',
  },
  sampleBlock: {
    marginBottom: '1rem',
  },
  sampleLabel: {
    fontSize: '0.84rem',
    fontWeight: 600,
    color: '#1E293B',
    marginBottom: '0.5rem',
  },
  patternRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    flexWrap: 'wrap' as const,
  },
  barLong: {
    width: '32px',
    height: '14px',
    background: '#1E293B',
    borderRadius: '3px',
  },
  barShort: {
    width: '14px',
    height: '14px',
    background: '#1E293B',
    borderRadius: '3px',
  },
  patternMath: {
    fontSize: '0.82rem',
    color: '#475569',
    marginLeft: '6px',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.95rem',
    marginBottom: '1.25rem',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  stepBadge: {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    borderRadius: '50%',
    background: '#1E6DE8',
    color: '#FFFFFF',
    fontSize: '0.78rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1px',
  },
  stepDesc: {
    fontSize: '0.87rem',
    lineHeight: 1.55,
    color: '#334155',
  },
  keteranganBox: {
    background: '#F0F6FE',
    border: '1px solid #D8E7FA',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    marginBottom: '1.25rem',
  },
  keteranganHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#0F172A',
    marginBottom: '2px',
  },
  keteranganText: {
    fontSize: '0.8rem',
    color: '#0284C7',
    fontWeight: 600,
    marginLeft: '24px',
  },
  ctaButton: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.65rem',
    background: 'linear-gradient(135deg, #1E6DE8 0%, #1557BF 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '0.85rem 1.5rem',
    fontSize: '0.98rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(30, 109, 232, 0.35)',
    transition: 'all 0.15s ease',
  },
};
