import React, { useEffect, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import {
  adminGetMerek,
  adminPostMerek,
  adminPutMerek,
  adminDeleteMerek,
  adminGetModel,
  adminPostModel,
  adminPutModel,
  adminDeleteModel,
  adminGetPengguna,
  adminPostPengguna,
  adminPutPengguna,
  adminDeletePengguna,
} from '../api/client';

export const KelolaMasterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'merek' | 'model' | 'pengguna'>('merek');
  const token = localStorage.getItem('admin_token') || '';

  // Data states
  const [merekList, setMerekList] = useState<any[]>([]);
  const [modelList, setModelList] = useState<any[]>([]);
  const [penggunaList, setPenggunaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Form input states
  const [nama, setNama] = useState('');
  const [selectedMerekId, setSelectedMerekId] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      if (activeTab === 'merek') {
        const res = await adminGetMerek(token);
        setMerekList(res);
      } else if (activeTab === 'model') {
        const [mRes, modRes] = await Promise.all([adminGetMerek(token), adminGetModel(token)]);
        setMerekList(mRes);
        setModelList(modRes);
      } else if (activeTab === 'pengguna') {
        const res = await adminGetPengguna(token);
        setPenggunaList(res);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal memuat data master.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [activeTab, token]);

  const openAddModal = () => {
    setEditItem(null);
    setNama('');
    setSelectedMerekId(merekList[0]?.id || '');
    setEmail('');
    setPassword('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditItem(item);
    setNama(item.nama || '');
    setSelectedMerekId(item.merekId || item.merek?.id || '');
    setEmail(item.email || '');
    setPassword('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (activeTab === 'merek') {
        if (!nama.trim()) throw new Error('Nama merek wajib diisi.');
        if (editItem) {
          await adminPutMerek(token, editItem.id, { nama: nama.trim() });
          setSuccessBanner(`Merek "${nama}" berhasil diperbarui.`);
        } else {
          await adminPostMerek(token, { nama: nama.trim() });
          setSuccessBanner(`Merek "${nama}" berhasil ditambahkan.`);
        }
      } else if (activeTab === 'model') {
        if (!nama.trim()) throw new Error('Nama model motor wajib diisi.');
        if (!selectedMerekId) throw new Error('Merek motor wajib dipilih.');
        if (editItem) {
          await adminPutModel(token, editItem.id, { nama: nama.trim(), merekId: Number(selectedMerekId) });
          setSuccessBanner(`Model "${nama}" berhasil diperbarui.`);
        } else {
          await adminPostModel(token, { nama: nama.trim(), merekId: Number(selectedMerekId) });
          setSuccessBanner(`Model "${nama}" berhasil ditambahkan.`);
        }
      } else if (activeTab === 'pengguna') {
        if (!nama.trim() || !email.trim()) throw new Error('Nama dan email wajib diisi.');
        if (!editItem && !password.trim()) throw new Error('Kata sandi wajib diisi untuk pengguna baru.');
        if (editItem) {
          await adminPutPengguna(token, editItem.id, {
            nama: nama.trim(),
            email: email.trim(),
            ...(password ? { password } : {}),
          });
          setSuccessBanner(`Akun admin "${nama}" berhasil diperbarui.`);
        } else {
          await adminPostPengguna(token, { nama: nama.trim(), email: email.trim(), password });
          setSuccessBanner(`Akun admin baru "${nama}" berhasil dibuat.`);
        }
      }

      setModalOpen(false);
      fetchAll();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Yakin ingin menghapus ${activeTab} "${item.nama}"?`)) return;

    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      if (activeTab === 'merek') {
        await adminDeleteMerek(token, item.id);
        setSuccessBanner(`Merek "${item.nama}" berhasil dihapus.`);
      } else if (activeTab === 'model') {
        await adminDeleteModel(token, item.id);
        setSuccessBanner(`Model "${item.nama}" berhasil dihapus.`);
      } else if (activeTab === 'pengguna') {
        await adminDeletePengguna(token, item.id);
        setSuccessBanner(`Akun admin "${item.nama}" berhasil dihapus.`);
      }
      fetchAll();
    } catch (err: any) {
      setErrorBanner(err.message || 'Gagal menghapus data.');
    }
  };

  // Columns per tab
  const merekColumns: Column<any>[] = [
    { key: 'id', title: 'ID', width: '80px' },
    { key: 'nama', title: 'Nama Merek Motor' },
    {
      key: 'modelCount',
      title: 'Jumlah Model',
      render: (r) => r._count?.model ?? r.model?.length ?? '-',
    },
    {
      key: 'aksi',
      title: 'Aksi',
      width: '160px',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => openEditModal(r)}
            style={{
              padding: '0.35rem 0.7rem',
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
              padding: '0.35rem 0.7rem',
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

  const modelColumns: Column<any>[] = [
    { key: 'id', title: 'ID', width: '80px' },
    { key: 'nama', title: 'Nama Model' },
    {
      key: 'merek',
      title: 'Merek Motor',
      render: (r) => (
        <span
          style={{
            padding: '0.2rem 0.6rem',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '0.82rem',
          }}
        >
          {r.merek?.nama || '-'}
        </span>
      ),
    },
    {
      key: 'aksi',
      title: 'Aksi',
      width: '160px',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => openEditModal(r)}
            style={{
              padding: '0.35rem 0.7rem',
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
              padding: '0.35rem 0.7rem',
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

  const penggunaColumns: Column<any>[] = [
    { key: 'id', title: 'ID', width: '80px' },
    { key: 'nama', title: 'Nama Pengguna' },
    { key: 'email', title: 'Email Login' },
    {
      key: 'status',
      title: 'Status',
      render: (r) => (
        <span
          style={{
            padding: '0.2rem 0.6rem',
            backgroundColor: r.lockedUntil ? 'var(--danger-light)' : 'var(--success-light)',
            color: r.lockedUntil ? 'var(--danger)' : 'var(--success)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '0.82rem',
          }}
        >
          {r.lockedUntil ? 'Terkunci' : 'Aktif'}
        </span>
      ),
    },
    {
      key: 'aksi',
      title: 'Aksi',
      width: '160px',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => openEditModal(r)}
            style={{
              padding: '0.35rem 0.7rem',
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
              padding: '0.35rem 0.7rem',
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
          Kelola Data Master
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Kelola data merek sepeda motor, model seri kendaraan, dan akun kredensial admin.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)' }}>
        {[
          { key: 'merek', label: 'Merek Motor' },
          { key: 'model', label: 'Model Motor' },
          { key: 'pengguna', label: 'Akun Admin' },
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

      {/* Alerts */}
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

      {/* Tables based on tab */}
      {activeTab === 'merek' && (
        <DataTable
          title="Daftar Merek Sepeda Motor"
          subtitle="Data pabrikan kendaraan motor injeksi"
          columns={merekColumns}
          data={merekList}
          loading={loading}
          onAdd={openAddModal}
          addLabel="+ Tambah Merek"
        />
      )}

      {activeTab === 'model' && (
        <DataTable
          title="Daftar Model Sepeda Motor"
          subtitle="Model/varian spesifik per merek kendaraan"
          columns={modelColumns}
          data={modelList}
          loading={loading}
          onAdd={openAddModal}
          addLabel="+ Tambah Model"
        />
      )}

      {activeTab === 'pengguna' && (
        <DataTable
          title="Daftar Akun Admin"
          subtitle="Manajemen akun administrator sistem pakar"
          columns={penggunaColumns}
          data={penggunaList}
          loading={loading}
          onAdd={openAddModal}
          addLabel="+ Tambah Admin"
        />
      )}

      {/* Form Modal */}
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
              maxWidth: '480px',
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

              {/* Field: Nama */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                  Nama {activeTab === 'merek' ? 'Merek' : activeTab === 'model' ? 'Model Motor' : 'Admin'} <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Contoh: ${activeTab === 'merek' ? 'Honda / Yamaha' : activeTab === 'model' ? 'Beat Fi / NMAX 155' : 'Farhan Mechanic'}`}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--slate-300)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Field: Merek Dropdown (Khusus Model) */}
              {activeTab === 'model' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                    Pilih Merek Motor <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    required
                    value={selectedMerekId}
                    onChange={(e) => setSelectedMerekId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--slate-300)',
                      fontSize: '0.9rem',
                      outline: 'none',
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
              )}

              {/* Field: Email & Password (Khusus Pengguna) */}
              {activeTab === 'pengguna' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                      Email Login <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@farhanmotor.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--slate-300)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                      Kata Sandi {editItem ? '(Kosongkan jika tidak diubah)' : <span style={{ color: 'var(--danger)' }}>*</span>}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--slate-300)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </>
              )}

              {/* Actions */}
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

export default KelolaMasterPage;
