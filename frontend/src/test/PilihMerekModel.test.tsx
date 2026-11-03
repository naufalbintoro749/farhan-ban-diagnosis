import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PilihMerekModel } from '../components/PilihMerekModel';
import * as client from '../api/client';

describe('PilihMerekModel Component (Task 14.2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('memuat daftar merek dan menampilkan dropdown bertingkat', async () => {
    vi.spyOn(client, 'getMerek').mockResolvedValue([
      { id: 1, nama: 'Honda' },
      { id: 2, nama: 'Yamaha' },
    ]);

    vi.spyOn(client, 'getModelByMerek').mockImplementation(async (id: number) => {
      if (id === 1) {
        return {
          merek: { id: 1, nama: 'Honda' },
          data: [
            { id: 101, nama: 'Beat Fi' },
            { id: 102, nama: 'Vario 150' },
          ],
        };
      }
      return {
        merek: { id: 2, nama: 'Yamaha' },
        data: [{ id: 201, nama: 'NMAX 155' }],
      };
    });

    const onSelectMerek = vi.fn();
    const onSelectModel = vi.fn();

    const { rerender } = render(
      <PilihMerekModel
        selectedMerekId={null}
        selectedModelId={null}
        onSelectMerek={onSelectMerek}
        onSelectModel={onSelectModel}
      />
    );

    // Pastikan options merek dimuat
    await waitFor(() => {
      expect(screen.getByText('Honda')).toBeInTheDocument();
      expect(screen.getByText('Yamaha')).toBeInTheDocument();
    });

    // Pilih merek Honda
    const selectMerek = screen.getByTestId('select-merek');
    fireEvent.change(selectMerek, { target: { value: '1' } });

    expect(onSelectMerek).toHaveBeenCalledWith(1, 'Honda');

    // Rerender dengan selectedMerekId = 1
    rerender(
      <PilihMerekModel
        selectedMerekId={1}
        selectedModelId={null}
        onSelectMerek={onSelectMerek}
        onSelectModel={onSelectModel}
      />
    );

    // Pastikan model untuk Honda dimuat
    await waitFor(() => {
      expect(screen.getByText('Beat Fi')).toBeInTheDocument();
      expect(screen.getByText('Vario 150')).toBeInTheDocument();
    });

    // Pilih model Beat Fi
    const selectModel = screen.getByTestId('select-model');
    fireEvent.change(selectModel, { target: { value: '101' } });

    expect(onSelectModel).toHaveBeenCalledWith(101, 'Beat Fi');
  });

  it('menampilkan pesan peringatan jika merek tidak memiliki model terdaftar (Kebutuhan 3.4)', async () => {
    vi.spyOn(client, 'getMerek').mockResolvedValue([{ id: 3, nama: 'Suzuki' }]);
    vi.spyOn(client, 'getModelByMerek').mockResolvedValue({
      merek: { id: 3, nama: 'Suzuki' },
      data: [],
    });

    render(
      <PilihMerekModel
        selectedMerekId={3}
        selectedModelId={null}
        onSelectMerek={vi.fn()}
        onSelectModel={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('pesan-model-kosong')).toBeInTheDocument();
      expect(
        screen.getByText(/Belum ada data model sepeda motor yang terdaftar/i)
      ).toBeInTheDocument();
    });
  });
});
