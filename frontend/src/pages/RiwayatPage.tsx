import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RiwayatItem {
  id: number;
  namaPengguna?: string;
  noTelepon?: string;
  createdAt: string;
  kodeMILInput: string[];
  hasilDiagnosis: any[];
  model: {
    id: number;
    nama: string;
    merek: {
      id: number;
      nama: string;
    };
  };
}

export default function RiwayatPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetch('/api/riwayat')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setList(data.data);
        }
      })
      .catch((err) => console.error('Gagal mengambil riwayat:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredList = list.filter((item) => {
    const query = search.toLowerCase();
    const modelStr = `${item.model?.merek?.nama || ''} ${item.model?.nama || ''}`.toLowerCase();
    const kodeStr = item.kodeMILInput?.join(' ') || '';
    const userStr = `${item.namaPengguna || ''} ${item.noTelepon || ''}`.toLowerCase();
    return modelStr.includes(query) || kodeStr.includes(query) || userStr.includes(query);
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Riwayat Diagnosis</h1>
          <p style={styles.subtitle}>Daftar riwayat konsultasi dan diagnosis kerusakan motor yang telah dilakukan.</p>
        </div>
        <button
          type="button"
          style={styles.btnPrimary}
          onClick={() => navigate('/diagnosis')}
        >
          🔍 Mulai Diagnosa Baru
        </button>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBarWrap}>
        <span style={{ fontSize: '1.1rem' }}>🔎</span>
        <input
          type="text"
          placeholder="Cari berdasarkan merek, model, atau kode MIL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} style={styles.clearBtn}>
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.emptyCard}>
          <div className="spinner-primary" style={{ margin: '0 auto 1rem' }} />
          <div>Memuat riwayat diagnosis...</div>
        </div>
      ) : filteredList.length === 0 ? (
        <div style={styles.emptyCard}>
          <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏱️</span>
          <h3 style={{ margin: '0 0 0.5rem', color: '#0F172A' }}>Belum Ada Riwayat Diagnosis</h3>
          <p style={{ margin: '0 0 1.25rem', color: '#64748B', fontSize: '0.9rem' }}>
            {search ? 'Tidak ada riwayat yang cocok dengan kata kunci pencarian.' : 'Mulai diagnosa pertama Anda untuk mendeteksi kerusakan sepeda motor secara akurat.'}
          </p>
          <button
            type="button"
            style={styles.btnPrimary}
            onClick={() => navigate('/diagnosis')}
          >
            Mulai Diagnosis Sekarang &rarr;
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredList.map((item) => {
            const tanggal = new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const hasilArray = Array.isArray(item.hasilDiagnosis) ? item.hasilDiagnosis : [];
            const primaryKerusakan = hasilArray[0]?.kerusakan?.nama || 'Kerusakan Teridentifikasi';

            return (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.brandBadge}>
                    {item.model?.merek?.nama === 'Honda' ? '🔴 Honda' : '🔵 Yamaha'}
                  </div>
                  <div style={styles.dateText}>{tanggal}</div>
                </div>

                <h3 style={styles.modelTitle}>
                  {item.model?.merek?.nama} {item.model?.nama}
                </h3>

                {item.namaPengguna && (
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: '#475569',
                      backgroundColor: '#F1F5F9',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.65rem',
                      width: 'fit-content',
                    }}
                  >
                    <span>👤 {item.namaPengguna}</span>
                    {item.noTelepon && <span style={{ color: '#94A3B8' }}>• 📱 {item.noTelepon}</span>}
                  </div>
                )}

                <div style={styles.kodeRow}>
                  <span style={styles.kodeLabel}>Kode MIL:</span>
                  {item.kodeMILInput?.map((k, i) => (
                    <span key={i} style={styles.kodePill}>
                      Kode {k}
                    </span>
                  ))}
                </div>

                <div style={styles.resultBox}>
                  <div style={styles.resultLabel}>Hasil Analisis:</div>
                  <div style={styles.resultVal}>{primaryKerusakan}</div>
                  {hasilArray.length > 1 && (
                    <div style={styles.resultMore}>+{hasilArray.length - 1} kerusakan lainnya</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    paddingBottom: '2.5rem',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  title: {
    fontSize: '1.65rem',
    fontWeight: 800,
    color: '#0F172A',
    margin: '0 0 0.35rem',
  },
  subtitle: {
    fontSize: '0.92rem',
    color: '#64748B',
    margin: 0,
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #1E6DE8 0%, #1557BF 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '0.75rem 1.6rem',
    fontSize: '0.92rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(30, 109, 232, 0.3)',
  },
  searchBarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '0.65rem 1rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: '#1E293B',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '1.25rem',
    border: '1px solid #E8EFF8',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.65rem',
  },
  brandBadge: {
    fontSize: '0.78rem',
    fontWeight: 700,
    background: '#F1F5F9',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
    color: '#334155',
  },
  dateText: {
    fontSize: '0.75rem',
    color: '#94A3B8',
  },
  modelTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 0.75rem',
  },
  kodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap' as const,
    marginBottom: '1rem',
  },
  kodeLabel: {
    fontSize: '0.8rem',
    color: '#64748B',
  },
  kodePill: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#1E6DE8',
    background: '#EBF3FE',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
  },
  resultBox: {
    background: '#F8FAFC',
    border: '1px solid #EDF2F7',
    borderRadius: '10px',
    padding: '0.75rem',
    marginTop: 'auto',
  },
  resultLabel: {
    fontSize: '0.72rem',
    color: '#64748B',
    textTransform: 'uppercase' as const,
    fontWeight: 700,
    letterSpacing: '0.04em',
    marginBottom: '2px',
  },
  resultVal: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#0F172A',
  },
  resultMore: {
    fontSize: '0.75rem',
    color: '#0284C7',
    marginTop: '4px',
  },
  emptyCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    border: '1px dashed #CBD5E1',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
};
