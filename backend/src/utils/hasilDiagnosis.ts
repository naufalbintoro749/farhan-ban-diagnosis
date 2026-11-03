/**
 * Tipe `HasilDiagnosis` dan fungsi serialisasi/deserialisasi JSON
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 *
 * Kebutuhan: 5.6, 6.1
 */

import { HasilDiagnosis } from '../engine/types';

// Re-export agar konsumen cukup import dari satu tempat
export type { HasilDiagnosis };

/**
 * Menyerialkan satu objek HasilDiagnosis ke string JSON.
 */
export function serializeHasilDiagnosis(hasil: HasilDiagnosis): string {
  return JSON.stringify(hasil);
}

/**
 * Menyerialkan array HasilDiagnosis ke string JSON.
 */
export function serializeHasilDiagnosisArray(
  hasilArray: HasilDiagnosis[]
): string {
  return JSON.stringify(hasilArray);
}

/**
 * Mendeserialisasi string JSON menjadi objek HasilDiagnosis.
 * Melempar Error jika string bukan JSON valid atau strukturnya tidak sesuai.
 */
export function deserializeHasilDiagnosis(json: string): HasilDiagnosis {
  const parsed: unknown = JSON.parse(json);
  return validateHasilDiagnosis(parsed);
}

/**
 * Mendeserialisasi string JSON menjadi array HasilDiagnosis.
 */
export function deserializeHasilDiagnosisArray(
  json: string
): HasilDiagnosis[] {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new Error('Data bukan array HasilDiagnosis yang valid.');
  }
  return parsed.map((item) => validateHasilDiagnosis(item));
}

/**
 * Memvalidasi dan memastikan objek mentah memiliki struktur HasilDiagnosis.
 * Melempar Error jika struktur tidak sesuai.
 */
function validateHasilDiagnosis(raw: unknown): HasilDiagnosis {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('HasilDiagnosis harus berupa objek.');
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj['bobot'] !== 'number') {
    throw new Error('Field "bobot" harus berupa number.');
  }
  if (!Array.isArray(obj['kodesMILPemicu'])) {
    throw new Error('Field "kodesMILPemicu" harus berupa array.');
  }
  if (!Array.isArray(obj['gejala'])) {
    throw new Error('Field "gejala" harus berupa array.');
  }
  if (typeof obj['kerusakan'] !== 'object' || obj['kerusakan'] === null) {
    throw new Error('Field "kerusakan" harus berupa objek.');
  }

  return raw as HasilDiagnosis;
}
