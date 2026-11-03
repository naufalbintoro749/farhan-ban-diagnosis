/**
 * Rute CRUD admin: Solusi
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
// GET /api/admin/solusi
// Daftar semua solusi (opsional filter ?search=)
// Kebutuhan: 10.1, 10.5
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const searchParam = req.query.search;
  const search = searchParam && typeof searchParam === 'string' ? searchParam.trim() : undefined;

  const where: {
    OR?: Array<{ langkah?: { contains: string } }>;
  } = {};
  if (search) {
    where.OR = [
      { langkah: { contains: search } },
    ];
  }

  const solusiList = await prisma.solusi.findMany({
    where,
    orderBy: [{ urutan: 'asc' }, { id: 'asc' }],
    include: {
      _count: { select: { kerusakan: true } },
    },
  });

  res.json({ data: solusiList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/solusi
// Tambah solusi baru
// Kebutuhan: 10.2
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { langkah, urutan } = req.body as { langkah?: unknown; urutan?: unknown };

  if (!langkah || typeof langkah !== 'string' || langkah.trim() === '') {
    res.status(400).json({ error: 'Langkah solusi wajib diisi.' });
    return;
  }

  if (urutan === undefined || urutan === null) {
    res.status(400).json({ error: 'Urutan solusi wajib diisi.' });
    return;
  }

  const urutanNum = Number(urutan);
  if (isNaN(urutanNum) || !Number.isInteger(urutanNum) || urutanNum < 1) {
    res.status(400).json({ error: 'Urutan harus berupa bilangan bulat positif.' });
    return;
  }

  const solusiBaru = await prisma.solusi.create({
    data: {
      langkah: langkah.trim(),
      urutan: urutanNum,
    },
  });

  res.status(201).json({ data: solusiBaru });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/solusi/:id
// Edit solusi
// Kebutuhan: 10.4
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID solusi tidak valid.' });
    return;
  }

  const { langkah, urutan } = req.body as { langkah?: unknown; urutan?: unknown };

  if (langkah !== undefined && (typeof langkah !== 'string' || langkah.trim() === '')) {
    res.status(400).json({ error: 'Langkah solusi tidak boleh kosong.' });
    return;
  }

  if (urutan !== undefined) {
    const urutanNum = Number(urutan);
    if (isNaN(urutanNum) || !Number.isInteger(urutanNum) || urutanNum < 1) {
      res.status(400).json({ error: 'Urutan harus berupa bilangan bulat positif.' });
      return;
    }
  }

  const solusi = await prisma.solusi.findUnique({ where: { id } });
  if (!solusi) {
    res.status(404).json({ error: 'Solusi tidak ditemukan.' });
    return;
  }

  const dataUpdate: { langkah?: string; urutan?: number } = {};
  if (langkah !== undefined) dataUpdate.langkah = (langkah as string).trim();
  if (urutan !== undefined) dataUpdate.urutan = Number(urutan);

  const updated = await prisma.solusi.update({
    where: { id },
    data: dataUpdate,
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/solusi/:id
// Hapus solusi — cek apakah terhubung ke kerusakan yang direferensikan basis aturan aktif
// Kebutuhan: 10.3
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID solusi tidak valid.' });
    return;
  }

  const solusi = await prisma.solusi.findUnique({
    where: { id },
    include: { _count: { select: { kerusakan: true } } },
  });

  if (!solusi) {
    res.status(404).json({ error: 'Solusi tidak ditemukan.' });
    return;
  }

  // Cek apakah solusi ini terhubung ke kerusakan yang masih direferensikan basis aturan aktif
  const kerusakanTerkait = await prisma.kerusakanSolusi.findMany({
    where: { solusiId: id },
    select: { kerusakanId: true },
  });

  if (kerusakanTerkait.length > 0) {
    const kerusakanIds = kerusakanTerkait.map((k: { kerusakanId: number }) => k.kerusakanId);
    const jumlahAturanAktif = await prisma.basisAturan.count({
      where: { kerusakanId: { in: kerusakanIds }, aktif: true },
    });

    if (jumlahAturanAktif > 0) {
      res.status(409).json({
        error: `Solusi ini tidak dapat dihapus karena terhubung ke kerusakan yang masih direferensikan oleh ${jumlahAturanAktif} basis aturan aktif.`,
        jumlahAturanAktif,
      });
      return;
    }
  }

  await prisma.solusi.delete({ where: { id } });

  res.json({ pesan: `Solusi berhasil dihapus.` });
});

export default router;
