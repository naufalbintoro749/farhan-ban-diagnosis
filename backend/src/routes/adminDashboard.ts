/**
 * Rute admin: Dashboard Statistik
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 8.1, 8.2, 8.3, 8.4
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Memerlukan JWT
router.use(authMiddleware);

router.get('/statistik', async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total diagnosis
    const totalDiagnosis = await prisma.diagnosis.count();

    // 2. Ambil diagnosis 30 hari terakhir untuk tren dan statistik
    const tigaPuluhHariLalu = new Date();
    tigaPuluhHariLalu.setDate(tigaPuluhHariLalu.getDate() - 30);
    tigaPuluhHariLalu.setHours(0, 0, 0, 0);

    const semuaDiagnosis = await prisma.diagnosis.findMany({
      include: {
        model: {
          include: {
            merek: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Distribusi per merek
    const distribusiMap: Record<string, number> = {};
    const kodeMILCount: Record<string, number> = {};

    semuaDiagnosis.forEach((diag) => {
      const merekNama = diag.model?.merek?.nama || 'Lainnya';
      distribusiMap[merekNama] = (distribusiMap[merekNama] || 0) + 1;

      // Hitung frekuensi kode MIL
      let parsedKodeArray: string[] = [];
      if (Array.isArray(diag.kodeMILInput)) {
        parsedKodeArray = diag.kodeMILInput;
      } else if (typeof diag.kodeMILInput === 'string') {
        try {
          const parsed = JSON.parse(diag.kodeMILInput);
          parsedKodeArray = Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          parsedKodeArray = diag.kodeMILInput ? [diag.kodeMILInput] : [];
        }
      }

      parsedKodeArray.forEach((kode) => {
        kodeMILCount[kode] = (kodeMILCount[kode] || 0) + 1;
      });
    });

    const distribusiMerek = Object.entries(distribusiMap).map(([nama, jumlah]) => ({
      nama,
      jumlah,
    }));

    // 5 kode MIL teratas
    const topKodeMIL = Object.entries(kodeMILCount)
      .map(([kode, jumlah]) => ({ kode, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);

    // Tren harian 30 hari terakhir
    const trenMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      trenMap[key] = 0;
    }

    semuaDiagnosis.forEach((diag) => {
      const key = diag.createdAt.toISOString().split('T')[0];
      if (trenMap[key] !== undefined) {
        trenMap[key] += 1;
      }
    });

    const trenHarian = Object.entries(trenMap).map(([tanggal, jumlah]) => ({
      tanggal,
      jumlah,
    }));

    res.json({
      data: {
        totalDiagnosis,
        distribusiMerek,
        topKodeMIL,
        trenHarian,
      },
    });
  } catch (error) {
    console.error('Error fetching statistik dashboard:', error);
    res.status(500).json({ error: 'Gagal memuat statistik dashboard.' });
  }
});

export default router;
