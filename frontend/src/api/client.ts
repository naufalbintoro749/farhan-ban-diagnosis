// Base URL — empty because Vite proxy handles /api -> http://localhost:3001
const BASE = '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Merek {
  id: number;
  nama: string;
}

export interface ModelMotor {
  id: number;
  nama: string;
}

export interface HasilDiagnosis {
  kerusakan: { id: number; nama: string; deskripsi: string | null };
  gejala: { id: number; nama: string };
  kodesMILPemicu: string[];
  komponen: { id: number; nama: string; deskripsi: string | null }[];
  solusi: { id: number; langkah: string; urutan: number }[];
}

export interface DiagnosisResult {
  ditemukan: boolean;
  pesan?: string;
  hasil: HasilDiagnosis[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${url}`, options);
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || body.pesan || body.message || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  // handle 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ─── Public endpoints ─────────────────────────────────────────────────────────

export async function getMerek(): Promise<Merek[]> {
  const res = await request<{ data: Merek[] } | Merek[]>('/api/merek');
  return Array.isArray(res) ? res : res.data || [];
}

export function getModelByMerek(
  merekId: number
): Promise<{ merek: Merek; data: ModelMotor[] }> {
  return request<{ merek: Merek; data: ModelMotor[] }>(
    `/api/merek/${merekId}/model`
  );
}

export function postDiagnosis(
  merekId: number,
  modelId: number,
  kodeMIL: string[],
  namaPengguna?: string,
  noTelepon?: string
): Promise<DiagnosisResult> {
  return request<DiagnosisResult>('/api/diagnosis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merekId, modelId, kodeMIL, namaPengguna, noTelepon }),
  });
}

// ─── Admin auth endpoints ─────────────────────────────────────────────────────

export function adminLogin(
  email: string,
  password: string
): Promise<{ token: string; admin?: { id: number; email: string; nama: string } }> {
  return request<{ token: string; admin?: { id: number; email: string; nama: string } }>('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function adminLogout(token: string): Promise<void> {
  return request<void>('/api/admin/logout', {
    method: 'POST',
    headers: authHeaders(token),
  });
}

// ─── Admin dashboard ──────────────────────────────────────────────────────────

export async function getStatistikDashboard(token: string): Promise<{
  totalDiagnosis: number;
  distribusiMerek: { nama: string; jumlah: number }[];
  topKodeMIL: { kode: string; jumlah: number }[];
  trenHarian: { tanggal: string; jumlah: number }[];
}> {
  const res = await request<any>('/api/admin/dashboard/statistik', {
    headers: authHeaders(token),
  });
  return res.data || res;
}

// ─── Admin CRUD — Merek ───────────────────────────────────────────────────────

export async function adminGetMerek(token: string): Promise<any[]> {
  const res = await request<any>('/api/admin/merek', { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostMerek(token: string, data: { nama: string }): Promise<any> {
  const res = await request<any>('/api/admin/merek', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutMerek(token: string, id: number, data: { nama: string }): Promise<any> {
  const res = await request<any>(`/api/admin/merek/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeleteMerek(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/merek/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin CRUD — Model ───────────────────────────────────────────────────────

export async function adminGetModel(token: string, params?: { search?: string }): Promise<any[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  const res = await request<any>(`/api/admin/model${qs}`, { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostModel(token: string, data: { nama: string; merekId: number }): Promise<any> {
  const res = await request<any>('/api/admin/model', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutModel(token: string, id: number, data: { nama: string; merekId: number }): Promise<any> {
  const res = await request<any>(`/api/admin/model/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeleteModel(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/model/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin CRUD — Pengguna ────────────────────────────────────────────────────

export async function adminGetPengguna(token: string): Promise<any[]> {
  const res = await request<any>('/api/admin/pengguna', { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostPengguna(token: string, data: { nama: string; email: string; password: string }): Promise<any> {
  const res = await request<any>('/api/admin/pengguna', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutPengguna(token: string, id: number, data: { nama?: string; email?: string; password?: string }): Promise<any> {
  const res = await request<any>(`/api/admin/pengguna/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeletePengguna(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/pengguna/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin CRUD — KodeMIL ─────────────────────────────────────────────────────

export async function adminGetKodeMIL(token: string, params?: { search?: string }): Promise<any[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  const res = await request<any>(`/api/admin/kode-mil${qs}`, { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostKodeMIL(token: string, data: any): Promise<any> {
  const res = await request<any>('/api/admin/kode-mil', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutKodeMIL(token: string, id: number, data: any): Promise<any> {
  const res = await request<any>(`/api/admin/kode-mil/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeleteKodeMIL(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/kode-mil/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin CRUD — Gejala ──────────────────────────────────────────────────────

export async function adminGetGejala(token: string, params?: { search?: string }): Promise<any[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  const res = await request<any>(`/api/admin/gejala${qs}`, { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostGejala(token: string, data: any): Promise<any> {
  const res = await request<any>('/api/admin/gejala', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutGejala(token: string, id: number, data: any): Promise<any> {
  const res = await request<any>(`/api/admin/gejala/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeleteGejala(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/gejala/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin CRUD — Kerusakan ───────────────────────────────────────────────────

export async function adminGetKerusakan(token: string, params?: { search?: string }): Promise<any[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  const res = await request<any>(`/api/admin/kerusakan${qs}`, { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostKerusakan(token: string, data: any): Promise<any> {
  const res = await request<any>('/api/admin/kerusakan', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutKerusakan(token: string, id: number, data: any): Promise<any> {
  const res = await request<any>(`/api/admin/kerusakan/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeleteKerusakan(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/kerusakan/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin CRUD — Komponen ────────────────────────────────────────────────────

export async function adminGetKomponen(token: string, params?: { search?: string }): Promise<any[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  const res = await request<any>(`/api/admin/komponen${qs}`, { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostKomponen(token: string, data: any): Promise<any> {
  const res = await request<any>('/api/admin/komponen', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutKomponen(token: string, id: number, data: any): Promise<any> {
  const res = await request<any>(`/api/admin/komponen/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeleteKomponen(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/komponen/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin CRUD — Solusi ──────────────────────────────────────────────────────

export async function adminGetSolusi(token: string, params?: { search?: string }): Promise<any[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  const res = await request<any>(`/api/admin/solusi${qs}`, { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostSolusi(token: string, data: any): Promise<any> {
  const res = await request<any>('/api/admin/solusi', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutSolusi(token: string, id: number, data: any): Promise<any> {
  const res = await request<any>(`/api/admin/solusi/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeleteSolusi(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/solusi/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin CRUD — Basis Aturan ────────────────────────────────────────────────

export async function adminGetBasisAturan(token: string, params?: { search?: string }): Promise<any[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  const res = await request<any>(`/api/admin/basis-aturan${qs}`, { headers: authHeaders(token) });
  return Array.isArray(res) ? res : res.data || [];
}

export async function adminPostBasisAturan(token: string, data: any): Promise<any> {
  const res = await request<any>('/api/admin/basis-aturan', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export async function adminPutBasisAturan(token: string, id: number, data: any): Promise<any> {
  const res = await request<any>(`/api/admin/basis-aturan/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res.data || res;
}

export function adminDeleteBasisAturan(token: string, id: number): Promise<void> {
  return request<void>(`/api/admin/basis-aturan/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ─── Admin — Riwayat Diagnosis ────────────────────────────────────────────────

export interface RiwayatFilter {
  tanggalMulai?: string;
  tanggalAkhir?: string;
  merekId?: number;
  modelId?: number;
}

export async function adminGetRiwayat(token: string, filter?: RiwayatFilter): Promise<{ data: any[]; total: number }> {
  const params = new URLSearchParams();
  if (filter?.tanggalMulai) params.set('tanggalMulai', filter.tanggalMulai);
  if (filter?.tanggalAkhir) params.set('tanggalAkhir', filter.tanggalAkhir);
  if (filter?.merekId) params.set('merekId', String(filter.merekId));
  if (filter?.modelId) params.set('modelId', String(filter.modelId));
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await request<any>(`/api/admin/riwayat${qs}`, { headers: authHeaders(token) });
  if (Array.isArray(res)) return { data: res, total: res.length };
  return { data: res.data || [], total: res.total ?? (res.data?.length || 0) };
}

export function adminCetakLaporan(token: string, ids: number[]): Promise<Blob> {
  return fetch('/api/admin/laporan/cetak', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ ids }),
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  });
}
