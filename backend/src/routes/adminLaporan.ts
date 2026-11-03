/**
 * Rute admin: Laporan Diagnosis (Cetak PDF)
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 11.5
 */

import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Semua rute di bawah memerlukan JWT
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// Tipe untuk hasilDiagnosis yang tersimpan di DB (Json field Prisma)
// ---------------------------------------------------------------------------
interface HasilDiagnosisItem {
  namaKerusakan?: string;
  nama?: string;
  kerusakan?: { nama?: string };
  [key: string]: unknown;
}

interface DiagnosisRow {
  id: number;
  namaPengguna?: string | null;
  noTelepon?: string | null;
  createdAt: Date;
  kodeMILInput: string[];
  hasilDiagnosis: unknown;
  model: {
    nama: string;
    merek: { nama: string };
  };
}

// ---------------------------------------------------------------------------
// POST /api/admin/laporan/cetak
// Menghasilkan PDF berisi riwayat diagnosis yang dipilih
//
// Body: { ids: number[] } — array ID Diagnosis yang akan dimasukkan ke laporan
//
// Response: PDF binary stream
//   Content-Type: application/pdf
//   Content-Disposition: attachment; filename="laporan-diagnosis-{timestamp}.pdf"
//
// Kebutuhan: 11.5
// ---------------------------------------------------------------------------
router.post('/cetak', async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body;

  // --- Validasi: ids harus berupa array non-kosong ---
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({
      error: 'Field "ids" harus berupa array non-kosong yang berisi ID diagnosis.',
    });
    return;
  }

  // --- Validasi: setiap elemen harus berupa bilangan bulat positif ---
  const invalidEntry = ids.find(
    (id) => typeof id !== 'number' || !Number.isInteger(id) || id <= 0,
  );
  if (invalidEntry !== undefined) {
    res.status(400).json({
      error: 'Setiap elemen dalam "ids" harus berupa bilangan bulat positif.',
    });
    return;
  }

  // --- Ambil data diagnosis dari DB ---
  const rawList = await prisma.diagnosis.findMany({
    where: { id: { in: ids as number[] } },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      namaPengguna: true,
      noTelepon: true,
      createdAt: true,
      kodeMILInput: true,
      hasilDiagnosis: true,
      model: {
        select: {
          nama: true,
          merek: {
            select: { nama: true },
          },
        },
      },
    },
  });

  const diagnosisList: DiagnosisRow[] = rawList.map((d: typeof rawList[number]) => {
    let parsedKode: string[] = [];
    try {
      const parsed = JSON.parse(d.kodeMILInput);
      parsedKode = Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      parsedKode = d.kodeMILInput ? [d.kodeMILInput] : [];
    }

    let parsedHasil: unknown = d.hasilDiagnosis;
    try {
      parsedHasil = JSON.parse(d.hasilDiagnosis);
    } catch {
      parsedHasil = d.hasilDiagnosis;
    }

    return {
      ...d,
      kodeMILInput: parsedKode,
      hasilDiagnosis: parsedHasil,
    };
  });

  if (diagnosisList.length === 0) {
    res.status(404).json({
      error: 'Tidak ada data diagnosis yang ditemukan untuk ID yang diberikan.',
    });
    return;
  }

  // --- Buat timestamp untuk nama file ---
  const timestamp = Date.now();
  const filename = `laporan-diagnosis-${timestamp}.pdf`;

  // --- Set header respons ---
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // --- Buat dokumen PDF ---
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe stream PDF ke respons HTTP
  doc.pipe(res);

  // -------------------------------------------------------------------------
  // HEADER LAPORAN
  // -------------------------------------------------------------------------
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('Laporan Diagnosis Kerusakan Sepeda Motor', { align: 'center' });

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Farhan Motor', { align: 'center' });

  doc.moveDown(0.5);

  // Tanggal pembuatan laporan
  const tanggalCetak = new Date().toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Tanggal Cetak: ${tanggalCetak}`, { align: 'center' });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Jumlah Rekaman: ${diagnosisList.length}`, { align: 'center' });

  // Garis pemisah
  doc.moveDown(0.5);
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.5);

  // -------------------------------------------------------------------------
  // ISI LAPORAN — setiap entri diagnosis
  // -------------------------------------------------------------------------
  diagnosisList.forEach((diagnosis, index) => {
    // Cek apakah perlu halaman baru (jika sisa ruang kurang dari 150 pt)
    if (doc.y > doc.page.height - 200 && index > 0) {
      doc.addPage();
    }

    const nomorUrut = index + 1;
    const tanggalDiagnosis = new Date(diagnosis.createdAt).toLocaleString('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    });

    // Sub-header entri
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`${nomorUrut}. Diagnosis #${diagnosis.id}`, { continued: false });

    // Detail entri
    doc.fontSize(10).font('Helvetica');

    doc.text(`   Tanggal       : ${tanggalDiagnosis}`);
    if (diagnosis.namaPengguna) {
      doc.text(`   Pemilik Motor : ${diagnosis.namaPengguna}${diagnosis.noTelepon ? ' (' + diagnosis.noTelepon + ')' : ''}`);
    }
    doc.text(`   Merek         : ${diagnosis.model.merek.nama}`);
    doc.text(`   Model         : ${diagnosis.model.nama}`);
    doc.text(`   Kode MIL Input: ${diagnosis.kodeMILInput.join(', ')}`);

    // Hasil diagnosis — ekstrak nama kerusakan dari field JSON
    const hasilRaw = diagnosis.hasilDiagnosis;
    let namaKerusakanList: string[] = [];

    if (Array.isArray(hasilRaw)) {
      namaKerusakanList = (hasilRaw as HasilDiagnosisItem[])
        .map((item) => {
          // Coba field namaKerusakan, lalu kerusakan.nama, lalu nama
          if (typeof item.namaKerusakan === 'string') return item.namaKerusakan;
          if (item.kerusakan && typeof item.kerusakan.nama === 'string') {
            return item.kerusakan.nama;
          }
          if (typeof item.nama === 'string') return item.nama;
          return null;
        })
        .filter((n): n is string => n !== null);
    }

    if (namaKerusakanList.length > 0) {
      doc.text(`   Hasil Diagnosis:`);
      namaKerusakanList.forEach((nama, i) => {
        doc.text(`     ${i + 1}. ${nama}`);
      });
    } else {
      doc.text(`   Hasil Diagnosis: Tidak ada kerusakan teridentifikasi`);
    }

    doc.moveDown(0.5);

    // Garis pemisah antar entri (kecuali entri terakhir)
    if (index < diagnosisList.length - 1) {
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .lineWidth(0.5)
        .dash(3, { space: 3 })
        .stroke();
      doc.undash();
      doc.moveDown(0.5);
    }
  });

  // -------------------------------------------------------------------------
  // FOOTER
  // -------------------------------------------------------------------------
  doc.moveDown(1);
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.5);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('gray')
    .text('Laporan ini dicetak secara otomatis oleh Sistem Pakar Diagnosis Kerusakan Sepeda Motor — Farhan Motor.', {
      align: 'center',
    });

  // Selesai — tutup dokumen (otomatis flush ke respons)
  doc.end();
});

export default router;
