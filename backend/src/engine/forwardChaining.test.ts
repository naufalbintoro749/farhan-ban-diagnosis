/**
 * Unit test dan property-based test untuk fungsi forwardChaining
 * Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL) - Farhan Motor
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { forwardChaining } from './forwardChaining';
import { BasisAturan } from './types';

// ─── Fixture Helper ────────────────────────────────────────────────────────────

function buatAturan(overrides: Partial<BasisAturan> & {
  id: number;
  kodeMILKode: string;
  kerusakanId: number;
  kerusakanNama: string;
}): BasisAturan {
  return {
    id: overrides.id,
    kodeMILId: overrides.id,
    gejalaid: overrides.id,
    kerusakanId: overrides.kerusakanId,
    bobot: overrides.bobot ?? 1.0,
    aktif: overrides.aktif ?? true,
    kodeMIL: {
      id: overrides.id,
      kode: overrides.kodeMILKode,
      deskripsi: `Deskripsi kode ${overrides.kodeMILKode}`,
      merekId: 1,
      modelId: null,
    },
    gejala: {
      id: overrides.id,
      nama: `Gejala ${overrides.id}`,
      deskripsi: null,
    },
    kerusakan: {
      id: overrides.kerusakanId,
      nama: overrides.kerusakanNama,
      deskripsi: null,
      komponen: [],
      solusi: [],
    },
  };
}

// ─── Test Cases ────────────────────────────────────────────────────────────────

describe('forwardChaining', () => {
  it('mengembalikan array kosong jika tidak ada aturan', () => {
    const hasil = forwardChaining(['1'], []);
    expect(hasil).toEqual([]);
  });

  it('mengembalikan array kosong jika kode MIL tidak cocok aturan manapun', () => {
    const aturan: BasisAturan[] = [
      buatAturan({ id: 1, kodeMILKode: '12', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
    ];
    const hasil = forwardChaining(['99'], aturan);
    expect(hasil).toEqual([]);
  });

  it('mengembalikan kerusakan yang cocok dengan kode MIL', () => {
    const aturan: BasisAturan[] = [
      buatAturan({ id: 1, kodeMILKode: '12', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
    ];
    const hasil = forwardChaining(['12'], aturan);
    expect(hasil).toHaveLength(1);
    expect(hasil[0].kerusakan.nama).toBe('Kerusakan A');
    expect(hasil[0].kodesMILPemicu).toContain('12');
  });

  it('mengabaikan aturan yang tidak aktif', () => {
    const aturan: BasisAturan[] = [
      buatAturan({ id: 1, kodeMILKode: '12', kerusakanId: 1, kerusakanNama: 'Kerusakan A', aktif: false }),
    ];
    const hasil = forwardChaining(['12'], aturan);
    expect(hasil).toEqual([]);
  });

  it('menggabungkan beberapa kode MIL pemicu untuk satu kerusakan', () => {
    const aturan: BasisAturan[] = [
      buatAturan({ id: 1, kodeMILKode: '12', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
      buatAturan({ id: 2, kodeMILKode: '21', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
    ];
    const hasil = forwardChaining(['12', '21'], aturan);
    expect(hasil).toHaveLength(1);
    expect(hasil[0].kodesMILPemicu).toHaveLength(2);
    expect(hasil[0].kodesMILPemicu).toContain('12');
    expect(hasil[0].kodesMILPemicu).toContain('21');
  });

  it('mengembalikan beberapa kerusakan jika banyak aturan cocok', () => {
    const aturan: BasisAturan[] = [
      buatAturan({ id: 1, kodeMILKode: '12', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
      buatAturan({ id: 2, kodeMILKode: '21', kerusakanId: 2, kerusakanNama: 'Kerusakan B' }),
    ];
    const hasil = forwardChaining(['12', '21'], aturan);
    expect(hasil).toHaveLength(2);
  });

  it('mengurutkan hasil berdasarkan jumlah kodesMILPemicu secara descending', () => {
    const aturan: BasisAturan[] = [
      // Kerusakan B hanya 1 pemicu
      buatAturan({ id: 1, kodeMILKode: '12', kerusakanId: 2, kerusakanNama: 'Kerusakan B' }),
      // Kerusakan A memiliki 2 pemicu
      buatAturan({ id: 2, kodeMILKode: '21', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
      buatAturan({ id: 3, kodeMILKode: '33', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
    ];
    const hasil = forwardChaining(['12', '21', '33'], aturan);
    expect(hasil).toHaveLength(2);
    // Kerusakan A (2 pemicu) harus di indeks 0
    expect(hasil[0].kerusakan.nama).toBe('Kerusakan A');
    expect(hasil[0].kodesMILPemicu).toHaveLength(2);
    // Kerusakan B (1 pemicu) harus di indeks 1
    expect(hasil[1].kerusakan.nama).toBe('Kerusakan B');
    expect(hasil[1].kodesMILPemicu).toHaveLength(1);
  });

  it('mengembalikan array kosong jika faktaKodeMIL kosong', () => {
    const aturan: BasisAturan[] = [
      buatAturan({ id: 1, kodeMILKode: '12', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
    ];
    const hasil = forwardChaining([], aturan);
    expect(hasil).toEqual([]);
  });

  it('tidak menduplikat kode MIL pemicu meski ada beberapa aturan dengan kode sama', () => {
    const aturan: BasisAturan[] = [
      buatAturan({ id: 1, kodeMILKode: '12', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
      buatAturan({ id: 2, kodeMILKode: '12', kerusakanId: 1, kerusakanNama: 'Kerusakan A' }),
    ];
    const hasil = forwardChaining(['12'], aturan);
    expect(hasil[0].kodesMILPemicu).toHaveLength(1);
  });
});

// ─── Arbitraries (Generators) ─────────────────────────────────────────────────

/** Hasilkan kode MIL acak berupa string angka 1–2 digit */
const arbKodeMIL = fc.integer({ min: 1, max: 99 }).map((n) => String(n));

