import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PilihMerekModel } from '../components/PilihMerekModel';
import { FormInputKodeMIL } from '../components/FormInputKodeMIL';
import { ForwardChainingLoader } from '../components/ForwardChainingLoader';
import { postDiagnosis } from '../api/client';

export const DiagnosisWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = location.state as { selectedMerekId?: number; selectedMerekNama?: string } | undefined;

  const [merekId, setMerekId] = useState<number | null>(preselected?.selectedMerekId ?? null);
  const [merekNama, setMerekNama] = useState<string>(preselected?.selectedMerekNama ?? (preselected?.selectedMerekId === 1 ? 'Honda' : preselected?.selectedMerekId === 2 ? 'Yamaha' : ''));
  const [modelId, setModelId] = useState<number | null>(null);
  const [modelNama, setModelNama] = useState<string>('');
  const [kodeList, setKodeList] = useState<string[]>([]);

  // Data Pengguna (Wajib)
  const [namaPengguna, setNamaPengguna] = useState<string>('');
  const [noTelepon, setNoTelepon] = useState<string>('');
  const [userErrors, setUserErrors] = useState<{ nama?: string; telepon?: string }>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (preselected?.selectedMerekId) {
      setMerekId(preselected.selectedMerekId);
      setMerekNama(preselected.selectedMerekNama || (preselected.selectedMerekId === 1 ? 'Honda' : 'Yamaha'));
      setModelId(null);
      setModelNama('');
    }
  }, [preselected?.selectedMerekId, preselected?.selectedMerekNama]);

  const handleSelectMerek = (id: number, nama: string) => {
    setMerekId(id);
    setMerekNama(nama);
    setModelId(null);
    setModelNama('');
    setApiError(null);
  };

  const handleSelectModel = (id: number, nama: string) => {
    setModelId(id);
    setModelNama(nama);
    setApiError(null);
  };

  const handleSubmitDiagnosis = async () => {
    // Validasi Wajib: Nama & No Telepon
    const errors: { nama?: string; telepon?: string } = {};
    if (!namaPengguna.trim()) {
      errors.nama = 'Nama lengkap pemilik wajib diisi.';
    }
    if (!noTelepon.trim()) {
      errors.telepon = 'Nomor telepon / WhatsApp wajib diisi.';
    } else if (!/^[0-9+\-\s()]{8,18}$/.test(noTelepon.trim())) {
      errors.telepon = 'Format nomor telepon tidak valid (contoh: 081234567890).';
    }

    if (Object.keys(errors).length > 0) {
      setUserErrors(errors);
      setApiError('Harap lengkapi Nama Pengguna dan Nomor Telepon pemilik motor sebelum diagnosa.');
      return;
    }

    if (!merekId || !modelId) {
      setApiError('Silakan pilih merek dan model sepeda motor terlebih dahulu.');
      return;
    }

    if (kodeList.length === 0) {
      setApiError('Silakan masukkan minimal satu kode kedipan MIL yang terbaca.');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const result = await postDiagnosis(
        merekId,
        modelId,
        kodeList,
        namaPengguna.trim(),
        noTelepon.trim()
      );
      // Pindah ke halaman hasil diagnosis dengan state
      navigate('/diagnosis/hasil', {
        state: {
          result,
          merekNama,
          modelNama,
          kodeMIL: kodeList,
          namaPengguna: namaPengguna.trim(),
          noTelepon: noTelepon.trim(),
        },
      });
    } catch (err: any) {
      setApiError(err.message || 'Terjadi kesalahan saat memproses diagnosis.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '780px',
        margin: '0 auto',
        paddingBottom: '2.5rem',
      }}
    >
      <div>
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#fff',
              border: '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--slate-700)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            ← Kembali ke Beranda
          </button>

          <button
            onClick={() => navigate('/panduan')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--accent-light)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--accent)',
              cursor: 'pointer',
            }}
          >
            📖 Panduan Kode MIL
          </button>
        </div>

        {/* Wizard Main Card */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--slate-200)',
            overflow: 'hidden',
          }}
        >
          {/* Card Top Title Banner */}
          <div
            style={{
              padding: '1.75rem 2rem',
              borderBottom: '1px solid var(--slate-100)',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              color: '#fff',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Form Diagnosis Interaktif
            </div>
            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Diagnosis Kerusakan Motor (MIL)
            </h1>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.92rem',
                marginTop: '0.35rem',
                lineHeight: 1.5,
              }}
            >
              Pilih identitas kendaraan Anda dan masukkan pola kedipan lampu MIL yang muncul pada panel speedometer.
            </p>
          </div>

          {/* Stepper Indicator (3 Langkah) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid var(--slate-200)',
              backgroundColor: 'var(--slate-50)',
            }}
          >
            {/* Step 1: Data Pengguna */}
            <div
              style={{
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                borderRight: '1px solid var(--slate-200)',
                color: namaPengguna.trim() && noTelepon.trim() ? 'var(--success)' : 'var(--primary)',
                fontWeight: 600,
                fontSize: '0.86rem',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: namaPengguna.trim() && noTelepon.trim() ? 'var(--success)' : 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {namaPengguna.trim() && noTelepon.trim() ? '✓' : '1'}
              </span>
              <span>Data Pengguna</span>
            </div>

            {/* Step 2: Identitas Motor */}
            <div
              style={{
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                borderRight: '1px solid var(--slate-200)',
                color: modelId ? 'var(--success)' : (namaPengguna.trim() && noTelepon.trim() ? 'var(--primary)' : 'var(--slate-400)'),
                fontWeight: 600,
                fontSize: '0.86rem',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: modelId ? 'var(--success)' : (namaPengguna.trim() && noTelepon.trim() ? 'var(--primary)' : 'var(--slate-300)'),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {modelId ? '✓' : '2'}
              </span>
              <span>Identitas Motor</span>
            </div>

            {/* Step 3: Kode Kedipan MIL */}
            <div
              style={{
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: kodeList.length > 0 ? 'var(--primary)' : 'var(--slate-400)',
                fontWeight: 600,
                fontSize: '0.86rem',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: kodeList.length > 0 ? 'var(--primary)' : 'var(--slate-300)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                3
              </span>
              <span>Kode MIL</span>
            </div>
          </div>

          {/* Form Body */}
          <div style={{ padding: '2rem' }}>
            {isLoading ? (
              <ForwardChainingLoader
                kodeMIL={kodeList}
                merekNama={merekNama}
                modelNama={modelNama}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Error Banner */}
                {apiError && (
                  <div
                    style={{
                      padding: '0.9rem 1.1rem',
                      backgroundColor: 'var(--danger-light)',
                      border: '1px solid var(--danger-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--danger)',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>⚠️</span>
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Form Identitas Pemilik Motor (Wajib) */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: userErrors.nama || userErrors.telepon ? '1.5px solid #EF4444' : '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: namaPengguna.trim() && noTelepon.trim() ? '#10B981' : '#1E6DE8',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                        }}
                      >
                        {namaPengguna.trim() && noTelepon.trim() ? '✓' : '1'}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                        Identitas Pemilik Kendaraan <span style={{ color: '#EF4444' }}>*</span>
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#DC2626',
                        backgroundColor: '#FEF2F2',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        border: '1px solid #FCA5A5',
                      }}
                    >
                      Wajib Diisi
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>
                    Wajib melampirkan nama dan nomor telepon aktif pengguna/pemilik untuk pencatatan rekam servis dan lembar hasil diagnosis motor Anda.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <label
                        htmlFor="input-nama-pengguna"
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Nama Lengkap Pemilik <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1rem',
                            color: '#94A3B8',
                          }}
                        >
                          👤
                        </span>
                        <input
                          id="input-nama-pengguna"
                          data-testid="input-nama-pengguna"
                          type="text"
                          placeholder="Contoh: Budi Santoso"
                          value={namaPengguna}
                          onChange={(e) => {
                            setNamaPengguna(e.target.value);
                            if (userErrors.nama) setUserErrors((prev) => ({ ...prev, nama: undefined }));
                          }}
                          disabled={isLoading}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.8rem 0.65rem 2.4rem',
                            borderRadius: '10px',
                            border: userErrors.nama ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                            fontSize: '0.9rem',
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      {userErrors.nama && (
                        <span style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '0.25rem', display: 'block' }}>
                          {userErrors.nama}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="input-no-telepon"
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Nomor Telepon / WhatsApp <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1rem',
                            color: '#94A3B8',
                          }}
                        >
                          📱
                        </span>
                        <input
                          id="input-no-telepon"
                          data-testid="input-no-telepon"
                          type="tel"
                          placeholder="Contoh: 081234567890"
                          value={noTelepon}
                          onChange={(e) => {
                            setNoTelepon(e.target.value);
                            if (userErrors.telepon) setUserErrors((prev) => ({ ...prev, telepon: undefined }));
                          }}
                          disabled={isLoading}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.8rem 0.65rem 2.4rem',
                            borderRadius: '10px',
                            border: userErrors.telepon ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                            fontSize: '0.9rem',
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      {userErrors.telepon && (
                        <span style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '0.25rem', display: 'block' }}>
                          {userErrors.telepon}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--slate-200)' }} />

                {/* Step 2: Pilih Merek & Model */}
                <PilihMerekModel
                  selectedMerekId={merekId}
                  selectedModelId={modelId}
                  onSelectMerek={handleSelectMerek}
                  onSelectModel={handleSelectModel}
                  disabled={isLoading}
                />

                <div style={{ height: '1px', backgroundColor: 'var(--slate-200)' }} />

                {/* Step 3: Input Kode Kedipan MIL */}
                <FormInputKodeMIL
                  merekNama={merekNama}
                  hasSelectedModel={!!modelId}
                  kodeList={kodeList}
                  onChangeKodeList={setKodeList}
                  onSubmitDiagnosis={handleSubmitDiagnosis}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisWizard;
