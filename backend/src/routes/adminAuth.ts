/**
 * Rute autentikasi admin: login & logout
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 7.2, 7.3, 7.5, 7.6
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';
import { addToBlacklist } from '../middleware/tokenBlacklist';

const router = Router();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 menit

/**
 * POST /api/admin/login
 * Verifikasi kredensial admin, buat JWT, tangani penguncian akun.
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) {
    // Jangan ungkap apakah email terdaftar atau tidak
    res.status(401).json({ error: 'Email atau kata sandi salah.' });
    return;
  }

  // Cek apakah akun sedang terkunci
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    const sisaDetik = Math.ceil(
      (admin.lockedUntil.getTime() - Date.now()) / 1000
    );
    const sisaMenit = Math.ceil(sisaDetik / 60);
    res.status(403).json({
      error: `Akun terkunci sementara. Coba lagi dalam ${sisaMenit} menit.`,
      lockedUntil: admin.lockedUntil.toISOString(),
    });
    return;
  }

  const passwordCocok = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordCocok) {
    const attempts = admin.loginAttempts + 1;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      // Kunci akun selama 15 menit
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
        },
      });
      res.status(403).json({
        error:
          'Akun terkunci sementara selama 15 menit karena terlalu banyak percobaan gagal.',
      });
    } else {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { loginAttempts: attempts },
      });
      res.status(401).json({
        error: 'Email atau kata sandi salah.',
        percobaan: attempts,
        maksimalPercobaan: MAX_LOGIN_ATTEMPTS,
      });
    }
    return;
  }

  // Login berhasil — reset counter & buat token
  await prisma.admin.update({
    where: { id: admin.id },
    data: { loginAttempts: 0, lockedUntil: null },
  });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Konfigurasi server tidak lengkap.' });
    return;
  }

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email },
    secret,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, nama: admin.nama },
  });
});

/**
 * POST /api/admin/logout
 * Endpoint logout — client menghapus token dari penyimpanannya.
 * Server-side: token di-blacklist di memori sesi.
 *
 * Kebutuhan: 7.5
 */

router.post(
  '/logout',
  authMiddleware,
  (req: Request, res: Response): void => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      addToBlacklist(token);
    }
    res.json({ pesan: 'Logout berhasil.' });
  }
);

export default router;
