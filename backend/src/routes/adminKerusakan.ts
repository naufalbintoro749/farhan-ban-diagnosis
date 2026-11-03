/**
 * Rute CRUD admin: Kerusakan
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
// GET /api/admin/kerusakan
// Daftar semua kerusakan (opsional filter ?search=)
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

  const kerusakanList = await prisma.kerusakan.findMany({
    where,
    orderBy: { nama: 'asc' },
    include: {
      _count: { select: { basisAturan: true } },
      komponen: {
        include: { komponen: { select: { id: true, nama: true } } },
      },
      solusi: {
        include: { solusi: { select: { id: true, langkah: true, urutan: true } } },
        orderBy: { solusi: { urutan: 'asc' } },
      },
    },
  });

  res.json({ data: kerusakanList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/kerusakan
// Tambah kerusakan baru — validasi nama unik
// Kebutuhan: 10.2
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { nama, deskripsi } = req.body as { nama?: unknown; deskripsi?: unknown };

  if (!nama || typeof nama !== 'string' || nama.trim() === '') {
    res.status(400).json({ error: 'Nama kerusakan wajib diisi.' });
    return;
  }

  const namaTrim = nama.trim();

  // Cek duplikasi (case-insensitive)
  const existing = await prisma.kerusakan.findFirst({
    where: { nama: { equals: namaTrim } },
  });

  if (existing) {
    res.status(409).json({
      error: `Kerusakan dengan nama "${namaTrim}" sudah terdaftar.`,
    });
    return;
  }

  const kerusakanBaru = await prisma.kerusakan.create({
    data: {
      nama: namaTrim,
      deskripsi: deskripsi && typeof deskripsi === 'string' ? deskripsi.trim() : null,
    },
  });

  res.status(201).json({ data: kerusakanBaru });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/kerusakan/:id
// Edit kerusakan — validasi nama unik (kecuali diri sendiri)
// Kebutuhan: 10.4
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID kerusakan tidak valid.' });
    return;
  }

  const { nama, deskripsi } = req.body as { nama?: unknown; deskripsi?: unknown };

  if (nama !== undefined && (typeof nama !== 'string' || nama.trim() === '')) {
    res.status(400).json({ error: 'Nama kerusakan tidak boleh kosong.' });
    return;
  }

  const kerusakan = await prisma.kerusakan.findUnique({ where: { id } });
  if (!kerusakan) {
    res.status(404).json({ error: 'Kerusakan tidak ditemukan.' });
    return;
  }

  const namaTrim = nama !== undefined ? (nama as string).trim() : kerusakan.nama;

  // Cek duplikasi nama (kecuali diri sendiri)
  if (nama !== undefined) {
    const existing = await prisma.kerusakan.findFirst({
      where: {
        nama: { equals: namaTrim },
        NOT: { id },
      },
    });
    if (existing) {
      res.status(409).json({
        error: `Kerusakan dengan nama "${namaTrim}" sudah terdaftar.`,
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

  const updated = await prisma.kerusakan.update({
    where: { id },
    data: dataUpdate,
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/kerusakan/:id
// Hapus kerusakan — cek apakah direferensikan basis aturan aktif
// Kebutuhan: 10.3
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID kerusakan tidak valid.' });
    return;
  }

  const kerusakan = await prisma.kerusakan.findUnique({ where: { id } });
  if (!kerusakan) {
    res.status(404).json({ error: 'Kerusakan tidak ditemukan.' });
    return;
  }

  // Cek apakah ada basis aturan aktif yang mereferensikan kerusakan ini
  const jumlahAturanAktif = await prisma.basisAturan.count({
    where: { kerusakanId: id, aktif: true },
  });

  if (jumlahAturanAktif > 0) {
    res.status(409).json({
      error: `Kerusakan "${kerusakan.nama}" tidak dapat dihapus karena masih direferensikan oleh ${jumlahAturanAktif} basis aturan aktif.`,
      jumlahAturanAktif,
    });
    return;
  }

  await prisma.kerusakan.delete({ where: { id } });

  res.json({ pesan: `Kerusakan "${kerusakan.nama}" berhasil dihapus.` });
});

export default router;
