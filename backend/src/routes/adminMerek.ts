/**
 * Rute CRUD admin: Merek
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 9.1, 9.2, 9.3, 9.4, 9.6
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Semua rute di bawah memerlukan JWT
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /api/admin/merek
// Daftar semua merek
// Kebutuhan: 9.1
// ---------------------------------------------------------------------------
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const merekList = await prisma.merek.findMany({
    orderBy: { nama: 'asc' },
    include: { _count: { select: { model: true } } },
  });

  res.json({ data: merekList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/merek
// Tambah merek baru — validasi duplikasi nama
// Kebutuhan: 9.2, 9.6
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { nama } = req.body as { nama?: unknown };

  if (!nama || typeof nama !== 'string' || nama.trim() === '') {
    res.status(400).json({ error: 'Nama merek wajib diisi.' });
    return;
  }

  const namaTrim = nama.trim();

  // Cek duplikasi (case-insensitive)
  const existing = await prisma.merek.findFirst({
    where: { nama: { equals: namaTrim } },
  });

  if (existing) {
    res.status(409).json({ error: `Merek dengan nama "${namaTrim}" sudah terdaftar.` });
    return;
  }

  const merekBaru = await prisma.merek.create({
    data: { nama: namaTrim },
  });

  res.status(201).json({ data: merekBaru });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/merek/:id
// Edit nama/status merek — validasi duplikasi
// Kebutuhan: 9.3, 9.6
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID merek tidak valid.' });
    return;
  }

  const { nama, aktif } = req.body as { nama?: unknown; aktif?: unknown };

  if (nama !== undefined && (typeof nama !== 'string' || nama.trim() === '')) {
    res.status(400).json({ error: 'Nama merek tidak boleh kosong.' });
    return;
  }

  const merek = await prisma.merek.findUnique({ where: { id } });
  if (!merek) {
    res.status(404).json({ error: 'Merek tidak ditemukan.' });
    return;
  }

  const namaTrim = nama !== undefined ? (nama as string).trim() : merek.nama;

  // Cek duplikasi nama (kecuali diri sendiri)
  if (nama !== undefined) {
    const existing = await prisma.merek.findFirst({
      where: {
        nama: { equals: namaTrim },
        NOT: { id },
      },
    });
    if (existing) {
      res.status(409).json({ error: `Merek dengan nama "${namaTrim}" sudah terdaftar.` });
      return;
    }
  }

  const dataUpdate: { nama?: string; aktif?: boolean } = {};
  if (nama !== undefined) dataUpdate.nama = namaTrim;
  if (aktif !== undefined) dataUpdate.aktif = Boolean(aktif);

  const updated = await prisma.merek.update({
    where: { id },
    data: dataUpdate,
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/merek/:id
// Hapus merek — cek apakah masih ada model terdaftar
// Kebutuhan: 9.4
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID merek tidak valid.' });
    return;
  }

  const merek = await prisma.merek.findUnique({
    where: { id },
    include: { _count: { select: { model: true } } },
  });

  if (!merek) {
    res.status(404).json({ error: 'Merek tidak ditemukan.' });
    return;
  }

  if (merek._count.model > 0) {
    res.status(409).json({
      error: `Merek "${merek.nama}" masih memiliki ${merek._count.model} model terdaftar. Hapus semua model terlebih dahulu sebelum menghapus merek.`,
      jumlahModel: merek._count.model,
    });
    return;
  }

  await prisma.merek.delete({ where: { id } });

  res.json({ pesan: `Merek "${merek.nama}" berhasil dihapus.` });
});

export default router;
