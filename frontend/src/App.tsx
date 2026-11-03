import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import HomePage from './pages/HomePage';
import PanduanPage from './pages/PanduanPage';
import { DiagnosisWizard } from './pages/DiagnosisWizard';
import { HasilDiagnosisPage } from './pages/HasilDiagnosisPage';
import RiwayatPage from './pages/RiwayatPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AuthGuard from './components/AuthGuard';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import KelolaMasterPage from './pages/KelolaMasterPage';
import KelolaDataTeknisPage from './pages/KelolaDataTeknisPage';
import KelolaBasisAturanPage from './pages/KelolaBasisAturanPage';
import RiwayatDiagnosisPage from './pages/RiwayatDiagnosisPage';

function App() {
  return (
    <Routes>
      {/* Rute Publik dalam Shell Layout Sidebar Biru */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/panduan" element={<PanduanPage />} />
        <Route path="/diagnosis" element={<DiagnosisWizard />} />
        <Route path="/diagnosis/hasil" element={<HasilDiagnosisPage />} />
        <Route path="/riwayat" element={<RiwayatPage />} />
      </Route>

      {/* Login Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Rute Admin Terproteksi */}
      <Route element={<AuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/master" element={<KelolaMasterPage />} />
          <Route path="/admin/data-teknis" element={<KelolaDataTeknisPage />} />
          <Route path="/admin/basis-aturan" element={<KelolaBasisAturanPage />} />
          <Route path="/admin/riwayat" element={<RiwayatDiagnosisPage />} />
          <Route path="/admin/pengguna" element={<KelolaMasterPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
