/**
 * Rute CRUD admin: Akun Admin (Pengguna)
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 9.1, 9.5
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const SALT_ROUNDS = 10;

// Semua rute di bawah memerlukan JWT
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /api/admin/pengguna
// Daftar semua akun admin (tanpa passwordHash)
// Kebutuhan: 9.1
// ---------------------------------------------------------------------------
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const penggunaList = await prisma.admin.findMany({
    orderBy: { nama: 'asc' },
    select: {
      id: true,
      email: true,
      nama: true,
      loginAttempts: true,
      lockedUntil: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ data: penggunaList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/pengguna
// Tambah akun admin baru — hash kata sandi sebelum disimpan
// Kebutuhan: 9.1, 9.5
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { email, nama, password } = req.body as {
    email?: unknown;
    nama?: unknown;
    password?: unknown;
  };

  if (!email || typeof email !== 'string' || email.trim() === '') {
    res.status(400).json({ error: 'Email wajib diisi.' });
    return;
  }

  if (!nama || typeof nama !== 'string' || nama.trim() === '') {
    res.status(400).json({ error: 'Nama wajib diisi.' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Kata sandi wajib diisi dan minimal 6 karakter.' });
    return;
  }

  const emailTrim = email.trim().toLowerCase();

  // Cek duplikasi email
  const existing = await prisma.admin.findUnique({ where: { email: emailTrim } });
  if (existing) {
    res.status(409).json({ error: `Akun dengan email "${emailTrim}" sudah terdaftar.` });
    return;
  }

  // Hash kata sandi
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const pengguna = await prisma.admin.create({
    data: {
      email: emailTrim,
      nama: nama.trim(),
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      nama: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(201).json({ data: pengguna });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/pengguna/:id
// Edit akun admin — hash kata sandi baru jika diberikan
// Kebutuhan: 9.1, 9.5
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID pengguna tidak valid.' });
    return;
  }

  const { email, nama, password } = req.body as {
    email?: unknown;
    nama?: unknown;
    password?: unknown;
  };

  if (email !== undefined && (typeof email !== 'string' || email.trim() === '')) {
    res.status(400).json({ error: 'Email tidak boleh kosong.' });
    return;
  }

  if (nama !== undefined && (typeof nama !== 'string' || nama.trim() === '')) {
    res.status(400).json({ error: 'Nama tidak boleh kosong.' });
    return;
  }

  if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
    res.status(400).json({ error: 'Kata sandi minimal 6 karakter.' });
    return;
  }

  const pengguna = await prisma.admin.findUnique({ where: { id } });
  if (!pengguna) {
    res.status(404).json({ error: 'Akun pengguna tidak ditemukan.' });
    return;
  }

  // Cek duplikasi email (kecuali diri sendiri)
  if (email !== undefined) {
    const emailTrim = (email as string).trim().toLowerCase();
    const existing = await prisma.admin.findFirst({
      where: { email: emailTrim, NOT: { id } },
    });
    if (existing) {
      res.status(409).json({ error: `Email "${emailTrim}" sudah digunakan akun lain.` });
      return;
    }
  }

  const dataUpdate: {
    email?: string;
    nama?: string;
    passwordHash?: string;
    loginAttempts?: number;
    lockedUntil?: null;
  } = {};

  if (email !== undefined) dataUpdate.email = (email as string).trim().toLowerCase();
  if (nama !== undefined) dataUpdate.nama = (nama as string).trim();
  if (password !== undefined) {
    dataUpdate.passwordHash = await bcrypt.hash(password as string, SALT_ROUNDS);
  }

  const updated = await prisma.admin.update({
    where: { id },
    data: dataUpdate,
    select: {
      id: true,
      email: true,
      nama: true,
      loginAttempts: true,
      lockedUntil: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/pengguna/:id
// Hapus akun admin — tidak boleh menghapus akun sendiri
// Kebutuhan: 9.1
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID pengguna tidak valid.' });
    return;
  }

  // Cegah admin menghapus akunnya sendiri
  if (req.admin && req.admin.adminId === id) {
    res.status(400).json({ error: 'Tidak dapat menghapus akun Anda sendiri.' });
    return;
  }

  const pengguna = await prisma.admin.findUnique({ where: { id } });
  if (!pengguna) {
    res.status(404).json({ error: 'Akun pengguna tidak ditemukan.' });
    return;
  }

  await prisma.admin.delete({ where: { id } });

  res.json({ pesan: `Akun "${pengguna.email}" berhasil dihapus.` });
});

export default router;
