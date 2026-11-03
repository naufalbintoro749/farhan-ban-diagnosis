/**
 * Rute admin: Riwayat Diagnosis
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 11.3, 11.4
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Semua rute di bawah memerlukan JWT
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// Utilitas: Validasi ISO date string (format: YYYY-MM-DD atau ISO 8601 penuh)
// ---------------------------------------------------------------------------
function parseISODate(value: string): Date | null {
  // Tolak string kosong
  if (!value.trim()) return null;

  // Hanya izinkan format YYYY-MM-DD atau ISO 8601 standar
  // Regex: YYYY-MM-DD dengan validasi dasar
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isoFullRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

  if (!dateOnlyRegex.test(value) && !isoFullRegex.test(value)) {
    return null;
  }

  const date = new Date(value);
  // Pastikan tanggal valid (misalnya, bukan 2024-02-30)
  if (isNaN(date.getTime())) return null;

  return date;
}

// ---------------------------------------------------------------------------
// GET /api/admin/riwayat
// Daftar semua riwayat diagnosis dengan filter opsional
//
// Query parameters:
//   ?tanggalMulai=  (ISO date string) — filter createdAt >= tanggalMulai (awal hari)
//   ?tanggalAkhir=  (ISO date string) — filter createdAt <= tanggalAkhir (akhir hari)
//   ?merekId=       (number)          — filter berdasarkan model.merekId
//   ?modelId=       (number)          — filter berdasarkan modelId
//
// Response: { data: [...], total: number }
// Kebutuhan: 11.3, 11.4
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { tanggalMulai, tanggalAkhir, merekId, modelId } = req.query;

  // --- Validasi tanggalMulai ---
  let tglMulai: Date | undefined;
  if (tanggalMulai !== undefined && tanggalMulai !== '') {
    if (typeof tanggalMulai !== 'string') {
      res.status(400).json({ error: 'Parameter tanggalMulai harus berupa string.' });
      return;
    }
    const parsed = parseISODate(tanggalMulai);
    if (!parsed) {
      res.status(400).json({
        error: 'Format tanggalMulai tidak valid. Gunakan format ISO date (contoh: "2024-01-01").',
      });
      return;
    }
    // Set ke awal hari (00:00:00.000 UTC)
    tglMulai = new Date(parsed);
    tglMulai.setUTCHours(0, 0, 0, 0);
  }

  // --- Validasi tanggalAkhir ---
  let tglAkhir: Date | undefined;
  if (tanggalAkhir !== undefined && tanggalAkhir !== '') {
    if (typeof tanggalAkhir !== 'string') {
      res.status(400).json({ error: 'Parameter tanggalAkhir harus berupa string.' });
      return;
    }
    const parsed = parseISODate(tanggalAkhir);
    if (!parsed) {
      res.status(400).json({
        error: 'Format tanggalAkhir tidak valid. Gunakan format ISO date (contoh: "2024-12-31").',
      });
      return;
    }
    // Set ke akhir hari (23:59:59.999 UTC)
    tglAkhir = new Date(parsed);
    tglAkhir.setUTCHours(23, 59, 59, 999);
  }

  // --- Validasi merekId ---
  let merekIdNum: number | undefined;
  if (merekId !== undefined && merekId !== '') {
    if (typeof merekId !== 'string') {
      res.status(400).json({ error: 'Parameter merekId harus berupa angka.' });
      return;
    }
    merekIdNum = parseInt(merekId, 10);
    if (isNaN(merekIdNum) || merekIdNum <= 0) {
      res.status(400).json({ error: 'Parameter merekId harus berupa angka positif yang valid.' });
      return;
    }
  }

  // --- Validasi modelId ---
  let modelIdNum: number | undefined;
  if (modelId !== undefined && modelId !== '') {
    if (typeof modelId !== 'string') {
      res.status(400).json({ error: 'Parameter modelId harus berupa angka.' });
      return;
    }
    modelIdNum = parseInt(modelId, 10);
    if (isNaN(modelIdNum) || modelIdNum <= 0) {
      res.status(400).json({ error: 'Parameter modelId harus berupa angka positif yang valid.' });
      return;
    }
  }

  // --- Bangun klausa where Prisma ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  // Filter tanggal pada createdAt
  if (tglMulai || tglAkhir) {
    where.createdAt = {};
    if (tglMulai) where.createdAt.gte = tglMulai;
    if (tglAkhir) where.createdAt.lte = tglAkhir;
  }

  // Filter berdasarkan modelId langsung
  if (modelIdNum !== undefined) {
    where.modelId = modelIdNum;
  }

  // Filter berdasarkan merekId melalui relasi model → merek
  // Jika kedua filter diberikan, gabungkan dalam where.model
  if (merekIdNum !== undefined) {
    where.model = { merekId: merekIdNum };
  }

  // --- Query database ---
  const [riwayatList, total] = await Promise.all([
    prisma.diagnosis.findMany({
      where,
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
            merek: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
    }),
    prisma.diagnosis.count({ where }),
  ]);

  const formattedList = riwayatList.map((item: typeof riwayatList[number]) => {
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

    return {
      ...item,
      kodeMILInput: parsedKode,
      hasilDiagnosis: parsedHasil,
    };
  });

  res.json({ data: formattedList, total });
});

export default router;
