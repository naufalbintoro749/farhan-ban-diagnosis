/**
 * Rute publik: merek, model, dan diagnosis
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 3.1, 3.2, 5.1–5.6
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { forwardChaining } from '../engine/forwardChaining';
import { validateKodeMILArray } from '../utils/validateKodeMIL';
import { serializeHasilDiagnosisArray } from '../utils/hasilDiagnosis';

// Tipe lokal untuk hasil include query Prisma agar tidak ada implicit any
interface SolusiRow { solusi: { id: number; langkah: string; urutan: number } }
interface KomponenRow { komponen: { id: number; nama: string; deskripsi: string | null } }

interface AturanRow {
  id: number;
  kodeMILId: number;
  gejalaid: number;
  kerusakanId: number;
  bobot: number;
  aktif: boolean;
  kodeMIL: { id: number; kode: string; deskripsi: string; merekId: number; modelId: number | null };
  gejala: { id: number; nama: string; deskripsi: string | null };
  kerusakan: {
    id: number;
    nama: string;
    deskripsi: string | null;
    komponen: KomponenRow[];
    solusi: SolusiRow[];
  };
}

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/merek
// Mengembalikan daftar semua merek yang aktif
// Kebutuhan: 3.1
// ---------------------------------------------------------------------------
router.get('/merek', async (_req: Request, res: Response): Promise<void> => {
  const merekList = await prisma.merek.findMany({
    where: { aktif: true },
    select: { id: true, nama: true },
    orderBy: { nama: 'asc' },
  });

  res.json({ data: merekList });
});

// ---------------------------------------------------------------------------
// GET /api/merek/:id/model
// Mengembalikan daftar model aktif berdasarkan merek
// Kebutuhan: 3.2
// ---------------------------------------------------------------------------
router.get(
  '/merek/:id/model',
  async (req: Request, res: Response): Promise<void> => {
    const merekId = parseInt(req.params.id, 10);

    if (isNaN(merekId)) {
      res.status(400).json({ error: 'ID merek tidak valid.' });
      return;
    }

    const merek = await prisma.merek.findUnique({
      where: { id: merekId },
    });

    if (!merek) {
      res.status(404).json({ error: 'Merek tidak ditemukan.' });
      return;
    }

    const modelList = await prisma.model.findMany({
      where: { merekId, aktif: true },
      select: { id: true, nama: true },
      orderBy: { nama: 'asc' },
    });

    res.json({ data: modelList, merek: { id: merek.id, nama: merek.nama } });
  }
);

// ---------------------------------------------------------------------------
// POST /api/diagnosis
// Validasi input → ambil basis aturan → Forward Chaining → simpan → kembalikan hasil
// Kebutuhan: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
// ---------------------------------------------------------------------------
router.post(
  '/diagnosis',
  async (req: Request, res: Response): Promise<void> => {
    const { merekId, modelId, kodeMIL, namaPengguna, noTelepon } = req.body as {
      merekId?: unknown;
      modelId?: unknown;
      kodeMIL?: unknown;
      namaPengguna?: unknown;
      noTelepon?: unknown;
    };

    // --- Validasi keberadaan field ---
    if (!merekId || !modelId || !kodeMIL) {
      res.status(400).json({
        error: 'Field merekId, modelId, dan kodeMIL wajib diisi.',
      });
      return;
    }

    if (!namaPengguna || typeof namaPengguna !== 'string' || !namaPengguna.trim()) {
      res.status(400).json({
        error: 'Nama pengguna wajib diisi.',
      });
      return;
    }

    if (!noTelepon || typeof noTelepon !== 'string' || !noTelepon.trim()) {
      res.status(400).json({
        error: 'Nomor telepon pengguna wajib diisi.',
      });
      return;
    }

    if (!Array.isArray(kodeMIL) || kodeMIL.length === 0) {
      res.status(400).json({
        error: 'kodeMIL harus berupa array dengan minimal satu kode.',
      });
      return;
    }

    const merekIdNum = Number(merekId);
    const modelIdNum = Number(modelId);

    if (isNaN(merekIdNum) || isNaN(modelIdNum)) {
      res.status(400).json({ error: 'merekId dan modelId harus berupa angka.' });
      return;
    }

    // --- Validasi format kode MIL ---
    const merekData = await prisma.merek.findUnique({
      where: { id: merekIdNum },
      select: { nama: true },
    });

    if (!merekData) {
      res.status(404).json({ error: 'Merek tidak ditemukan.' });
      return;
    }

    const kodeArray = kodeMIL as string[];
    const validasiErrors = validateKodeMILArray(kodeArray, merekData.nama);
    if (validasiErrors.length > 0) {
      res.status(400).json({
        error: 'Format kode MIL tidak valid.',
        detail: validasiErrors,
      });
      return;
    }

    // --- Pastikan model ada dan milik merek yang benar ---
    const modelData = await prisma.model.findFirst({
      where: { id: modelIdNum, merekId: merekIdNum },
    });

    if (!modelData) {
      res.status(404).json({ error: 'Model tidak ditemukan untuk merek ini.' });
      return;
    }

    // --- Ambil basis aturan yang relevan dari DB ---
    const aturan = await prisma.basisAturan.findMany({
      where: {
        aktif: true,
        kodeMIL: {
          OR: [
            { merekId: merekIdNum, modelId: null },
            { merekId: merekIdNum, modelId: modelIdNum },
          ],
        },
      },
      include: {
        kodeMIL: true,
        gejala: true,
        kerusakan: {
          include: {
            komponen: { include: { komponen: true } },
            solusi: { include: { solusi: true } },
          },
        },
      },
    });

    // Normalisasi struktur aturan agar sesuai tipe BasisAturan engine
    const aturanNormal = (aturan as unknown as AturanRow[]).map((a) => ({
      id: a.id,
      kodeMILId: a.kodeMILId,
      gejalaid: a.gejalaid,
      kerusakanId: a.kerusakanId,
      bobot: a.bobot,
      aktif: a.aktif,
      kodeMIL: {
        id: a.kodeMIL.id,
        kode: a.kodeMIL.kode,
        deskripsi: a.kodeMIL.deskripsi,
        merekId: a.kodeMIL.merekId,
        modelId: a.kodeMIL.modelId,
      },
      gejala: {
        id: a.gejala.id,
        nama: a.gejala.nama,
        deskripsi: a.gejala.deskripsi,
      },
      kerusakan: {
        id: a.kerusakan.id,
        nama: a.kerusakan.nama,
        deskripsi: a.kerusakan.deskripsi,
        komponen: a.kerusakan.komponen.map((kk: KomponenRow) => ({
          id: kk.komponen.id,
          nama: kk.komponen.nama,
          deskripsi: kk.komponen.deskripsi,
        })),
        solusi: a.kerusakan.solusi
          .map((ks: SolusiRow) => ({
            id: ks.solusi.id,
            langkah: ks.solusi.langkah,
            urutan: ks.solusi.urutan,
          }))
          .sort((x: { urutan: number }, y: { urutan: number }) => x.urutan - y.urutan),
      },
    }));

    // --- Jalankan mesin inferensi Forward Chaining ---
    const hasil = forwardChaining(kodeArray, aturanNormal);

    // --- Simpan ke tabel Diagnosis ---
    await prisma.diagnosis.create({
      data: {
        modelId: modelIdNum,
        namaPengguna: typeof namaPengguna === 'string' ? namaPengguna.trim() : '',
        noTelepon: typeof noTelepon === 'string' ? noTelepon.trim() : '',
        kodeMILInput: JSON.stringify(kodeArray),
        hasilDiagnosis: serializeHasilDiagnosisArray(hasil),
      },
    });

    // --- Kembalikan hasil ---
    if (hasil.length === 0) {
      res.json({
        ditemukan: false,
        pesan:
          'Tidak ada kerusakan yang cocok dengan kode MIL yang diinput. Silakan konsultasikan dengan teknisi.',
        hasil: [],
      });
      return;
    }

    res.json({ ditemukan: true, hasil });
  }
);

// ---------------------------------------------------------------------------
// GET /api/riwayat
// Mengembalikan daftar riwayat diagnosis terkini untuk pengunjung publik
// ---------------------------------------------------------------------------
router.get('/riwayat', async (_req: Request, res: Response): Promise<void> => {
  const list = await prisma.diagnosis.findMany({
    take: 25,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      namaPengguna: true,
      noTelepon: true,
      createdAt: true,
      kodeMILInput: true,
      hasilDiagnosis: true,
      model: {
        select: {
          id: true,
          nama: true,
          merek: { select: { id: true, nama: true } },
        },
      },
    },
  });

  const formatted = list.map((item) => {
    let parsedKode: string[] = [];
    try {
      const parsed = JSON.parse(item.kodeMILInput);
      parsedKode = Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      parsedKode = item.kodeMILInput ? [item.kodeMILInput] : [];
    }

    let parsedHasil: unknown = item.hasilDiagnosis;
    try {
      parsedHasil = JSON.parse(item.hasilDiagnosis);
    } catch {
      parsedHasil = item.hasilDiagnosis;
    }

    return { ...item, kodeMILInput: parsedKode, hasilDiagnosis: parsedHasil };
  });

  res.json({ data: formatted });
});

export default router;
