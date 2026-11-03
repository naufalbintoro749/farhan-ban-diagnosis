/**
 * Middleware autentikasi JWT untuk rute admin
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 7.4
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './tokenBlacklist';

export interface AdminJwtPayload {
  adminId: number;
  email: string;
}

// Extend Request to carry the decoded admin payload
declare global {
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token autentikasi tidak ditemukan.' });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  if (isTokenBlacklisted(token)) {
    res.status(401).json({ error: 'Token sudah tidak aktif. Silakan login kembali.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET tidak dikonfigurasi di environment.');
    }

    const payload = jwt.verify(token, secret) as AdminJwtPayload;
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
  }
}
