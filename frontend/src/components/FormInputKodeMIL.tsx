import React, { useState } from 'react';
import { validateKodeMIL } from '../utils/validateKodeMIL';

export interface FormInputKodeMILProps {
  merekNama?: string;
  hasSelectedModel: boolean;
  kodeList: string[];
  onChangeKodeList: (kodes: string[]) => void;
  onSubmitDiagnosis: () => void;
  isLoading?: boolean;
}

export const FormInputKodeMIL: React.FC<FormInputKodeMILProps> = ({
  merekNama,
  hasSelectedModel,
  kodeList,
  onChangeKodeList,
  onSubmitDiagnosis,
  isLoading = false,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningSubmit, setWarningSubmit] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setInputVal(val);
    setWarningSubmit(null);

    if (val === '') {
      setErrorMessage(null);
      return;
    }

    const validation = validateKodeMIL(val, merekNama);
    if (!validation.valid) {
      setErrorMessage(validation.pesan || 'Format kode MIL tidak valid.');
    } else {
      setErrorMessage(null);
    }
  };

  const handleAddKode = () => {
    if (!inputVal) {
      setErrorMessage('Silakan ketik kode MIL terlebih dahulu.');
      return;
    }

    const validation = validateKodeMIL(inputVal, merekNama);
    if (!validation.valid) {
      setErrorMessage(validation.pesan || 'Format kode MIL tidak valid.');
      return;
    }

    if (kodeList.includes(inputVal)) {
      setErrorMessage(`Kode MIL ${inputVal} sudah ditambahkan ke daftar.`);
      return;
    }

    onChangeKodeList([...kodeList, inputVal]);
    setInputVal('');
    setErrorMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKode();
    }
  };

  const handleRemoveKode = (target: string) => {
    onChangeKodeList(kodeList.filter((k) => k !== target));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSelectedModel) {
      setWarningSubmit('Merek dan model motor wajib dipilih terlebih dahulu sebelum diagnosa.');
      return;
    }
    if (kodeList.length === 0) {
      setWarningSubmit('Masukkan minimal satu kode kedipan MIL yang valid.');
      return;
    }
    setWarningSubmit(null);
    onSubmitDiagnosis();
  };

  const canDiagnose = hasSelectedModel && kodeList.length > 0 && !isLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label
          htmlFor="input-kode-mil"
          style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--slate-700)',
            marginBottom: '0.5rem',
          }}
        >
          3. Masukkan Kode Kedipan MIL <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '0.6rem' }}>
          Contoh: ketik <strong>7</strong> (Sensor EOT/ECT), <strong>12</strong> (Injektor), dsb. Tekan{' '}
          <strong>Tambah</strong> atau <strong>Enter</strong>.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id="input-kode-mil"
            data-testid="input-kode-mil"
            type="text"
            placeholder="Ketik angka kode MIL (1-99)..."
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${errorMessage ? 'var(--danger)' : 'var(--slate-300)'}`,
              fontSize: '0.95rem',
              outline: 'none',
              backgroundColor: '#fff',
            }}
          />
          <button
            type="button"
            data-testid="btn-tambah-kode"
            onClick={handleAddKode}
            disabled={!inputVal || !!errorMessage || isLoading}
            style={{
              padding: '0.75rem 1.4rem',
              backgroundColor: !inputVal || !!errorMessage || isLoading ? 'var(--slate-200)' : 'var(--accent)',
              color: !inputVal || !!errorMessage || isLoading ? 'var(--slate-400)' : '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: !inputVal || !!errorMessage || isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            + Tambah
          </button>
        </div>

        {errorMessage && (
          <p
            data-testid="error-kode-mil"
            style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: 500 }}
          >
            ⚠️ {errorMessage}
          </p>
        )}
      </div>

      {/* Daftar Kode MIL Terpilih (Kebutuhan 4.5) */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>
          Kode MIL yang akan dianalisis:
        </span>
        <div
          data-testid="daftar-kode-chips"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '0.5rem',
            minHeight: '44px',
            padding: '0.5rem',
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--slate-300)',
            alignItems: 'center',
          }}
        >
          {kodeList.length === 0 ? (
            <span style={{ color: 'var(--slate-400)', fontSize: '0.85rem', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
              Belum ada kode MIL yang ditambahkan
            </span>
          ) : (
            kodeList.map((k) => (
              <span
                key={k}
                data-testid={`chip-kode-${k}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: '1px solid var(--primary-border)',
                }}
              >
                Kode {k}
                <button
                  type="button"
                  data-testid={`btn-hapus-kode-${k}`}
                  onClick={() => handleRemoveKode(k)}
                  aria-label={`Hapus kode ${k}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1,
                    padding: '0 2px',
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {warningSubmit && (
        <div
          data-testid="warning-submit"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '0.88rem',
            fontWeight: 500,
          }}
        >
          {warningSubmit}
        </div>
      )}

      {/* Tombol Diagnosa (Kebutuhan 4.2) */}
      <button
        type="button"
        data-testid="btn-diagnosa"
        onClick={handleSubmit}
        disabled={!canDiagnose}
        style={{
          width: '100%',
          padding: '0.9rem',
          backgroundColor: canDiagnose ? 'var(--primary)' : 'var(--slate-300)',
          color: canDiagnose ? '#fff' : 'var(--slate-500)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: '1.05rem',
          fontWeight: 700,
          cursor: canDiagnose ? 'pointer' : 'not-allowed',
          boxShadow: canDiagnose ? 'var(--shadow-md)' : 'none',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
        }}
      >
        {isLoading ? (
          <>
            <span className="spinner" />
            <span>Memproses Inferensi...</span>
          </>
        ) : (
          <>
            <span>⚡ Jalankan Diagnosis Sekarang</span>
          </>
        )}
      </button>
    </div>
  );
};
