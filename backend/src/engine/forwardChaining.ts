/**
 * Mesin Inferensi Forward Chaining
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Fungsi murni (pure function) tanpa side effect — dapat diuji secara unit
 * dan property-based tanpa perlu mocking database.
 */

import { BasisAturan, HasilDiagnosis } from './types';

/**
 * Menjalankan algoritma Forward Chaining terhadap basis aturan yang diberikan.
 *
 * @param faktaKodeMIL - Array kode MIL (string) yang diinput pengguna
 * @param aturan - Array BasisAturan yang sudah di-load dari database
 * @returns Array HasilDiagnosis, diurutkan berdasarkan jumlah kodesMILPemicu secara descending
 *
 * Kebutuhan: 5.1, 5.3, 5.4, 5.5, 6.3
 */
export function forwardChaining(
  faktaKodeMIL: string[],
  aturan: BasisAturan[]
): HasilDiagnosis[] {
  // Working memory: set kode MIL yang diketahui
  const workingMemory = new Set<string>(faktaKodeMIL);

  // Map kerusakanId -> HasilDiagnosis untuk akumulasi hasil
  const hasilAkhir = new Map<number, HasilDiagnosis>();

  // Agenda: filter aturan yang kode MIL-nya ada di working memory dan aturan aktif
  const agenda = aturan.filter(
    (a) => a.aktif && workingMemory.has(a.kodeMIL.kode)
  );

  // Iterasi agenda
  for (const aturanSaatIni of agenda) {
    const kerusakanId = aturanSaatIni.kerusakanId;
    const kodeMIL = aturanSaatIni.kodeMIL.kode;
    const gejala = aturanSaatIni.gejala;

    if (!hasilAkhir.has(kerusakanId)) {
      // Inisialisasi entri baru untuk kerusakan ini
      hasilAkhir.set(kerusakanId, {
        kerusakan: aturanSaatIni.kerusakan,
        gejala: [],
        kodesMILPemicu: [],
        bobot: 0,
      });
    }

    const hasil = hasilAkhir.get(kerusakanId)!;

    // Tambahkan kode MIL pemicu (hindari duplikat)
    if (!hasil.kodesMILPemicu.includes(kodeMIL)) {
      hasil.kodesMILPemicu.push(kodeMIL);
    }

    // Tambahkan gejala (hindari duplikat berdasarkan id)
    const gejalaExists = hasil.gejala.some((g) => g.id === gejala.id);
    if (!gejalaExists) {
      hasil.gejala.push(gejala);
    }

    // Akumulasi bobot
    hasil.bobot += aturanSaatIni.bobot;
  }

  // Kembalikan hasil diurutkan berdasarkan jumlah kodesMILPemicu DESC
  return Array.from(hasilAkhir.values()).sort(
    (a, b) => b.kodesMILPemicu.length - a.kodesMILPemicu.length
  );
}