/** Hasilkan array kode MIL unik */
const arbKodeMILArray = fc.uniqueArray(arbKodeMIL, { minLength: 1, maxLength: 8 });

/** Hasilkan satu BasisAturan dari kumpulan kode MIL dan kerusakan yang tersedia */
function arbAturan(kodePool: string[], kerusakanPool: number[]): fc.Arbitrary<BasisAturan> {
  return fc
    .tuple(
      fc.constantFrom(...kodePool),
      fc.constantFrom(...kerusakanPool),
      fc.integer({ min: 1, max: 9999 }),
      fc.integer({ min: 1, max: 50 }),
      fc.boolean(),
    )
    .map(([kode, kerusakanId, id, gejalaid, aktif]) => ({
      id,
      kodeMILId: id,
      gejalaid,
      kerusakanId,
      bobot: 1.0,
      aktif,
      kodeMIL: {
        id,
        kode,
        deskripsi: `Deskripsi ${kode}`,
        merekId: 1,
        modelId: null,
      },
      gejala: {
        id: gejalaid,
        nama: `Gejala ${gejalaid}`,
        deskripsi: null,
      },
      kerusakan: {
        id: kerusakanId,
        nama: `Kerusakan ${kerusakanId}`,
        deskripsi: null,
        komponen: [],
        solusi: [],
      },
    }));
}

/** Hasilkan pasangan (faktaKodeMIL, aturan) yang realistis */
const arbFaktaDanAturan = fc
  .tuple(
    arbKodeMILArray,
    fc.uniqueArray(fc.integer({ min: 1, max: 10 }), { minLength: 1, maxLength: 5 }),
    fc.uniqueArray(arbKodeMIL, { minLength: 1, maxLength: 8 }),
  )
  .chain(([fakta, kerusakanPool, extraKodes]) => {
    const allKodes = [...new Set([...fakta, ...extraKodes])];
    return fc
      .array(arbAturan(allKodes, kerusakanPool), { minLength: 0, maxLength: 20 })
      .map((aturan) => ({ fakta, aturan }));
  });

// ─── Property-Based Tests ─────────────────────────────────────────────────────

