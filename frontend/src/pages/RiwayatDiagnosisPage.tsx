import React, { useEffect, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import { adminGetRiwayat, adminCetakLaporan, adminGetMerek, adminGetModel } from '../api/client';

export const RiwayatDiagnosisPage: React.FC = () => {
  const token = localStorage.getItem('admin_token') || '';

  const [riwayatList, setRiwayatList] = useState<any[]>([]);
  const [merekList, setMerekList] = useState<any[]>([]);
  const [modelList, setModelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Filters
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [merekId, setMerekId] = useState<number | ''>('');
  const [modelId, setModelId] = useState<number | ''>('');

  // Selected for PDF
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [cetakLoading, setCetakLoading] = useState(false);

  const fetchFilters = async () => {
    try {
      const [mRes, modRes] = await Promise.all([adminGetMerek(token), adminGetModel(token)]);
      setMerekList(mRes);
      setModelList(modRes);
    } catch {
      // ignore filter error
    }
  };

  const fetchRiwayat = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await adminGetRiwayat(token, {
        tanggalMulai: tanggalMulai || undefined,
        tanggalAkhir: tanggalAkhir || undefined,
        merekId: merekId ? Number(merekId) : undefined,
        modelId: modelId ? Number(modelId) : undefined,
      });
      setRiwayatList(res.data || []);
      // Reset selections if list changes
      setSelectedIds([]);
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal memuat riwayat diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, [token]);

  useEffect(() => {
    fetchRiwayat();
  }, [tanggalMulai, tanggalAkhir, merekId, modelId, token]);

  const toggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === riwayatList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(riwayatList.map((r) => r.id));
    }
  };

  const handleCetakPDF = async () => {
    if (selectedIds.length === 0) {
      alert('Pilih minimal satu data riwayat diagnosis untuk dicetak ke PDF.');
      return;
    }

    setCetakLoading(true);
    try {
      const blob = await adminCetakLaporan(token, selectedIds);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-diagnosis-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Gagal mencetak laporan PDF: ${err.message}`);
    } finally {
      setCetakLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'select',
      title: 'Pilih',
      width: '60px',
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(r.id)}
          onChange={() => toggleSelectRow(r.id)}
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
      ),
    },
    { key: 'id', title: 'ID', width: '70px' },
    {
      key: 'tanggal',
      title: 'Waktu Sesi',
      width: '160px',
      render: (r) => new Date(r.createdAt).toLocaleString('id-ID'),
    },
    {
      key: 'pengguna',
      title: 'Pemilik Kendaraan',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.88rem' }}>
            👤 {r.namaPengguna || <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontWeight: 400 }}>Tanpa Nama</span>}
          </div>
          {r.noTelepon && (
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
              📱 {r.noTelepon}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'kendaraan',
      title: 'Sepeda Motor',
      render: (r) => (
        <div>
          <strong style={{ color: 'var(--slate-900)' }}>
            {r.model?.merek?.nama || '-'} {r.model?.nama || '-'}
          </strong>
        </div>
      ),
    },
    {
      key: 'kodeMILInput',
      title: 'Kode MIL Input',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {Array.isArray(r.kodeMILInput) &&
            r.kodeMILInput.map((k: string) => (
              <span
                key={k}
                style={{
                  padding: '0.15rem 0.5rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                Kode {k}
              </span>
            ))}
        </div>
      ),
    },
    {
      key: 'hasil',
      title: 'Kesimpulan Kerusakan',
      render: (r) => {
        const hasil = Array.isArray(r.hasilDiagnosis) ? r.hasilDiagnosis : [];
        if (hasil.length === 0) {
          return <span style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>Tidak ditemukan kecocokan</span>;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {hasil.map((h: any, i: number) => (
              <span key={i} style={{ fontSize: '0.85rem', color: 'var(--slate-800)' }}>
                • <strong>{h.kerusakan?.nama || h.namaKerusakan || 'Kerusakan'}</strong>
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  const filteredModels = merekId
    ? modelList.filter((m) => m.merekId === Number(merekId) || m.merek?.id === Number(merekId))
    : modelList;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
            Riwayat Diagnosis & Cetak Laporan
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Audit catatan inferensi diagnosis dan ekspor dokumen laporan rekapitulasi ke format PDF.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={toggleSelectAll}
            style={{
              padding: '0.6rem 1rem',
              backgroundColor: '#fff',
              border: '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {selectedIds.length === riwayatList.length && riwayatList.length > 0
              ? 'Batal Pilih Semua'
              : 'Pilih Semua'}
          </button>
          <button
            data-testid="btn-cetak-laporan"
            onClick={handleCetakPDF}
            disabled={selectedIds.length === 0 || cetakLoading}
            style={{
              padding: '0.6rem 1.4rem',
              backgroundColor: selectedIds.length === 0 || cetakLoading ? 'var(--slate-200)' : 'var(--primary)',
              color: selectedIds.length === 0 || cetakLoading ? 'var(--slate-400)' : '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: selectedIds.length === 0 || cetakLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: selectedIds.length > 0 ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {cetakLoading ? 'Mengunduh...' : `🖨️ Cetak PDF (${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--slate-200)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '0.35rem' }}>
            Dari Tanggal
          </label>
          <input
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-300)',
              fontSize: '0.88rem',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '0.35rem' }}>
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={tanggalAkhir}
            onChange={(e) => setTanggalAkhir(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-300)',
              fontSize: '0.88rem',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '0.35rem' }}>
            Filter Merek
          </label>
          <select
            value={merekId}
            onChange={(e) => {
              setMerekId(e.target.value ? Number(e.target.value) : '');
              setModelId('');
            }}
            style={{
              width: '100%',
              padding: '0.55rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-300)',
              fontSize: '0.88rem',
            }}
          >
            <option value="">Semua Merek</option>
            {merekList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '0.35rem' }}>
            Filter Model
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value ? Number(e.target.value) : '')}
            style={{
              width: '100%',
              padding: '0.55rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-300)',
              fontSize: '0.88rem',
            }}
          >
            <option value="">Semua Model</option>
            {filteredModels.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              setTanggalMulai('');
              setTanggalAkhir('');
              setMerekId('');
              setModelId('');
            }}
            style={{
              width: '100%',
              padding: '0.55rem',
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-600)',
              border: '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset Filter
          </button>
        </div>
      </div>

      {errorBanner && (
        <div
          style={{
            padding: '0.8rem 1.2rem',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '0.88rem',
          }}
        >
          ⚠️ {errorBanner}
        </div>
      )}

      {/* Table */}
      <DataTable
        title="Daftar Log Riwayat Diagnosis"
        subtitle="Riwayat hasil pencocokan aturan forward chaining"
        columns={columns}
        data={riwayatList}
        loading={loading}
      />
    </div>
  );
};

export default RiwayatDiagnosisPage;
