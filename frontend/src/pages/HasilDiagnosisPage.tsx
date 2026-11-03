import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DiagnosisResult } from '../api/client';

export interface HasilDiagnosisLocationState {
  result: DiagnosisResult;
  merekNama: string;
  modelNama: string;
  kodeMIL: string[];
  namaPengguna?: string;
  noTelepon?: string;
}

export const HasilDiagnosisPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as HasilDiagnosisLocationState | undefined;

  if (!state || !state.result) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            backgroundColor: '#fff',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Data Diagnosis Tidak Ditemukan
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Sesi diagnosis Anda kosong atau telah berakhir. Silakan lakukan diagnosis baru.
          </p>
          <button
            onClick={() => navigate('/diagnosis')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Kembali ke Form Diagnosis
          </button>
        </div>
      </div>
    );
  }

  const { result, merekNama, modelNama, kodeMIL, namaPengguna, noTelepon } = state;
  const { ditemukan, pesan, hasil } = result;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        maxWidth: '920px',
        margin: '0 auto',
        paddingBottom: '2.5rem',
      }}
    >
      <div>
        {/* Navigation & Actions Top Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => navigate('/diagnosis')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#fff',
              border: '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1.2rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--slate-700)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            ← Diagnosis Baru
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#fff',
                border: '1px solid var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--slate-700)',
                cursor: 'pointer',
              }}
            >
              Beranda
            </button>
            <button
              data-testid="btn-cetak-hasil"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1.3rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              🖨️ Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* Header Lembar Diagnosis */}
        <div
          className="card-print"
          style={{
            backgroundColor: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--slate-200)',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid var(--slate-100)',
              paddingBottom: '1.25rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  marginBottom: '0.25rem',
                }}
              >
                <span>🔧 FARHAN MOTOR</span>
              </div>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--slate-900)',
                  margin: 0,
                }}
              >
                Hasil Diagnosis Sistem Pakar MIL
              </h1>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.86rem', marginTop: '0.2rem' }}>
                Metode Inferensi: Forward Chaining • Waktu: {new Date().toLocaleString('id-ID')}
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-200)',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                Status Analisis
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: ditemukan ? 'var(--success)' : 'var(--warning)',
                  marginTop: '0.1rem',
                }}
              >
                {ditemukan ? '✓ Kerusakan Teridentifikasi' : '⚠️ Tidak Ada Kecocokan'}
              </div>
            </div>
          </div>

          {/* Ringkasan Kendaraan & Pemilik */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              backgroundColor: 'var(--slate-50)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
            }}
          >
            {namaPengguna && (
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Pemilik Kendaraan
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E40AF', marginTop: '0.1rem' }}>
                  👤 {namaPengguna}
                </div>
              </div>
            )}

            {noTelepon && (
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Nomor Telepon / WhatsApp
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.1rem' }}>
                  📱 {noTelepon}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Merek Sepeda Motor
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.1rem' }}>
                {merekNama}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Model Sepeda Motor
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.1rem' }}>
                {modelNama}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Kode Kedipan MIL Input
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                {kodeMIL.map((k) => (
                  <span
                    key={k}
                    style={{
                      padding: '0.15rem 0.55rem',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                    }}
                  >
                    Kode {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kasus jika TIDAK ADA kecocokan aturan (Kebutuhan 5.5) */}
        {!ditemukan && (
          <div
            className="card-print"
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 2rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--warning-border)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--slate-800)',
                marginBottom: '0.5rem',
              }}
            >
              Kode Kedipan MIL Tidak Dikenali
            </h3>
            <p
              style={{
                color: 'var(--slate-600)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                maxWidth: '560px',
                margin: '0 auto 1.5rem',
              }}
            >
              {pesan ||
                'Tidak ada aturan pada sistem yang cocok dengan kode MIL yang Anda masukkan untuk model sepeda motor ini. Disarankan untuk segera berkonsultasi langsung dengan mekanik/teknisi resmi Farhan Motor.'}
            </p>
            <div
              style={{
                display: 'inline-flex',
                gap: '1rem',
              }}
            >
              <button
                onClick={() => navigate('/panduan')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--slate-100)',
                  color: 'var(--slate-700)',
                  border: '1px solid var(--slate-300)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📖 Cek Panduan Kedipan
              </button>
              <button
                onClick={() => navigate('/diagnosis')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔍 Coba Input Ulang
              </button>
            </div>
          </div>
        )}

        {/* Kasus DITEMUKAN: Daftar Hasil Kerusakan (Kebutuhan 6.1, 6.2, 6.3) */}
        {ditemukan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {hasil.map((item, idx) => (
              <div
                key={item.kerusakan.id || idx}
                data-testid={`hasil-kerusakan-${item.kerusakan.id}`}
                className="card-print"
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--slate-200)',
                  borderLeft: '5px solid var(--primary)',
                }}
              >
                {/* Header Kerusakan */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        Prioritas #{idx + 1}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                        Pemicu: {item.kodesMILPemicu?.join(', ') || 'Kode Terkait'}
                      </span>
                    </div>
                    <h2
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: 'var(--slate-900)',
                        margin: 0,
                      }}
                    >
                      {item.kerusakan.nama}
                    </h2>
                  </div>

                  {/* Indikator Relevansi (Kebutuhan 6.2) */}
                  <div
                    style={{
                      padding: '0.4rem 0.85rem',
                      backgroundColor: 'var(--success-light)',
                      border: '1px solid var(--success-border)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--success)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                    }}
                  >
                    ✓ Sangat Relevan ({item.kodesMILPemicu?.length || 1} Kode Cocok)
                  </div>
                </div>

                {/* Deskripsi Kerusakan */}
                {item.kerusakan.deskripsi && (
                  <p
                    style={{
                      color: 'var(--slate-600)',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      marginBottom: '1.25rem',
                      backgroundColor: 'var(--slate-50)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '3px solid var(--slate-300)',
                    }}
                  >
                    {item.kerusakan.deskripsi}
                  </p>
                )}

                {/* Gejala Terkait */}
                {item.gejala && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: 'var(--slate-700)',
                        marginBottom: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>🔍 Gejala yang Terdeteksi:</span>
                    </div>
                    <div
                      style={{
                        padding: '0.6rem 0.9rem',
                        backgroundColor: '#fff',
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        color: 'var(--slate-800)',
                      }}
                    >
                      {item.gejala.nama}
                    </div>
                  </div>
                )}

                {/* Komponen yang Bermasalah */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--slate-700)',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>⚙️ Komponen Fisik yang Terkait:</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {item.komponen && item.komponen.length > 0 ? (
                      item.komponen.map((komp) => (
                        <div
                          key={komp.id}
                          style={{
                            padding: '0.5rem 0.85rem',
                            backgroundColor: 'var(--slate-50)',
                            border: '1px solid var(--slate-300)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.88rem',
                          }}
                        >
                          <strong style={{ color: 'var(--slate-900)' }}>{komp.nama}</strong>
                          {komp.deskripsi && (
                            <span style={{ color: 'var(--slate-500)', marginLeft: '0.35rem' }}>
                              ({komp.deskripsi})
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span style={{ color: 'var(--slate-500)', fontSize: '0.88rem' }}>
                        Sensor/Modul Injeksi Terkait
                      </span>
                    )}
                  </div>
                </div>

                {/* Langkah Solusi Perbaikan */}
                <div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--slate-700)',
                      marginBottom: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>🛠️ Rekomendasi Langkah Perbaikan:</span>
                  </div>
                  {item.solusi && item.solusi.length > 0 ? (
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      {item.solusi.map((sol, sIdx) => (
                        <li
                          key={sol.id || sIdx}
                          style={{
                            fontSize: '0.92rem',
                            color: 'var(--slate-800)',
                            lineHeight: 1.5,
                          }}
                        >
                          {sol.langkah}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', margin: 0 }}>
                      Lakukan pemeriksaan soket kabel, tegangan sensor dengan multimeter, dan bersihkan konektor ECU.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Bottom Actions */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <button
                onClick={() => navigate('/diagnosis')}
                style={{
                  padding: '0.85rem 2rem',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                🔄 Mulai Diagnosis Baru
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HasilDiagnosisPage;
