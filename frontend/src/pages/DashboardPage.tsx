import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { getStatistikDashboard } from '../api/client';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    totalDiagnosis: number;
    distribusiMerek: { nama: string; jumlah: number }[];
    topKodeMIL: { kode: string; jumlah: number }[];
    trenHarian: { tanggal: string; jumlah: number }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('admin_token') || '';

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getStatistikDashboard(token)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat statistik dashboard.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const COLORS = ['#1d4ed8', '#0284c7', '#059669', '#d97706', '#dc2626'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem' }}>
        <span className="spinner-primary" />
        <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>Memuat data statistik sistem...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--danger-border)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
        <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Gagal Mengambil Data Statistik</h3>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{error}</p>
        <button
          onClick={fetchData}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const hondaCount = data.distribusiMerek.find((m) => m.nama.toLowerCase().includes('honda'))?.jumlah || 0;
  const yamahaCount = data.distribusiMerek.find((m) => m.nama.toLowerCase().includes('yamaha'))?.jumlah || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
            Dashboard Analitik & Statistik
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Pantau performa inferensi kode kedipan MIL dan riwayat diagnosis secara real-time.
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#fff',
            border: '1px solid var(--slate-300)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          🔄 Perbarui Data
        </button>
      </div>

      {/* Metric Cards (StatistikCard) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Diagnosis */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Total Diagnosis
            </span>
            <span style={{ fontSize: '1.4rem' }}>📈</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.4rem' }}>
            {data.totalDiagnosis.toLocaleString('id-ID')}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
            Semua sesi tersimpan di basis data
          </span>
        </div>

        {/* Honda */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Motor Honda
            </span>
            <span style={{ fontSize: '1.4rem' }}>🔴</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#dc2626', marginTop: '0.4rem' }}>
            {hondaCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
            {data.totalDiagnosis > 0 ? `${((hondaCount / data.totalDiagnosis) * 100).toFixed(1)}% dari total` : '0%'}
          </span>
        </div>

        {/* Yamaha */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Motor Yamaha
            </span>
            <span style={{ fontSize: '1.4rem' }}>🔵</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0284c7', marginTop: '0.4rem' }}>
            {yamahaCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
            {data.totalDiagnosis > 0 ? `${((yamahaCount / data.totalDiagnosis) * 100).toFixed(1)}% dari total` : '0%'}
          </span>
        </div>

        {/* Top MIL code */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--slate-200)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Kode Terbanyak
            </span>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--slate-800)', marginTop: '0.4rem' }}>
            {data.topKodeMIL.length > 0 ? `MIL ${data.topKodeMIL[0].kode}` : '-'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
            {data.topKodeMIL.length > 0 ? `${data.topKodeMIL[0].jumlah} kali teridentifikasi` : 'Belum ada data'}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Tren 30 Hari Terakhir */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--slate-200)',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.2rem' }}>
            📈 Tren Diagnosis Harian (30 Hari Terakhir)
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
            Jumlah aktivitas inferensi kerusakan per hari
          </p>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trenHarian} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="tanggal"
                  tickFormatter={(val) => val.slice(5)}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Diagnosis`, 'Jumlah']}
                  labelFormatter={(lbl) => `Tanggal: ${lbl}`}
                />
                <Area type="monotone" dataKey="jumlah" stroke="#1d4ed8" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5 Kode MIL Teratas */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--slate-200)',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.2rem' }}>
            🏆 5 Kode Kedipan MIL Teratas
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
            Frekuensi kerusakan sistem injeksi yang paling sering muncul
          </p>

          <div style={{ width: '100%', height: 260 }}>
            {data.topKodeMIL.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>
                Belum ada data frekuensi kode MIL
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topKodeMIL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="kode" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `Kode ${v}`} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(val: any) => [`${val} Kali`, 'Frekuensi']} labelFormatter={(v) => `Kode MIL: ${v}`} />
                  <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
                    {data.topKodeMIL.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
