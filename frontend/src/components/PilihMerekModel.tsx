import React, { useEffect, useState } from 'react';
import { getMerek, getModelByMerek, Merek, ModelMotor } from '../api/client';

export interface PilihMerekModelProps {
  selectedMerekId: number | null;
  selectedModelId: number | null;
  onSelectMerek: (merekId: number, merekNama: string) => void;
  onSelectModel: (modelId: number, modelNama: string) => void;
  disabled?: boolean;
}

export const PilihMerekModel: React.FC<PilihMerekModelProps> = ({
  selectedMerekId,
  selectedModelId,
  onSelectMerek,
  onSelectModel,
  disabled = false,
}) => {
  const [merekList, setMerekList] = useState<Merek[]>([]);
  const [modelList, setModelList] = useState<ModelMotor[]>([]);
  const [loadingMerek, setLoadingMerek] = useState<boolean>(true);
  const [loadingModel, setLoadingModel] = useState<boolean>(false);
  const [errorMerek, setErrorMerek] = useState<string | null>(null);
  const [errorModel, setErrorModel] = useState<string | null>(null);

  // Ambil daftar merek saat komponen dimuat
  useEffect(() => {
    let isMounted = true;
    setLoadingMerek(true);
    setErrorMerek(null);

    getMerek()
      .then((data) => {
        if (isMounted) {
          setMerekList(data || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMerek(err.message || 'Gagal memuat daftar merek.');
        }
      })
      .finally(() => {
        if (isMounted) setLoadingMerek(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Ambil daftar model ketika selectedMerekId berubah
  useEffect(() => {
    if (!selectedMerekId) {
      setModelList([]);
      return;
    }

    let isMounted = true;
    setLoadingModel(true);
    setErrorModel(null);

    getModelByMerek(selectedMerekId)
      .then((res) => {
        if (isMounted) {
          setModelList(res.data || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorModel(err.message || 'Gagal memuat daftar model motor.');
        }
      })
      .finally(() => {
        if (isMounted) setLoadingModel(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMerekId]);

  const handleMerekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const found = merekList.find((m) => m.id === val);
    if (found) {
      onSelectMerek(found.id, found.nama);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const found = modelList.find((m) => m.id === val);
    if (found) {
      onSelectModel(found.id, found.nama);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Pilih Merek */}
      <div>
        <label
          htmlFor="select-merek"
          style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--slate-700)',
            marginBottom: '0.5rem',
          }}
        >
          1. Pilih Merek Motor <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        {/* Visual Brand Cards */}
        {merekList.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {merekList.map((m) => {
              const isSelected = selectedMerekId === m.id;
              const isHonda = m.nama.toLowerCase().includes('honda');
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMerek(m.id, m.nama)}
                  disabled={disabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '14px',
                    border: isSelected
                      ? `2px solid ${isHonda ? '#DC2626' : '#1E6DE8'}`
                      : '1.5px solid #E2E8F0',
                    background: isSelected
                      ? (isHonda ? '#FEF2F2' : '#EFF6FF')
                      : '#FFFFFF',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected
                      ? `0 6px 16px ${isHonda ? 'rgba(220, 38, 38, 0.15)' : 'rgba(30, 109, 232, 0.15)'}`
                      : '0 2px 4px rgba(0,0,0,0.02)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{isHonda ? '🏍️' : '🛵'}</span>
                    <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.98rem' }}>
                      Motor {m.nama}
                    </span>
                  </div>
                  {isSelected ? (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isHonda ? '#DC2626' : '#1E6DE8',
                        background: '#FFFFFF',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      }}
                    >
                      Terpilih ✓
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Pilih &rarr;</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <select
          id="select-merek"
          data-testid="select-merek"
          value={selectedMerekId ?? ''}
          onChange={handleMerekChange}
          disabled={disabled || loadingMerek}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--slate-300)',
            backgroundColor: disabled || loadingMerek ? 'var(--slate-100)' : '#fff',
            fontSize: '0.95rem',
            color: 'var(--slate-800)',
            outline: 'none',
            cursor: disabled || loadingMerek ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <option value="">
            {loadingMerek ? 'Memuat daftar merek...' : '-- Pilih Merek (Honda / Yamaha) --'}
          </option>
          {merekList.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nama}
            </option>
          ))}
        </select>
        {errorMerek && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            {errorMerek}
          </p>
        )}
      </div>

      {/* Pilih Model */}
      <div>
        <label
          htmlFor="select-model"
          style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--slate-700)',
            marginBottom: '0.5rem',
          }}
        >
          2. Pilih Model Sepeda Motor <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <select
          id="select-model"
          data-testid="select-model"
          value={selectedModelId ?? ''}
          onChange={handleModelChange}
          disabled={disabled || !selectedMerekId || loadingModel}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--slate-300)',
            backgroundColor:
              disabled || !selectedMerekId || loadingModel ? 'var(--slate-100)' : '#fff',
            fontSize: '0.95rem',
            color: 'var(--slate-800)',
            outline: 'none',
            cursor: disabled || !selectedMerekId || loadingModel ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <option value="">
            {!selectedMerekId
              ? '-- Pilih Merek Terlebih Dahulu --'
              : loadingModel
              ? 'Memuat model motor...'
              : '-- Pilih Model Sepeda Motor --'}
          </option>
          {modelList.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.nama}
            </option>
          ))}
        </select>

        {/* Pesan jika merek tidak memiliki model terdaftar (Kebutuhan 3.4) */}
        {selectedMerekId && !loadingModel && modelList.length === 0 && !errorModel && (
          <div
            data-testid="pesan-model-kosong"
            style={{
              marginTop: '0.5rem',
              padding: '0.65rem 0.9rem',
              backgroundColor: 'var(--warning-light)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--warning)',
              fontSize: '0.85rem',
            }}
          >
            ⚠️ Belum ada data model sepeda motor yang terdaftar untuk merek ini.
          </div>
        )}

        {errorModel && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            {errorModel}
          </p>
        )}
      </div>
    </div>
  );
};
