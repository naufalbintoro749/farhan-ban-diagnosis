/**
 * Rute CRUD admin: Komponen
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
// GET /api/admin/komponen
// Daftar semua komponen (opsional filter ?search=)
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

  const komponenList = await prisma.komponen.findMany({
    where,
    orderBy: { nama: 'asc' },
    include: {
      _count: { select: { kerusakan: true } },
    },
  });

  res.json({ data: komponenList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/komponen
// Tambah komponen baru — validasi nama unik
// Kebutuhan: 10.2
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { nama, deskripsi } = req.body as { nama?: unknown; deskripsi?: unknown };

  if (!nama || typeof nama !== 'string' || nama.trim() === '') {
    res.status(400).json({ error: 'Nama komponen wajib diisi.' });
    return;
  }

  const namaTrim = nama.trim();

  // Cek duplikasi (case-insensitive)
  const existing = await prisma.komponen.findFirst({
    where: { nama: { equals: namaTrim } },
  });

  if (existing) {
    res.status(409).json({
      error: `Komponen dengan nama "${namaTrim}" sudah terdaftar.`,
    });
    return;
  }

  const komponenBaru = await prisma.komponen.create({
    data: {
      nama: namaTrim,
      deskripsi: deskripsi && typeof deskripsi === 'string' ? deskripsi.trim() : null,
    },
  });

  res.status(201).json({ data: komponenBaru });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/komponen/:id
// Edit komponen — validasi nama unik (kecuali diri sendiri)
// Kebutuhan: 10.4
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID komponen tidak valid.' });
    return;
  }

  const { nama, deskripsi } = req.body as { nama?: unknown; deskripsi?: unknown };

  if (nama !== undefined && (typeof nama !== 'string' || nama.trim() === '')) {
    res.status(400).json({ error: 'Nama komponen tidak boleh kosong.' });
    return;
  }

  const komponen = await prisma.komponen.findUnique({ where: { id } });
  if (!komponen) {
    res.status(404).json({ error: 'Komponen tidak ditemukan.' });
    return;
  }

  const namaTrim = nama !== undefined ? (nama as string).trim() : komponen.nama;

  // Cek duplikasi nama (kecuali diri sendiri)
  if (nama !== undefined) {
    const existing = await prisma.komponen.findFirst({
      where: {
        nama: { equals: namaTrim },
        NOT: { id },
      },
    });
    if (existing) {
      res.status(409).json({
        error: `Komponen dengan nama "${namaTrim}" sudah terdaftar.`,
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

  const updated = await prisma.komponen.update({
    where: { id },
    data: dataUpdate,
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/komponen/:id
// Hapus komponen — cek apakah masih terhubung ke kerusakan aktif via BasisAturan
// Kebutuhan: 10.3
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID komponen tidak valid.' });
    return;
  }

  const komponen = await prisma.komponen.findUnique({
    where: { id },
    include: { _count: { select: { kerusakan: true } } },
  });

  if (!komponen) {
    res.status(404).json({ error: 'Komponen tidak ditemukan.' });
    return;
  }

  // Cek apakah komponen ini terhubung ke kerusakan yang masih direferensikan basis aturan aktif
  const kerusakanTerkait = await prisma.kerusakanKomponen.findMany({
    where: { komponenId: id },
    select: { kerusakanId: true },
  });

  if (kerusakanTerkait.length > 0) {
    const kerusakanIds = kerusakanTerkait.map((k: { kerusakanId: number }) => k.kerusakanId);
    const jumlahAturanAktif = await prisma.basisAturan.count({
      where: { kerusakanId: { in: kerusakanIds }, aktif: true },
    });

    if (jumlahAturanAktif > 0) {
      res.status(409).json({
        error: `Komponen "${komponen.nama}" tidak dapat dihapus karena terhubung ke kerusakan yang masih direferensikan oleh ${jumlahAturanAktif} basis aturan aktif.`,
        jumlahAturanAktif,
      });
      return;
    }
  }

  await prisma.komponen.delete({ where: { id } });

  res.json({ pesan: `Komponen "${komponen.nama}" berhasil dihapus.` });
});

export default router;
