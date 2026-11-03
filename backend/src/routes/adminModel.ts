/**
 * Rute CRUD admin: Model Motor
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 9.1, 9.2, 9.3, 9.6
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Semua rute di bawah memerlukan JWT
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /api/admin/model
// Daftar semua model (opsional filter ?merekId=)
// Kebutuhan: 9.1
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const merekIdParam = req.query.merekId;
  const merekId = merekIdParam ? parseInt(merekIdParam as string, 10) : undefined;

  if (merekIdParam !== undefined && isNaN(merekId!)) {
    res.status(400).json({ error: 'Parameter merekId tidak valid.' });
    return;
  }

  const modelList = await prisma.model.findMany({
    where: merekId !== undefined ? { merekId } : undefined,
    orderBy: [{ merek: { nama: 'asc' } }, { nama: 'asc' }],
    include: {
      merek: { select: { id: true, nama: true } },
      _count: { select: { diagnosis: true } },
    },
  });

  res.json({ data: modelList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/model
// Tambah model baru — validasi merekId ada dan duplikasi nama per merek
// Kebutuhan: 9.2, 9.6
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { nama, merekId, aktif } = req.body as {
    nama?: unknown;
    merekId?: unknown;
    aktif?: unknown;
  };

  if (!nama || typeof nama !== 'string' || nama.trim() === '') {
    res.status(400).json({ error: 'Nama model wajib diisi.' });
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

  const namaTrim = nama.trim();

  // Pastikan merek ada
  const merek = await prisma.merek.findUnique({ where: { id: merekIdNum } });
  if (!merek) {
    res.status(404).json({ error: 'Merek tidak ditemukan.' });
    return;
  }

  // Cek duplikasi nama dalam merek yang sama (case-insensitive)
  const existing = await prisma.model.findFirst({
    where: {
      merekId: merekIdNum,
      nama: { equals: namaTrim },
    },
  });

  if (existing) {
    res.status(409).json({
      error: `Model dengan nama "${namaTrim}" sudah terdaftar untuk merek "${merek.nama}".`,
    });
    return;
  }

  const modelBaru = await prisma.model.create({
    data: {
      nama: namaTrim,
      merekId: merekIdNum,
      aktif: aktif !== undefined ? Boolean(aktif) : true,
    },
    include: { merek: { select: { id: true, nama: true } } },
  });

  res.status(201).json({ data: modelBaru });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/model/:id
// Edit model — validasi duplikasi nama per merek (kecuali diri sendiri)
// Kebutuhan: 9.3, 9.6
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID model tidak valid.' });
    return;
  }

  const { nama, merekId, aktif } = req.body as {
    nama?: unknown;
    merekId?: unknown;
    aktif?: unknown;
  };

  if (nama !== undefined && (typeof nama !== 'string' || nama.trim() === '')) {
    res.status(400).json({ error: 'Nama model tidak boleh kosong.' });
    return;
  }

  const model = await prisma.model.findUnique({ where: { id } });
  if (!model) {
    res.status(404).json({ error: 'Model tidak ditemukan.' });
    return;
  }

  const targetMerekId =
    merekId !== undefined ? Number(merekId) : model.merekId;

  if (isNaN(targetMerekId)) {
    res.status(400).json({ error: 'merekId harus berupa angka.' });
    return;
  }

  // Jika merekId berubah, pastikan merek tujuan ada
  if (merekId !== undefined && targetMerekId !== model.merekId) {
    const merekTujuan = await prisma.merek.findUnique({
      where: { id: targetMerekId },
    });
    if (!merekTujuan) {
      res.status(404).json({ error: 'Merek tujuan tidak ditemukan.' });
      return;
    }
  }

  const namaTrim = nama !== undefined ? (nama as string).trim() : model.nama;

  // Cek duplikasi nama dalam merek target (kecuali diri sendiri)
  const existing = await prisma.model.findFirst({
    where: {
      merekId: targetMerekId,
      nama: { equals: namaTrim },
      NOT: { id },
    },
  });

  if (existing) {
    res.status(409).json({
      error: `Model dengan nama "${namaTrim}" sudah terdaftar untuk merek tersebut.`,
    });
    return;
  }

  const dataUpdate: { nama?: string; merekId?: number; aktif?: boolean } = {};
  if (nama !== undefined) dataUpdate.nama = namaTrim;
  if (merekId !== undefined) dataUpdate.merekId = targetMerekId;
  if (aktif !== undefined) dataUpdate.aktif = Boolean(aktif);

  const updated = await prisma.model.update({
    where: { id },
    data: dataUpdate,
    include: { merek: { select: { id: true, nama: true } } },
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/model/:id
// Hapus model
// Kebutuhan: 9.1
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID model tidak valid.' });
    return;
  }

  const model = await prisma.model.findUnique({ where: { id } });
  if (!model) {
    res.status(404).json({ error: 'Model tidak ditemukan.' });
    return;
  }

  await prisma.model.delete({ where: { id } });

  res.json({ pesan: `Model "${model.nama}" berhasil dihapus.` });
});

export default router;
