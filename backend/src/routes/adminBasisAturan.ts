/**
 * Rute CRUD admin: Basis Aturan
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 11.1, 11.2, 11.6
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Semua rute di bawah memerlukan JWT
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// GET /api/admin/basis-aturan
// Daftar semua aturan IF-THEN (include kodeMIL, gejala, kerusakan)
// Filter opsional: ?search= (nama gejala atau kerusakan), ?aktif= (true/false)
// Kebutuhan: 11.1
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const searchParam = req.query.search;
  const aktifParam = req.query.aktif;

  const search =
    searchParam && typeof searchParam === 'string' ? searchParam.trim() : undefined;

  // Parse ?aktif filter — abaikan jika bukan 'true' atau 'false'
  let aktifFilter: boolean | undefined;
  if (aktifParam === 'true') aktifFilter = true;
  else if (aktifParam === 'false') aktifFilter = false;

  const where: {
    aktif?: boolean;
    OR?: Array<{
      gejala?: { nama: { contains: string } };
      kerusakan?: { nama: { contains: string } };
    }>;
  } = {};

  if (aktifFilter !== undefined) where.aktif = aktifFilter;

  if (search) {
    where.OR = [
      { gejala: { nama: { contains: search } } },
      { kerusakan: { nama: { contains: search } } },
    ];
  }

  const aturanList = await prisma.basisAturan.findMany({
    where,
    orderBy: [{ kodeMIL: { kode: 'asc' } }, { id: 'asc' }],
    include: {
      kodeMIL: {
        select: {
          id: true,
          kode: true,
          deskripsi: true,
          merek: { select: { id: true, nama: true } },
          model: { select: { id: true, nama: true } },
        },
      },
      gejala: { select: { id: true, nama: true, deskripsi: true } },
      kerusakan: { select: { id: true, nama: true, deskripsi: true } },
    },
  });

  res.json({ data: aturanList });
});

// ---------------------------------------------------------------------------
// POST /api/admin/basis-aturan
// Tambah aturan baru
// Field wajib: kodeMILId, gejalaid, kerusakanId
// Field opsional: bobot (default 1.0), aktif (default true)
// Validasi: kodeMILId, gejalaid, kerusakanId harus ada di data master
// Validasi: kombinasi (kodeMILId + kerusakanId + gejalaid) harus unik
// Kebutuhan: 11.2
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { kodeMILId, gejalaid, kerusakanId, bobot, aktif } = req.body as {
    kodeMILId?: unknown;
    gejalaid?: unknown;
    kerusakanId?: unknown;
    bobot?: unknown;
    aktif?: unknown;
  };

  // Validasi field wajib
  if (kodeMILId === undefined || kodeMILId === null) {
    res.status(400).json({ error: 'kodeMILId wajib diisi.' });
    return;
  }
  if (gejalaid === undefined || gejalaid === null) {
    res.status(400).json({ error: 'gejalaid wajib diisi.' });
    return;
  }
  if (kerusakanId === undefined || kerusakanId === null) {
    res.status(400).json({ error: 'kerusakanId wajib diisi.' });
    return;
  }

  const kodeMILIdNum = Number(kodeMILId);
  const gejalaIdNum = Number(gejalaid);
  const kerusakanIdNum = Number(kerusakanId);

  if (isNaN(kodeMILIdNum) || kodeMILIdNum <= 0) {
    res.status(400).json({ error: 'kodeMILId harus berupa angka positif.' });
    return;
  }
  if (isNaN(gejalaIdNum) || gejalaIdNum <= 0) {
    res.status(400).json({ error: 'gejalaid harus berupa angka positif.' });
    return;
  }
  if (isNaN(kerusakanIdNum) || kerusakanIdNum <= 0) {
    res.status(400).json({ error: 'kerusakanId harus berupa angka positif.' });
    return;
  }

  // Validasi bobot jika diberikan
  let bobotNum = 1.0;
  if (bobot !== undefined && bobot !== null) {
    bobotNum = Number(bobot);
    if (isNaN(bobotNum)) {
      res.status(400).json({ error: 'bobot harus berupa angka.' });
      return;
    }
  }

  // Validasi referensi ke data master (paralel)
  const [kodeMIL, gejala, kerusakan] = await Promise.all([
    prisma.kodeMIL.findUnique({ where: { id: kodeMILIdNum } }),
    prisma.gejala.findUnique({ where: { id: gejalaIdNum } }),
    prisma.kerusakan.findUnique({ where: { id: kerusakanIdNum } }),
  ]);

  if (!kodeMIL) {
    res.status(404).json({ error: `Kode MIL dengan ID ${kodeMILIdNum} tidak ditemukan.` });
    return;
  }
  if (!gejala) {
    res.status(404).json({ error: `Gejala dengan ID ${gejalaIdNum} tidak ditemukan.` });
    return;
  }
  if (!kerusakan) {
    res.status(404).json({ error: `Kerusakan dengan ID ${kerusakanIdNum} tidak ditemukan.` });
    return;
  }

  // Cek duplikasi kombinasi (kodeMILId + kerusakanId + gejalaid)
  const existing = await prisma.basisAturan.findFirst({
    where: {
      kodeMILId: kodeMILIdNum,
      gejalaid: gejalaIdNum,
      kerusakanId: kerusakanIdNum,
    },
  });

  if (existing) {
    res.status(409).json({
      error: 'Aturan dengan kombinasi Kode MIL, Gejala, dan Kerusakan yang sama sudah terdaftar.',
    });
    return;
  }

  const aturanBaru = await prisma.basisAturan.create({
    data: {
      kodeMILId: kodeMILIdNum,
      gejalaid: gejalaIdNum,
      kerusakanId: kerusakanIdNum,
      bobot: bobotNum,
      aktif: aktif !== undefined ? Boolean(aktif) : true,
    },
    include: {
      kodeMIL: {
        select: {
          id: true,
          kode: true,
          deskripsi: true,
          merek: { select: { id: true, nama: true } },
          model: { select: { id: true, nama: true } },
        },
      },
      gejala: { select: { id: true, nama: true, deskripsi: true } },
      kerusakan: { select: { id: true, nama: true, deskripsi: true } },
    },
  });

  res.status(201).json({ data: aturanBaru });
});

// ---------------------------------------------------------------------------
// PUT /api/admin/basis-aturan/:id
// Edit aturan — update field manapun dengan validasi referensial
// Kebutuhan: 11.2
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID basis aturan tidak valid.' });
    return;
  }

  const { kodeMILId, gejalaid, kerusakanId, bobot, aktif } = req.body as {
    kodeMILId?: unknown;
    gejalaid?: unknown;
    kerusakanId?: unknown;
    bobot?: unknown;
    aktif?: unknown;
  };

  // Cek aturan yang akan diedit ada
  const aturan = await prisma.basisAturan.findUnique({ where: { id } });
  if (!aturan) {
    res.status(404).json({ error: 'Basis aturan tidak ditemukan.' });
    return;
  }

  // Parse ID baru jika diberikan, atau gunakan nilai lama
  let targetKodeMILId = aturan.kodeMILId;
  let targetGejalaId = aturan.gejalaid;
  let targetKerusakanId = aturan.kerusakanId;

  if (kodeMILId !== undefined && kodeMILId !== null) {
    targetKodeMILId = Number(kodeMILId);
    if (isNaN(targetKodeMILId) || targetKodeMILId <= 0) {
      res.status(400).json({ error: 'kodeMILId harus berupa angka positif.' });
      return;
    }
  }
  if (gejalaid !== undefined && gejalaid !== null) {
    targetGejalaId = Number(gejalaid);
    if (isNaN(targetGejalaId) || targetGejalaId <= 0) {
      res.status(400).json({ error: 'gejalaid harus berupa angka positif.' });
      return;
    }
  }
  if (kerusakanId !== undefined && kerusakanId !== null) {
    targetKerusakanId = Number(kerusakanId);
    if (isNaN(targetKerusakanId) || targetKerusakanId <= 0) {
      res.status(400).json({ error: 'kerusakanId harus berupa angka positif.' });
      return;
    }
  }

  // Validasi bobot jika diberikan
  let targetBobot = aturan.bobot;
  if (bobot !== undefined && bobot !== null) {
    targetBobot = Number(bobot);
    if (isNaN(targetBobot)) {
      res.status(400).json({ error: 'bobot harus berupa angka.' });
      return;
    }
  }

  // Validasi referensi ke data master hanya untuk field yang berubah
  const needsKodeMILCheck = kodeMILId !== undefined && targetKodeMILId !== aturan.kodeMILId;
  const needsGejalaCheck = gejalaid !== undefined && targetGejalaId !== aturan.gejalaid;
  const needsKerusakanCheck =
    kerusakanId !== undefined && targetKerusakanId !== aturan.kerusakanId;

  const [kodeMILRec, gejalaRec, kerusakanRec] = await Promise.all([
    needsKodeMILCheck
      ? prisma.kodeMIL.findUnique({ where: { id: targetKodeMILId } })
      : Promise.resolve(true), // sudah valid (tidak berubah)
    needsGejalaCheck
      ? prisma.gejala.findUnique({ where: { id: targetGejalaId } })
      : Promise.resolve(true),
    needsKerusakanCheck
      ? prisma.kerusakan.findUnique({ where: { id: targetKerusakanId } })
      : Promise.resolve(true),
  ]);

  if (!kodeMILRec) {
    res.status(404).json({ error: `Kode MIL dengan ID ${targetKodeMILId} tidak ditemukan.` });
    return;
  }
  if (!gejalaRec) {
    res.status(404).json({ error: `Gejala dengan ID ${targetGejalaId} tidak ditemukan.` });
    return;
  }
  if (!kerusakanRec) {
    res
      .status(404)
      .json({ error: `Kerusakan dengan ID ${targetKerusakanId} tidak ditemukan.` });
    return;
  }

  // Cek duplikasi kombinasi (kecuali diri sendiri) — hanya jika ada perubahan referensial
  const refChanged =
    targetKodeMILId !== aturan.kodeMILId ||
    targetGejalaId !== aturan.gejalaid ||
    targetKerusakanId !== aturan.kerusakanId;

  if (refChanged) {
    const duplicate = await prisma.basisAturan.findFirst({
      where: {
        kodeMILId: targetKodeMILId,
        gejalaid: targetGejalaId,
        kerusakanId: targetKerusakanId,
        NOT: { id },
      },
    });

    if (duplicate) {
      res.status(409).json({
        error:
          'Aturan dengan kombinasi Kode MIL, Gejala, dan Kerusakan yang sama sudah terdaftar.',
      });
      return;
    }
  }

  const dataUpdate: {
    kodeMILId?: number;
    gejalaid?: number;
    kerusakanId?: number;
    bobot?: number;
    aktif?: boolean;
  } = {};

  if (kodeMILId !== undefined) dataUpdate.kodeMILId = targetKodeMILId;
  if (gejalaid !== undefined) dataUpdate.gejalaid = targetGejalaId;
  if (kerusakanId !== undefined) dataUpdate.kerusakanId = targetKerusakanId;
  if (bobot !== undefined) dataUpdate.bobot = targetBobot;
  if (aktif !== undefined) dataUpdate.aktif = Boolean(aktif);

  const updated = await prisma.basisAturan.update({
    where: { id },
    data: dataUpdate,
    include: {
      kodeMIL: {
        select: {
          id: true,
          kode: true,
          deskripsi: true,
          merek: { select: { id: true, nama: true } },
          model: { select: { id: true, nama: true } },
        },
      },
      gejala: { select: { id: true, nama: true, deskripsi: true } },
      kerusakan: { select: { id: true, nama: true, deskripsi: true } },
    },
  });

  res.json({ data: updated });
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/basis-aturan/:id
// Hapus aturan — butuh konfirmasi eksplisit via body `konfirmasi: true`
// Kebutuhan: 11.6
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID basis aturan tidak valid.' });
    return;
  }

  const { konfirmasi } = req.body as { konfirmasi?: unknown };

  // Kebutuhan 11.6: selalu minta konfirmasi sebelum menghapus aturan
  if (konfirmasi !== true) {
    res.status(400).json({
      error:
        'Penghapusan basis aturan memerlukan konfirmasi. Sertakan `konfirmasi: true` pada body request untuk melanjutkan.',
      perihal: 'Menghapus basis aturan akan memengaruhi hasil diagnosis. Pastikan Anda yakin.',
    });
    return;
  }

  const aturan = await prisma.basisAturan.findUnique({
    where: { id },
    include: {
      kodeMIL: { select: { kode: true } },
      gejala: { select: { nama: true } },
      kerusakan: { select: { nama: true } },
    },
  });

  if (!aturan) {
    res.status(404).json({ error: 'Basis aturan tidak ditemukan.' });
    return;
  }

  await prisma.basisAturan.delete({ where: { id } });

  res.json({
    pesan: `Basis aturan (Kode MIL: ${aturan.kodeMIL.kode}, Gejala: ${aturan.gejala.nama}, Kerusakan: ${aturan.kerusakan.nama}) berhasil dihapus.`,
  });
});

export default router;
