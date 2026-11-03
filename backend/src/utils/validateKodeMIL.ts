/**
 * Validasi format kode MIL (Malfunction Indicator Lamp)
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 4.3
 */

/**
 * Rentang kode MIL yang valid per merek.
 * Honda dan Yamaha menggunakan rentang 1–99.
 */
const RENTANG_KODE_PER_MEREK: Record<string, { min: number; max: number }> = {
  honda: { min: 1, max: 99 },
  yamaha: { min: 1, max: 99 },
};

/** Rentang default jika merek tidak dikenal */
const RENTANG_DEFAULT = { min: 1, max: 99 };

export interface HasilValidasiKodeMIL {
  valid: boolean;
  pesan?: string;
}

/**
 * Memvalidasi format dan rentang sebuah kode MIL.
 *
 * Aturan:
 * 1. Kode harus berisi hanya karakter numerik (0-9), tanpa spasi atau simbol.
 * 2. Nilai numeriknya harus berada dalam rentang yang valid untuk merek terkait.
 *
 * @param kode   - String kode MIL yang akan divalidasi
 * @param merek  - Nama merek sepeda motor (opsional, default pakai rentang umum)
 */
export function validateKodeMIL(
  kode: string,
  merek?: string
): HasilValidasiKodeMIL {
  // Harus berupa string non-kosong
  if (typeof kode !== 'string' || kode.trim() === '') {
    return { valid: false, pesan: 'Kode MIL tidak boleh kosong.' };
  }

  // Hanya boleh mengandung digit (0-9) — menolak spasi, huruf, simbol
  if (!/^\d+$/.test(kode)) {
    return {
      valid: false,
      pesan: 'Kode MIL hanya boleh berisi angka.',
    };
  }

  const angka = parseInt(kode, 10);
  const rentang = merek
    ? (RENTANG_KODE_PER_MEREK[merek.toLowerCase()] ?? RENTANG_DEFAULT)
    : RENTANG_DEFAULT;

  if (angka < rentang.min || angka > rentang.max) {
    return {
      valid: false,
      pesan: `Kode MIL harus berada dalam rentang ${rentang.min}–${rentang.max}.`,
    };
  }

  return { valid: true };
}

/**
 * Memvalidasi sebuah array kode MIL sekaligus.
 * Mengembalikan array kode yang tidak valid beserta pesannya.
 */
export function validateKodeMILArray(
  kodes: string[],
  merek?: string
): { kode: string; pesan: string }[] {
  const errors: { kode: string; pesan: string }[] = [];
  for (const kode of kodes) {
    const hasil = validateKodeMIL(kode, merek);
    if (!hasil.valid) {
      errors.push({ kode, pesan: hasil.pesan ?? 'Tidak valid.' });
    }
  }
  return errors;
}
