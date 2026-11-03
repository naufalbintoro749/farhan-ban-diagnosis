import React, { useEffect, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import {
  adminGetKodeMIL,
  adminPostKodeMIL,
  adminPutKodeMIL,
  adminDeleteKodeMIL,
  adminGetGejala,
  adminPostGejala,
  adminPutGejala,
  adminDeleteGejala,
  adminGetKerusakan,
  adminPostKerusakan,
  adminPutKerusakan,
  adminDeleteKerusakan,
  adminGetKomponen,
  adminPostKomponen,
  adminPutKomponen,
  adminDeleteKomponen,
  adminGetSolusi,
  adminPostSolusi,
  adminPutSolusi,
  adminDeleteSolusi,
  adminGetMerek,
} from '../api/client';

export const KelolaDataTeknisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kode-mil' | 'gejala' | 'kerusakan' | 'komponen' | 'solusi'>('kode-mil');
  const token = localStorage.getItem('admin_token') || '';

  // Data states
  const [dataList, setDataList] = useState<any[]>([]);
  const [merekList, setMerekList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kode, setKode] = useState('');
  const [merekId, setMerekId] = useState<number | ''>('');
  const [urutan, setUrutan] = useState<number>(1);
  const [langkah, setLangkah] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      if (activeTab === 'kode-mil') {
        const [kRes, mRes] = await Promise.all([adminGetKodeMIL(token), adminGetMerek(token)]);
        setDataList(kRes);
        setMerekList(mRes);
      } else if (activeTab === 'gejala') {
        const res = await adminGetGejala(token);
        setDataList(res);
      } else if (activeTab === 'kerusakan') {
        const res = await adminGetKerusakan(token);
        setDataList(res);
      } else if (activeTab === 'komponen') {
        const res = await adminGetKomponen(token);
        setDataList(res);
      } else if (activeTab === 'solusi') {
        const res = await adminGetSolusi(token);
        setDataList(res);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal mengambil data teknis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, token]);

  const openAddModal = () => {
    setEditItem(null);
    setNama('');
    setDeskripsi('');
    setKode('');
    setMerekId(merekList[0]?.id || '');
    setUrutan(1);
    setLangkah('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditItem(item);
    setNama(item.nama || '');
    setDeskripsi(item.deskripsi || '');
    setKode(item.kode || '');
    setMerekId(item.merekId || item.merek?.id || '');
    setUrutan(item.urutan || 1);
    setLangkah(item.langkah || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (activeTab === 'kode-mil') {
        if (!kode.trim() || !deskripsi.trim() || !merekId) {
          throw new Error('Kode, deskripsi, dan merek wajib diisi.');
        }
        const payload = { kode: kode.trim(), deskripsi: deskripsi.trim(), merekId: Number(merekId) };
        if (editItem) {
          await adminPutKodeMIL(token, editItem.id, payload);
        } else {
          await adminPostKodeMIL(token, payload);
        }
      } else if (activeTab === 'gejala') {
        if (!nama.trim()) throw new Error('Nama gejala wajib diisi.');
        const payload = { nama: nama.trim(), deskripsi: deskripsi.trim() || null };
        if (editItem) {
          await adminPutGejala(token, editItem.id, payload);
        } else {
          await adminPostGejala(token, payload);
        }
      } else if (activeTab === 'kerusakan') {
        if (!nama.trim()) throw new Error('Nama kerusakan wajib diisi.');
        const payload = { nama: nama.trim(), deskripsi: deskripsi.trim() || null };
        if (editItem) {
          await adminPutKerusakan(token, editItem.id, payload);
        } else {
          await adminPostKerusakan(token, payload);
        }
      } else if (activeTab === 'komponen') {
        if (!nama.trim()) throw new Error('Nama komponen wajib diisi.');
        const payload = { nama: nama.trim(), deskripsi: deskripsi.trim() || null };
        if (editItem) {
          await adminPutKomponen(token, editItem.id, payload);
        } else {
          await adminPostKomponen(token, payload);
        }
      } else if (activeTab === 'solusi') {
        if (!langkah.trim()) throw new Error('Langkah solusi wajib diisi.');
        const payload = { langkah: langkah.trim(), urutan: Number(urutan) };
        if (editItem) {
          await adminPutSolusi(token, editItem.id, payload);
        } else {
          await adminPostSolusi(token, payload);
        }
      }

      setSuccessBanner(`Data ${activeTab} berhasil disimpan.`);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    const label = item.nama || item.kode || item.langkah || `Item #${item.id}`;
    if (!window.confirm(`Yakin ingin menghapus data "${label}"?`)) return;

    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      if (activeTab === 'kode-mil') await adminDeleteKodeMIL(token, item.id);
      else if (activeTab === 'gejala') await adminDeleteGejala(token, item.id);
      else if (activeTab === 'kerusakan') await adminDeleteKerusakan(token, item.id);
      else if (activeTab === 'komponen') await adminDeleteKomponen(token, item.id);
      else if (activeTab === 'solusi') await adminDeleteSolusi(token, item.id);

      setSuccessBanner(`Data "${label}" berhasil dihapus.`);
      fetchData();
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal menghapus data.');
    }
  };

  // Build dynamic columns based on active tab
  const getColumns = (): Column<any>[] => {
    const aksiCol: Column<any> = {
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
    };

    if (activeTab === 'kode-mil') {
      return [
        {
          key: 'kode',
          title: 'Kode Kedipan',
          width: '120px',
          render: (r) => (
            <span
              style={{
                padding: '0.2rem 0.6rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              MIL {r.kode}
            </span>
          ),
        },
        { key: 'deskripsi', title: 'Deskripsi Kerusakan Terkait' },
        {
          key: 'merek',
          title: 'Merek',
          width: '120px',
          render: (r) => r.merek?.nama || '-',
        },
        aksiCol,
      ];
    }

    if (activeTab === 'solusi') {
      return [
        { key: 'urutan', title: 'Urutan', width: '80px' },
        { key: 'langkah', title: 'Langkah Perbaikan / Solusi' },
        aksiCol,
      ];
    }

    return [
      { key: 'nama', title: 'Nama' },
      { key: 'deskripsi', title: 'Deskripsi Lengkap', render: (r) => r.deskripsi || '-' },
      aksiCol,
    ];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
          Kelola Data Teknis Diagnosis
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Basis data teknis inferensi: Kode MIL, Gejala, Kerusakan, Komponen fisik, dan Solusi perbaikan.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)', flexWrap: 'wrap' }}>
        {[
          { key: 'kode-mil', label: '⚡ Kode MIL' },
          { key: 'gejala', label: '🔍 Gejala' },
          { key: 'kerusakan', label: '⚠️ Kerusakan' },
          { key: 'komponen', label: '⚙️ Komponen' },
          { key: 'solusi', label: '🛠️ Solusi' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key as any);
              setErrorBanner(null);
              setSuccessBanner(null);
            }}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === t.key ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === t.key ? 'var(--primary)' : 'var(--slate-500)',
              fontWeight: activeTab === t.key ? 700 : 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Alert Banners */}
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

      {/* DataTable */}
      <DataTable
        title={`Tabel ${activeTab.toUpperCase()}`}
        subtitle="Daftar parameter teknis sistem pakar"
        columns={getColumns()}
        data={dataList}
        loading={loading}
        onAdd={openAddModal}
        addLabel={`+ Tambah ${activeTab}`}
      />

      {/* Modal Form */}
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
              maxWidth: '500px',
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
                {editItem ? `Edit ${activeTab}` : `Tambah ${activeTab} Baru`}
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

              {/* Active Tab Form Fields */}
              {activeTab === 'kode-mil' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                      Kode Angka Kedipan MIL (1-99) <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 7, 12, 21"
                      value={kode}
                      onChange={(e) => setKode(e.target.value)}
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
                      Pilih Merek Motor <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      required
                      value={merekId}
                      onChange={(e) => setMerekId(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--slate-300)',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="">-- Pilih Merek --</option>
                      {merekList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                      Deskripsi Masalah / Sensor Terkait <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Contoh: Rangkaian sensor temperatur oli/mesin (EOT/ECT) bermasalah"
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--slate-300)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </>
              )}

              {activeTab === 'solusi' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                      Urutan Langkah (1, 2, 3...) <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={urutan}
                      onChange={(e) => setUrutan(Number(e.target.value))}
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
                      Instruksi Langkah Perbaikan <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Contoh: Periksa resistansi sensor menggunakan multimeter (standar 2.5k ohm pada 20°C)"
                      value={langkah}
                      onChange={(e) => setLangkah(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--slate-300)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </>
              )}

              {(activeTab === 'gejala' || activeTab === 'kerusakan' || activeTab === 'komponen') && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                      Nama {activeTab} <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`Nama ${activeTab}...`}
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
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
                      Deskripsi / Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Penjelasan detail..."
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--slate-300)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </>
              )}

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
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaDataTeknisPage;
