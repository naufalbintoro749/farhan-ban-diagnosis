/**
 * Tipe data untuk Mesin Inferensi Forward Chaining
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 */

export interface KodeMILData {
  id: number;
  kode: string;
  deskripsi: string;
  merekId: number;
  modelId: number | null;
}

export interface GejalData {
  id: number;
  nama: string;
  deskripsi: string | null;
}

export interface KomponenData {
  id: number;
  nama: string;
  deskripsi: string | null;
}

export interface SolusiData {
  id: number;
  langkah: string;
  urutan: number;
}

export interface KerusakanData {
  id: number;
  nama: string;
  deskripsi: string | null;
  komponen: KomponenData[];
  solusi: SolusiData[];
}

/**
 * Representasi satu baris BasisAturan dari database
 * Berisi relasi yang sudah di-expand (eager loaded)
 */
export interface BasisAturan {
  id: number;
  kodeMILId: number;
  gejalaid: number;
  kerusakanId: number;
  bobot: number;
  aktif: boolean;
  kodeMIL: KodeMILData;
  gejala: GejalData;
  kerusakan: KerusakanData;
}

/**
 * Hasil diagnosis untuk satu kerusakan yang teridentifikasi
 */
export interface HasilDiagnosis {
  kerusakan: KerusakanData;
  gejala: GejalData[];
  kodesMILPemicu: string[];
  bobot: number;
}
