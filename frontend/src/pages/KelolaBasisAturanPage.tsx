import React, { useEffect, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import {
  adminGetBasisAturan,
  adminPostBasisAturan,
  adminPutBasisAturan,
  adminDeleteBasisAturan,
  adminGetKodeMIL,
  adminGetGejala,
  adminGetKerusakan,
} from '../api/client';

export const KelolaBasisAturanPage: React.FC = () => {
  const token = localStorage.getItem('admin_token') || '';

  const [aturanList, setAturanList] = useState<any[]>([]);
  const [kodeList, setKodeList] = useState<any[]>([]);
  const [gejalaList, setGejalaList] = useState<any[]>([]);
  const [kerusakanList, setKerusakanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Form states
  const [kodeMILId, setKodeMILId] = useState<number | ''>('');
  const [gejalaid, setGejalaid] = useState<number | ''>('');
  const [kerusakanId, setKerusakanId] = useState<number | ''>('');
  const [bobot, setBobot] = useState<number>(1.0);
  const [aktif, setAktif] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const [aRes, kRes, gRes, kerRes] = await Promise.all([
        adminGetBasisAturan(token),
        adminGetKodeMIL(token),
        adminGetGejala(token),
        adminGetKerusakan(token),
      ]);
      setAturanList(aRes);
      setKodeList(kRes);
      setGejalaList(gRes);
      setKerusakanList(kerRes);
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal memuat basis aturan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const openAddModal = () => {
    setEditItem(null);
    setKodeMILId(kodeList[0]?.id || '');
    setGejalaid(gejalaList[0]?.id || '');
    setKerusakanId(kerusakanList[0]?.id || '');
    setBobot(1.0);
    setAktif(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditItem(item);
    setKodeMILId(item.kodeMILId || item.kodeMIL?.id || '');
    setGejalaid(item.gejalaid || item.gejala?.id || '');
    setKerusakanId(item.kerusakanId || item.kerusakan?.id || '');
    setBobot(item.bobot ?? 1.0);
    setAktif(item.aktif ?? true);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (!kodeMILId || !gejalaid || !kerusakanId) {
        throw new Error('Kode MIL, gejala, dan kerusakan wajib dipilih.');
      }

      const payload = {
        kodeMILId: Number(kodeMILId),
        gejalaid: Number(gejalaid),
        kerusakanId: Number(kerusakanId),
        bobot: Number(bobot),
        aktif,
      };

      if (editItem) {
        await adminPutBasisAturan(token, editItem.id, payload);
        setSuccessBanner('Aturan berhasil diperbarui.');
      } else {
        await adminPostBasisAturan(token, payload);
        setSuccessBanner('Aturan baru berhasil ditambahkan.');
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan aturan.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Yakin ingin menghapus Aturan #${item.id}?`)) return;
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      await adminDeleteBasisAturan(token, item.id);
      setSuccessBanner(`Aturan #${item.id} berhasil dihapus.`);
      fetchData();
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal menghapus aturan.');
    }
  };

  const toggleAktif = async (item: any) => {
    try {
      await adminPutBasisAturan(token, item.id, {
        kodeMILId: item.kodeMILId,
        gejalaid: item.gejalaid,
        kerusakanId: item.kerusakanId,
        bobot: item.bobot,
        aktif: !item.aktif,
      });
      fetchData();
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal mengubah status aturan.');
    }
  };

  const columns: Column<any>[] = [
    { key: 'id', title: 'ID', width: '70px' },
    {
      key: 'aturanIF',
      title: 'Premis (JIKA Kode MIL & Gejala)',
      render: (r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span
              style={{
                padding: '0.2rem 0.55rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              MIL {r.kodeMIL?.kode} ({r.kodeMIL?.merek?.nama || 'Semua'})
            </span>
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--slate-600)' }}>
            Gejala: {r.gejala?.nama || '-'}
          </div>
        </div>
      ),
    },
    {
      key: 'aturanTHEN',
      title: 'Konklusi (MAKA Kerusakan)',
      render: (r) => (
        <div>
          <strong style={{ color: 'var(--slate-900)' }}>{r.kerusakan?.nama || '-'}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
            Bobot Keyakinan: {r.bobot ?? 1.0}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status Aturan',
      width: '120px',
      render: (r) => (
        <button
          onClick={() => toggleAktif(r)}
          style={{
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            backgroundColor: r.aktif ? 'var(--success-light)' : 'var(--slate-200)',
            color: r.aktif ? 'var(--success)' : 'var(--slate-600)',
          }}
        >
          {r.aktif ? '● Aktif' : '○ Nonaktif'}
        </button>
      ),
    },
    {
      key: 'aksi',
      title: 'Aksi',
      width: '150px',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => openEditModal(r)}
            style={{
              padding: '0.3rem 0.65rem',
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-700)',
              border: '1px solid var(--slate-300)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(r)}
            style={{
              padding: '0.3rem 0.65rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
          Kelola Basis Aturan (Forward Chaining)
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Definisikan aturan pakar IF-THEN yang menghubungkan pola kedipan MIL dan gejala ke kesimpulan kerusakan.
        </p>
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

      {successBanner && (
        <div
          style={{
            padding: '0.8rem 1.2rem',
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)',
            fontSize: '0.88rem',
          }}
        >
          ✓ {successBanner}
        </div>
      )}

      <DataTable
        title="Daftar Basis Aturan Inferensi"
        subtitle="Aturan IF-THEN aktif pada mesin inferensi"
        columns={columns}
        data={aturanList}
        loading={loading}
        onAdd={openAddModal}
        addLabel="+ Tambah Aturan Baru"
      />

      {/* Modal Add/Edit Rule */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--slate-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                {editItem ? `Edit Aturan #${editItem.id}` : 'Tambah Aturan Inferensi Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--slate-400)',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                  }}
                >
                  ⚠️ {formError}
                </div>
              )}

              {/* Premis: Kode MIL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                  JIKA Kode Kedipan MIL <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  required
                  value={kodeMILId}
                  onChange={(e) => setKodeMILId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--slate-300)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">-- Pilih Kode MIL --</option>
                  {kodeList.map((k) => (
                    <option key={k.id} value={k.id}>
                      MIL {k.kode} — {k.deskripsi} ({k.merek?.nama || 'Merek'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Premis: Gejala */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                  DAN Gejala Terkait <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  required
                  value={gejalaid}
                  onChange={(e) => setGejalaid(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--slate-300)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">-- Pilih Gejala --</option>
                  {gejalaList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Konklusi: Kerusakan */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                  MAKA Kesimpulan Kerusakan <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  required
                  value={kerusakanId}
                  onChange={(e) => setKerusakanId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--slate-300)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">-- Pilih Kerusakan --</option>
                  {kerusakanList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bobot & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                    Bobot Keyakinan (0.1 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1.0"
                    value={bobot}
                    onChange={(e) => setBobot(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--slate-300)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                    Status Aturan
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={aktif}
                      onChange={(e) => setAktif(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: aktif ? 'var(--success)' : 'var(--slate-500)' }}>
                      {aktif ? 'Aturan Aktif' : 'Aturan Nonaktif'}
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    backgroundColor: 'var(--slate-100)',
                    color: 'var(--slate-700)',
                    border: '1px solid var(--slate-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '0.6rem 1.4rem',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Aturan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaBasisAturanPage;
