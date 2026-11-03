import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminAuthRouter from './routes/adminAuth';
import adminMerekRouter from './routes/adminMerek';
import adminModelRouter from './routes/adminModel';
import adminPenggunaRouter from './routes/adminPengguna';
import adminKodeMILRouter from './routes/adminKodeMIL';
import adminGejalaRouter from './routes/adminGejala';
import adminKerusakanRouter from './routes/adminKerusakan';
import adminKomponenRouter from './routes/adminKomponen';
import adminSolusiRouter from './routes/adminSolusi';
import adminBasisAturanRouter from './routes/adminBasisAturan';
import adminRiwayatRouter from './routes/adminRiwayat';
import adminLaporanRouter from './routes/adminLaporan';
import adminDashboardRouter from './routes/adminDashboard';
import publikRouter from './routes/publik';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rute publik (merek, model, diagnosis)
app.use('/api', publikRouter);

// Autentikasi admin
app.use('/api/admin', adminAuthRouter);

// Dashboard admin statistik
app.use('/api/admin/dashboard', adminDashboardRouter);

// CRUD admin — Data Master
app.use('/api/admin/merek', adminMerekRouter);
app.use('/api/admin/model', adminModelRouter);
app.use('/api/admin/pengguna', adminPenggunaRouter);

// CRUD admin — Data Teknis
app.use('/api/admin/kode-mil', adminKodeMILRouter);
app.use('/api/admin/gejala', adminGejalaRouter);
app.use('/api/admin/kerusakan', adminKerusakanRouter);
app.use('/api/admin/komponen', adminKomponenRouter);
app.use('/api/admin/solusi', adminSolusiRouter);
app.use('/api/admin/basis-aturan', adminBasisAturanRouter);
app.use('/api/admin/riwayat', adminRiwayatRouter);
app.use('/api/admin/laporan', adminLaporanRouter);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

export default app;
