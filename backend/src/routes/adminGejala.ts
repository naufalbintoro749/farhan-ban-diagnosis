/**
 * Rute CRUD admin: Gejala
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
// GET /api/admin/gejala
// Daftar semua gejala (opsional filter ?search=)
// Kebutuhan: 10.1, 10.5
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const searchParam = req.query.search;
  const search = searchParam && typeof searchParam === 'string' ? searchParam.trim() : undefined;

  const where: {
    OR?: Array<{ nama?: { contains: string }; deskripsi?: { contains: string } }>;
  } = {};
  if (search) {
    where.OR = [
      { nama: { contains: search } },
      { deskripsi: { contains: search } },
    ];
  }

  const gejalaList = await prisma.gejala.findMany({
    where,
    orderBy: { nama: 'asc' },
    include: { _count: { select: { basisAturan: true } } },
  });

  res.json({ data: gejalaList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/gejala
// Tambah gejala baru — validasi nama unik
// Kebutuhan: 10.2
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { nama, deskripsi } = req.body as { nama?: unknown; deskripsi?: unknown };

  if (!nama || typeof nama !== 'string' || nama.trim() === '') {
    res.status(400).json({ error: 'Nama gejala wajib diisi.' });
    return;
  }

  const namaTrim = nama.trim();

  // Cek duplikasi (case-insensitive)
  const existing = await prisma.gejala.findFirst({
    where: { nama: { equals: namaTrim } },
  });

  if (existing) {
    res.status(409).json({
      error: `Gejala dengan nama "${namaTrim}" sudah terdaftar.`,
    });
    return;
  }

  const gejalaBaru = await prisma.gejala.create({
    data: {
      nama: namaTrim,
      deskripsi: deskripsi && typeof deskripsi === 'string' ? deskripsi.trim() : null,
    },
  });

  res.status(201).json({ data: gejalaBaru });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/gejala/:id
// Edit gejala — validasi nama unik (kecuali diri sendiri)
// Kebutuhan: 10.4
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID gejala tidak valid.' });
    return;
  }

  const { nama, deskripsi } = req.body as { nama?: unknown; deskripsi?: unknown };

  if (nama !== undefined && (typeof nama !== 'string' || nama.trim() === '')) {
    res.status(400).json({ error: 'Nama gejala tidak boleh kosong.' });
    return;
  }

  const gejala = await prisma.gejala.findUnique({ where: { id } });
  if (!gejala) {
    res.status(404).json({ error: 'Gejala tidak ditemukan.' });
    return;
  }

  const namaTrim = nama !== undefined ? (nama as string).trim() : gejala.nama;

  // Cek duplikasi nama (kecuali diri sendiri)
  if (nama !== undefined) {
    const existing = await prisma.gejala.findFirst({
      where: {
        nama: { equals: namaTrim },
        NOT: { id },
      },
    });
    if (existing) {
      res.status(409).json({
        error: `Gejala dengan nama "${namaTrim}" sudah terdaftar.`,
      });
      return;
    }
  }

  const dataUpdate: { nama?: string; deskripsi?: string | null } = {};
  if (nama !== undefined) dataUpdate.nama = namaTrim;
  if (deskripsi !== undefined) {
    dataUpdate.deskripsi =
      deskripsi && typeof deskripsi === 'string' ? deskripsi.trim() : null;
  }

  const updated = await prisma.gejala.update({
    where: { id },
    data: dataUpdate,
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/gejala/:id
// Hapus gejala — cek apakah direferensikan basis aturan aktif
// Kebutuhan: 10.3
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID gejala tidak valid.' });
    return;
  }

  const gejala = await prisma.gejala.findUnique({ where: { id } });
  if (!gejala) {
    res.status(404).json({ error: 'Gejala tidak ditemukan.' });
    return;
  }

  // Cek apakah ada basis aturan aktif yang mereferensikan gejala ini
  const jumlahAturanAktif = await prisma.basisAturan.count({
    where: { gejalaid: id, aktif: true },
  });

  if (jumlahAturanAktif > 0) {
    res.status(409).json({
      error: `Gejala "${gejala.nama}" tidak dapat dihapus karena masih direferensikan oleh ${jumlahAturanAktif} basis aturan aktif.`,
      jumlahAturanAktif,
    });
    return;
  }

  await prisma.gejala.delete({ where: { id } });

  res.json({ pesan: `Gejala "${gejala.nama}" berhasil dihapus.` });
});

export default router;
