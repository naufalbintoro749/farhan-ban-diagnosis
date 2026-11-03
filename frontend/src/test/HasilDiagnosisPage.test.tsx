import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HasilDiagnosisPage from '../pages/HasilDiagnosisPage';

describe('HasilDiagnosisPage Component (Task 16.3)', () => {
  it('merender pesan kosong jika tidak ada data sesi diagnosis', () => {
    render(
      <MemoryRouter initialEntries={['/diagnosis/hasil']}>
        <HasilDiagnosisPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Data Diagnosis Tidak Ditemukan/i)
    ).toBeInTheDocument();
  });

  it('merender seluruh field hasil diagnosis (kode MIL, kerusakan, komponen, solusi)', () => {
    const mockState = {
      merekNama: 'Honda',
      modelNama: 'Beat Fi',
      kodeMIL: ['7', '12'],
      result: {
        ditemukan: true,
        hasil: [
          {
            kerusakan: {
              id: 1,
              nama: 'Kerusakan Sensor EOT / ECT',
              deskripsi: 'Sensor temperatur oli mesin mengalami kegagalan sinyal.',
            },
            gejala: { id: 10, nama: 'Mesin sulit dihidupkan saat dingin' },
            kodesMILPemicu: ['7'],
            komponen: [
              { id: 100, nama: 'Sensor EOT', deskripsi: 'Engine Oil Temperature' },
            ],
            solusi: [
              { id: 1000, langkah: 'Periksa kabel dan soket sensor EOT', urutan: 1 },
              { id: 1001, langkah: 'Ganti sensor EOT jika resistansi di luar spesifikasi', urutan: 2 },
            ],
          },
        ],
      },
    };

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/diagnosis/hasil',
            state: mockState,
          },
        ]}
      >
        <HasilDiagnosisPage />
      </MemoryRouter>
    );

    // Verifikasi Merek dan Model
    expect(screen.getByText('Honda')).toBeInTheDocument();
    expect(screen.getByText('Beat Fi')).toBeInTheDocument();

    // Verifikasi Kode MIL Input
    expect(screen.getByText('Kode 7')).toBeInTheDocument();
    expect(screen.getByText('Kode 12')).toBeInTheDocument();

    // Verifikasi Nama Kerusakan dan Deskripsi
    expect(screen.getByText('Kerusakan Sensor EOT / ECT')).toBeInTheDocument();
    expect(
      screen.getByText(/Sensor temperatur oli mesin mengalami kegagalan sinyal/i)
    ).toBeInTheDocument();

    // Verifikasi Gejala
    expect(screen.getByText('Mesin sulit dihidupkan saat dingin')).toBeInTheDocument();

    // Verifikasi Komponen
    expect(screen.getByText('Sensor EOT')).toBeInTheDocument();

    // Verifikasi Solusi Perbaikan Berurutan
    expect(
      screen.getByText('Periksa kabel dan soket sensor EOT')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ganti sensor EOT jika resistansi di luar spesifikasi')
    ).toBeInTheDocument();

    // Verifikasi Tombol Cetak & Diagnosis Baru
    expect(screen.getByTestId('btn-cetak-hasil')).toBeInTheDocument();
  });
});
