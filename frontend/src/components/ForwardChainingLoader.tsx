import React from 'react';

export interface ForwardChainingLoaderProps {
  kodeMIL?: string[];
  merekNama?: string;
  modelNama?: string;
}

export const ForwardChainingLoader: React.FC<ForwardChainingLoaderProps> = ({
  kodeMIL = [],
  merekNama,
  modelNama,
}) => {
  return (
    <div
      data-testid="forward-chaining-loader"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        textAlign: 'center',
        backgroundColor: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--slate-200)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '72px',
          height: '72px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '4px solid var(--primary-light)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '4px solid transparent',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.9s cubic-bezier(0.55, 0.25, 0.25, 0.7) infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '12px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
          }}
        >
          ⚙️
        </div>
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--slate-800)',
          marginBottom: '0.5rem',
        }}
      >
        Menganalisis Kode MIL...
      </h3>

      <p
        style={{
          color: 'var(--slate-500)',
          fontSize: '0.92rem',
          maxWidth: '420px',
          lineHeight: 1.5,
          marginBottom: '1.25rem',
        }}
      >
        Mesin inferensi <strong>Forward Chaining</strong> sedang mencocokkan fakta kode MIL dengan basis
        aturan untuk mendiagnosis komponen dan kerusakan.
      </p>

      {/* Context badge */}
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          backgroundColor: 'var(--slate-50)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--slate-200)',
          fontSize: '0.84rem',
          color: 'var(--slate-600)',
        }}
      >
        {merekNama && <span>🏍️ {merekNama} {modelNama ? `• ${modelNama}` : ''}</span>}
        {kodeMIL.length > 0 && (
          <span>| Fakta: <strong>{kodeMIL.join(', ')}</strong></span>
        )}
      </div>
    </div>
  );
};
