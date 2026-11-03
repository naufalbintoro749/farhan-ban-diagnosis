/**
 * Rute CRUD admin: Kode MIL
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 10.1, 10.2, 10.3, 10.4
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Semua rute di bawah memerlukan JWT
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /api/admin/kode-mil
// Daftar semua kode MIL (opsional filter ?merekId=, ?modelId=, ?search=)
// Kebutuhan: 10.1, 10.5
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const merekIdParam = req.query.merekId;
  const modelIdParam = req.query.modelId;
  const searchParam = req.query.search;

  const merekId = merekIdParam ? parseInt(merekIdParam as string, 10) : undefined;
  const modelId = modelIdParam ? parseInt(modelIdParam as string, 10) : undefined;
  const search = searchParam && typeof searchParam === 'string' ? searchParam.trim() : undefined;

  if (merekIdParam !== undefined && isNaN(merekId!)) {
    res.status(400).json({ error: 'Parameter merekId tidak valid.' });
    return;
  }
  if (modelIdParam !== undefined && isNaN(modelId!)) {
    res.status(400).json({ error: 'Parameter modelId tidak valid.' });
    return;
  }

  const where: {
    merekId?: number;
    modelId?: number;
    OR?: Array<{ kode?: { contains: string }; deskripsi?: { contains: string } }>;
  } = {};
  if (merekId !== undefined) where.merekId = merekId;
  if (modelId !== undefined) where.modelId = modelId;
  if (search) {
    where.OR = [
      { kode: { contains: search } },
      { deskripsi: { contains: search } },
    ];
  }

  const kodeMILList = await prisma.kodeMIL.findMany({
    where,
    orderBy: [{ merek: { nama: 'asc' } }, { kode: 'asc' }],
    include: {
      merek: { select: { id: true, nama: true } },
      model: { select: { id: true, nama: true } },
      _count: { select: { basisAturan: true } },
    },
  });

  res.json({ data: kodeMILList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/kode-mil
// Tambah kode MIL baru — validasi unik per (kode, merekId, modelId)
// Kebutuhan: 10.2
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { kode, deskripsi, merekId, modelId, aktif } = req.body as {
    kode?: unknown;
    deskripsi?: unknown;
    merekId?: unknown;
    modelId?: unknown;
    aktif?: unknown;
  };

  if (!kode || typeof kode !== 'string' || kode.trim() === '') {
    res.status(400).json({ error: 'Kode MIL wajib diisi.' });
    return;
  }
  if (!deskripsi || typeof deskripsi !== 'string' || deskripsi.trim() === '') {
    res.status(400).json({ error: 'Deskripsi kode MIL wajib diisi.' });
    return;
  }
  if (!merekId) {
    res.status(400).json({ error: 'merekId wajib diisi.' });
    return;
  }

  const merekIdNum = Number(merekId);
  if (isNaN(merekIdNum)) {
    res.status(400).json({ error: 'merekId harus berupa angka.' });
    return;
  }

  const modelIdNum = modelId !== undefined && modelId !== null ? Number(modelId) : undefined;
  if (modelId !== undefined && modelId !== null && isNaN(modelIdNum!)) {
    res.status(400).json({ error: 'modelId harus berupa angka.' });
    return;
  }

  const kodeTrim = kode.trim();

  // Pastikan merek ada
  const merek = await prisma.merek.findUnique({ where: { id: merekIdNum } });
  if (!merek) {
    res.status(404).json({ error: 'Merek tidak ditemukan.' });
    return;
  }

  // Pastikan model ada jika diberikan
  if (modelIdNum !== undefined) {
    const model = await prisma.model.findUnique({ where: { id: modelIdNum } });
    if (!model) {
      res.status(404).json({ error: 'Model tidak ditemukan.' });
      return;
    }
    if (model.merekId !== merekIdNum) {
      res.status(400).json({ error: 'Model tidak termasuk dalam merek yang dipilih.' });
      return;
    }
  }

  // Cek duplikasi (kode, merekId, modelId) — unique constraint
  const existing = await prisma.kodeMIL.findFirst({
    where: {
      kode: { equals: kodeTrim },
      merekId: merekIdNum,
      modelId: modelIdNum ?? null,
    },
  });

  if (existing) {
    res.status(409).json({
      error: `Kode MIL "${kodeTrim}" sudah terdaftar untuk merek dan model yang sama.`,
    });
    return;
  }

  const kodeBaru = await prisma.kodeMIL.create({
    data: {
      kode: kodeTrim,
      deskripsi: (deskripsi as string).trim(),
      merekId: merekIdNum,
      modelId: modelIdNum ?? null,
      aktif: aktif !== undefined ? Boolean(aktif) : true,
    },
    include: {
      merek: { select: { id: true, nama: true } },
      model: { select: { id: true, nama: true } },
    },
  });

  res.status(201).json({ data: kodeBaru });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/kode-mil/:id
// Edit kode MIL — validasi duplikasi (kecuali diri sendiri)
// Kebutuhan: 10.4
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID kode MIL tidak valid.' });
    return;
  }

  const { kode, deskripsi, merekId, modelId, aktif } = req.body as {
    kode?: unknown;
    deskripsi?: unknown;
    merekId?: unknown;
    modelId?: unknown;
    aktif?: unknown;
  };

  if (kode !== undefined && (typeof kode !== 'string' || kode.trim() === '')) {
    res.status(400).json({ error: 'Kode MIL tidak boleh kosong.' });
    return;
  }

  const existing = await prisma.kodeMIL.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Kode MIL tidak ditemukan.' });
    return;
  }

  const targetMerekId = merekId !== undefined ? Number(merekId) : existing.merekId;
  if (isNaN(targetMerekId)) {
    res.status(400).json({ error: 'merekId harus berupa angka.' });
    return;
  }

  // Tentukan modelId target: jika dikirim null berarti hapus relasi model
  let targetModelId: number | null;
  if (modelId === undefined) {
    targetModelId = existing.modelId;
  } else if (modelId === null) {
    targetModelId = null;
  } else {
    targetModelId = Number(modelId);
    if (isNaN(targetModelId)) {
      res.status(400).json({ error: 'modelId harus berupa angka.' });
      return;
    }
  }

  // Validasi merek jika berubah
  if (merekId !== undefined && targetMerekId !== existing.merekId) {
    const merek = await prisma.merek.findUnique({ where: { id: targetMerekId } });
    if (!merek) {
      res.status(404).json({ error: 'Merek tidak ditemukan.' });
      return;
    }
  }

  // Validasi model jika diberikan
  if (targetModelId !== null) {
    const model = await prisma.model.findUnique({ where: { id: targetModelId } });
    if (!model) {
      res.status(404).json({ error: 'Model tidak ditemukan.' });
      return;
    }
    if (model.merekId !== targetMerekId) {
      res.status(400).json({ error: 'Model tidak termasuk dalam merek yang dipilih.' });
      return;
    }
  }

  const kodeTrim = kode !== undefined ? (kode as string).trim() : existing.kode;

  // Cek duplikasi (kecuali diri sendiri)
  const duplicate = await prisma.kodeMIL.findFirst({
    where: {
      kode: { equals: kodeTrim },
      merekId: targetMerekId,
      modelId: targetModelId,
      NOT: { id },
    },
  });

  if (duplicate) {
    res.status(409).json({
      error: `Kode MIL "${kodeTrim}" sudah terdaftar untuk merek dan model yang sama.`,
    });
    return;
  }

  const dataUpdate: {
    kode?: string;
    deskripsi?: string;
    merekId?: number;
    modelId?: number | null;
    aktif?: boolean;
  } = {};
  if (kode !== undefined) dataUpdate.kode = kodeTrim;
  if (deskripsi !== undefined) dataUpdate.deskripsi = (deskripsi as string).trim();
  if (merekId !== undefined) dataUpdate.merekId = targetMerekId;
  if (modelId !== undefined) dataUpdate.modelId = targetModelId;
  if (aktif !== undefined) dataUpdate.aktif = Boolean(aktif);

  const updated = await prisma.kodeMIL.update({
    where: { id },
    data: dataUpdate,
    include: {
      merek: { select: { id: true, nama: true } },
      model: { select: { id: true, nama: true } },
    },
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/kode-mil/:id
// Hapus kode MIL — cek apakah direferensikan basis aturan aktif
// Kebutuhan: 10.3
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID kode MIL tidak valid.' });
    return;
  }

  const kodeMIL = await prisma.kodeMIL.findUnique({
    where: { id },
    include: {
      _count: { select: { basisAturan: true } },
    },
  });

  if (!kodeMIL) {
    res.status(404).json({ error: 'Kode MIL tidak ditemukan.' });
    return;
  }

  // Cek apakah ada basis aturan aktif yang mereferensikan kode MIL ini
  const jumlahAturanAktif = await prisma.basisAturan.count({
    where: { kodeMILId: id, aktif: true },
  });

  if (jumlahAturanAktif > 0) {
    res.status(409).json({
      error: `Kode MIL "${kodeMIL.kode}" tidak dapat dihapus karena masih direferensikan oleh ${jumlahAturanAktif} basis aturan aktif.`,
      jumlahAturanAktif,
    });
    return;
  }

  await prisma.kodeMIL.delete({ where: { id } });

  res.json({ pesan: `Kode MIL "${kodeMIL.kode}" berhasil dihapus.` });
});

export default router;
