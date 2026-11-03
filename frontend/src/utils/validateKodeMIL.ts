/**
 * Validasi format kode MIL di frontend
 * Sesuai aturan Kebutuhan 4.3 dan Properti 5
 */

const RENTANG_KODE_PER_MEREK: Record<string, { min: number; max: number }> = {
  honda: { min: 1, max: 99 },
  yamaha: { min: 1, max: 99 },
};

const RENTANG_DEFAULT = { min: 1, max: 99 };

export interface HasilValidasiKodeMIL {
  valid: boolean;
  pesan?: string;
}

export function validateKodeMIL(
  kode: string,
  merek?: string
): HasilValidasiKodeMIL {
  if (typeof kode !== 'string' || kode.trim() === '') {
    return { valid: false, pesan: 'Kode MIL tidak boleh kosong.' };
  }

  // Hanya angka numerik
  if (!/^\d+$/.test(kode)) {
    return {
      valid: false,
      pesan: 'Kode MIL hanya boleh berupa angka tanpa huruf atau simbol.',
    };
  }

  const angka = parseInt(kode, 10);
  const rentang = merek
    ? (RENTANG_KODE_PER_MEREK[merek.toLowerCase()] ?? RENTANG_DEFAULT)
    : RENTANG_DEFAULT;

  if (angka < rentang.min || angka > rentang.max) {
    return {
      valid: false,
      pesan: `Kode MIL harus berada dalam rentang angka ${rentang.min}–${rentang.max}.`,
    };
  }

  return { valid: true };
}