describe('forwardChaining — property-based tests', () => {
  it(
    // Feature: sistem-pakar-mil-motor, Property 1: Forward Chaining hanya menghasilkan kerusakan relevan
    'Properti 1: semua kerusakan output memiliki minimal satu kode MIL pemicu dari input',
    () => {
      fc.assert(
        fc.property(arbFaktaDanAturan, ({ fakta, aturan }) => {
          const faktaSet = new Set(fakta);
          const hasil = forwardChaining(fakta, aturan);
          for (const h of hasil) {
            const adaPemicuDariInput = h.kodesMILPemicu.some((k) => faktaSet.has(k));
            if (!adaPemicuDariInput) return false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    }
  );

  it(
    // Feature: sistem-pakar-mil-motor, Property 2: Kode MIL tanpa aturan menghasilkan hasil kosong
    'Properti 2: kode MIL yang tidak ada di aturan manapun menghasilkan array kosong',
    () => {
      fc.assert(
        fc.property(
          arbKodeMILArray,
          fc.uniqueArray(arbKodeMIL, { minLength: 1, maxLength: 5 }),
          fc.uniqueArray(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 3 }),
          (fakta, aturanKodes, kerusakanPool) => {
            // Pastikan tidak ada irisan antara fakta dan kode di aturan
            const aturanKodesSet = new Set(aturanKodes);
            const faktaTanpaAturan = fakta.filter((k) => !aturanKodesSet.has(k));
            if (faktaTanpaAturan.length === 0) return true; // skip jika tidak ada kode yang benar-benar asing

            const aturan = aturanKodes.map((kode, idx) =>
              buatAturan({
                id: idx + 1,
                kodeMILKode: kode,
                kerusakanId: kerusakanPool[idx % kerusakanPool.length],
                kerusakanNama: `Kerusakan ${kerusakanPool[idx % kerusakanPool.length]}`,
              })
            );

            const hasil = forwardChaining(faktaTanpaAturan, aturan);
            return hasil.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    // Feature: sistem-pakar-mil-motor, Property 3: Forward Chaining bersifat idempoten
    'Properti 3: dua panggilan dengan input sama menghasilkan output identik',
    () => {
      fc.assert(
        fc.property(arbFaktaDanAturan, ({ fakta, aturan }) => {
          const hasil1 = forwardChaining(fakta, aturan);
          const hasil2 = forwardChaining(fakta, aturan);
          return JSON.stringify(hasil1) === JSON.stringify(hasil2);
        }),
        { numRuns: 100 }
      );
    }
  );

  it(
    // Feature: sistem-pakar-mil-motor, Property 6: Aturan non-aktif tidak memengaruhi hasil
    'Properti 6: kerusakan dari aturan aktif=false tidak boleh muncul di output',
    () => {
      fc.assert(
        fc.property(
          arbKodeMILArray,
          fc.uniqueArray(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 3 }),
          (fakta, kerusakanPool) => {
            // Buat aturan yang semuanya non-aktif untuk kerusakan eksklusif
            const kerusakanNonAktifId = 9999;
            const aturanNonAktif = fakta.map((kode, idx) =>
              buatAturan({
                id: idx + 1,
                kodeMILKode: kode,
                kerusakanId: kerusakanNonAktifId,
                kerusakanNama: 'Kerusakan Non-Aktif',
                aktif: false,
              })
            );

            const hasil = forwardChaining(fakta, aturanNonAktif);
            return !hasil.some((h) => h.kerusakan.id === kerusakanNonAktifId);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it(
    // Feature: sistem-pakar-mil-motor, Property 7: Pengurutan hasil berdasarkan jumlah pemicu
    'Properti 7: kerusakan pertama memiliki jumlah pemicu >= kerusakan berikutnya',
    () => {
      fc.assert(
        fc.property(arbFaktaDanAturan, ({ fakta, aturan }) => {
          const hasil = forwardChaining(fakta, aturan);
          for (let i = 0; i < hasil.length - 1; i++) {
            if (hasil[i].kodesMILPemicu.length < hasil[i + 1].kodesMILPemicu.length) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    }
  );
});
