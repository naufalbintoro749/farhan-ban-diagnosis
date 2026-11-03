# Rencana Implementasi: Sistem Pakar Diagnosis Kerusakan Sepeda Motor (MIL)

## Ikhtisar

Implementasi dilakukan secara bertahap — dimulai dari fondasi backend (database + API inti), kemudian logika Forward Chaining, lalu antarmuka pengguna publik, dan terakhir panel administrasi. Setiap tahap dapat divalidasi sebelum melanjutkan ke tahap berikutnya.

## Tugas

- [x] 1. Inisialisasi proyek dan konfigurasi dasar
  - Buat struktur monorepo: folder `backend/` (Node.js + Express) dan `frontend/` (React + Vite)
  - Inisialisasi `package.json` di masing-masing folder
  - Konfigurasi Prisma di `backend/` dengan koneksi PostgreSQL
  - Buat file `.env.example` untuk konfigurasi environment variables
  - _Kebutuhan: Semua modul_

- [x] 2. Buat skema database dan seed data awal
  - [x] 2.1 Definisikan skema Prisma sesuai model data di desain (Merek, Model, KodeMIL, Gejala, Kerusakan, Komponen, Solusi, BasisAturan, Diagnosis, Admin)
    - _Kebutuhan: 3.1, 4.1, 5.1, 9.1, 10.1_
  - [x] 2.2 Buat migration database dari skema Prisma
    - _Kebutuhan: Semua_
  - [x] 2.3 Buat file seed data dengan contoh merek Honda & Yamaha, beberapa model, kode MIL, dan basis aturan contoh
    - _Kebutuhan: 3.1, 4.1, 5.1_
  - [x] 2.4 Buat seed akun admin awal dengan kata sandi ter-hash menggunakan bcrypt
    - _Kebutuhan: 7.1, 9.5_

- [x] 3. Implementasi Mesin Inferensi Forward Chaining
  - [x] 3.1 Buat modul `forwardChaining.ts` di `backend/src/engine/` sebagai pure function yang menerima `faktaKodeMIL: string[]` dan `aturan: BasisAturan[]`, mengembalikan `HasilDiagnosis[]`
    - Implementasikan algoritma sesuai pseudocode di desain (working memory, agenda, iterasi aturan)
    - Urutkan hasil berdasarkan jumlah `kodesMILPemicu` secara descending
    - _Kebutuhan: 5.1, 5.3, 5.4, 5.5, 6.3_
  - [x] 3.2 Tulis property test untuk fungsi `forwardChaining`

    - **Properti 1: Forward Chaining hanya menghasilkan kerusakan relevan** — untuk setiap input, semua kerusakan output memiliki minimal satu kode MIL pemicu dari input
    - **Properti 2: Kode MIL tanpa aturan menghasilkan hasil kosong** — input kode MIL yang tidak ada di aturan manapun mengembalikan array kosong
    - **Properti 3: Forward Chaining bersifat idempoten** — dua panggilan dengan input sama menghasilkan output identik
    - **Properti 6: Aturan non-aktif tidak memengaruhi hasil** — kerusakan dari aturan `aktif=false` tidak boleh muncul di output
    - **Properti 7: Pengurutan hasil berdasarkan jumlah pemicu** — kerusakan pertama memiliki jumlah pemicu >= kerusakan berikutnya
    - _Kebutuhan: 5.1, 5.3, 5.4, 5.5, 6.3_

- [x] 4. Checkpoint — Pastikan mesin inferensi berfungsi benar
  - Pastikan semua test properti untuk `forwardChaining` lolos. Tanyakan kepada pengguna jika ada pertanyaan.

- [x] 5. Implementasi validasi kode MIL dan serialisasi hasil
  - [x] 5.1 Buat modul `validateKodeMIL.ts` di `backend/src/utils/` yang memvalidasi format kode MIL (hanya angka, dalam rentang yang valid per merek)
    - _Kebutuhan: 4.3_
  - [ ]* 5.2 Tulis property test untuk validasi kode MIL
    - **Properti 5: Validasi format kode MIL menolak semua input non-angka** — untuk setiap string yang mengandung karakter non-numerik, fungsi harus mengembalikan status tidak valid
    - _Kebutuhan: 4.3_
  - [x] 5.3 Buat tipe TypeScript `HasilDiagnosis` dan fungsi serialisasi/deserialisasi JSON
    - _Kebutuhan: 5.6, 6.1_
  - [ ]* 5.4 Tulis property test untuk serialisasi `HasilDiagnosis`
    - **Properti 4: Serialisasi hasil diagnosis bersifat round-trip** — `JSON.parse(JSON.stringify(obj))` menghasilkan objek setara
    - _Kebutuhan: 5.6, 6.1_

- [x] 6. Implementasi autentikasi admin
  - [x] 6.1 Buat middleware `authMiddleware.ts` untuk validasi JWT pada semua rute admin
    - _Kebutuhan: 7.4_
  - [x] 6.2 Implementasikan endpoint `POST /api/admin/login` dengan verifikasi bcrypt, pembuatan JWT, dan penanganan penguncian akun setelah 5 percobaan gagal
    - _Kebutuhan: 7.2, 7.3, 7.6_
  - [x] 6.3 Implementasikan endpoint `POST /api/admin/logout` untuk invalidasi token
    - _Kebutuhan: 7.5_
  - [ ]* 6.4 Tulis property test untuk hash kata sandi admin
    - **Properti 8: Hash kata sandi admin bersifat round-trip** — `bcrypt.compare(plaintext, bcrypt.hash(plaintext))` selalu mengembalikan `true`
    - _Kebutuhan: 9.5_
  - [ ]* 6.5 Tulis unit test untuk skenario penguncian akun (5 percobaan gagal → terkunci 15 menit)
    - _Kebutuhan: 7.6_

- [x] 7. Implementasi endpoint API publik
  - [x] 7.1 Buat endpoint `GET /api/merek` yang mengembalikan daftar semua merek aktif
    - _Kebutuhan: 3.1_
  - [x] 7.2 Buat endpoint `GET /api/merek/:id/model` yang mengembalikan model berdasarkan merek
    - _Kebutuhan: 3.2_
  - [x] 7.3 Buat endpoint `POST /api/diagnosis` yang: memvalidasi input, mengambil basis aturan dari DB, memanggil `forwardChaining()`, menyimpan ke `Diagnosis`, dan mengembalikan hasil
    - _Kebutuhan: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ]* 7.4 Tulis unit test untuk endpoint `POST /api/diagnosis` (kasus valid, kode tidak dikenal, input tidak lengkap)
    - _Kebutuhan: 4.3, 4.4, 5.5_

- [x] 8. Implementasi endpoint CRUD admin — Data Master
  - [x] 8.1 Buat endpoint CRUD `GET/POST/PUT/DELETE /api/admin/merek` dengan validasi duplikasi dan cek relasi saat hapus
    - _Kebutuhan: 9.1, 9.2, 9.3, 9.4, 9.6_
  - [x] 8.2 Buat endpoint CRUD `GET/POST/PUT/DELETE /api/admin/model` dengan validasi duplikasi nama per merek
    - _Kebutuhan: 9.1, 9.2, 9.3, 9.6_
  - [x] 8.3 Buat endpoint CRUD `GET/POST/PUT/DELETE /api/admin/pengguna` dengan hashing kata sandi saat tambah/ubah
    - _Kebutuhan: 9.1, 9.5_

- [x] 9. Implementasi endpoint CRUD admin — Data Teknis
  - [x] 9.1 Buat endpoint CRUD untuk `kode-mil`, `gejala`, `kerusakan`, `komponen`, dan `solusi` dengan validasi referensial (tidak bisa hapus jika direferensikan basis aturan aktif)
    - _Kebutuhan: 10.1, 10.2, 10.3, 10.4_
  - [x] 9.2 Tambahkan parameter `search` dan `filter` pada endpoint GET data teknis untuk mendukung pencarian
    - _Kebutuhan: 10.5_

- [x] 10. Implementasi endpoint CRUD admin — Basis Aturan dan Laporan
  - [x] 10.1 Buat endpoint CRUD `GET/POST/PUT/DELETE /api/admin/basis-aturan` dengan validasi bahwa `kodeMILId` dan `kerusakanId` yang dirujuk sudah ada di data master
    - _Kebutuhan: 11.1, 11.2_
  - [x] 10.2 Buat endpoint `GET /api/admin/riwayat` dengan filter tanggal, merek, dan model menggunakan query parameters
    - _Kebutuhan: 11.3, 11.4_
  - [x] 10.3 Buat endpoint `POST /api/admin/laporan/cetak` yang menghasilkan PDF menggunakan library `pdfkit`, berisi data riwayat diagnosis yang dipilih
    - _Kebutuhan: 11.5_
  - [x] 10.4 Buat endpoint `GET /api/admin/dashboard/statistik` yang mengembalikan: total diagnosis, distribusi per merek, 5 kode MIL teratas, dan tren harian 30 hari terakhir
    - _Kebutuhan: 8.1, 8.2, 8.3, 8.4_

- [x] 11. Checkpoint — Pastikan semua API berfungsi
  - Pastikan semua test unit dan property test backend lolos. Tanyakan kepada pengguna jika ada pertanyaan.

- [x] 12. Setup frontend React dan routing
  - [x] 12.1 Konfigurasi Vite + React + TypeScript + React Router DOM di folder `frontend/`
    - _Kebutuhan: Semua modul frontend_
  - [x] 12.2 Buat struktur folder komponen: `pages/`, `components/`, `hooks/`, `api/`
    - _Kebutuhan: Semua_
  - [x] 12.3 Buat modul `api/client.ts` dengan fungsi wrapper `fetch` untuk semua endpoint backend
    - _Kebutuhan: Semua_
  - [x] 12.4 Implementasikan `AuthGuard` component untuk proteksi rute admin (redirect ke `/admin/login` jika tidak ada token JWT)
    - _Kebutuhan: 7.4_

- [x] 13. Implementasi halaman publik — Beranda dan Panduan
  - [x] 13.1 Buat halaman `HomePage` (`/`) menampilkan nama sistem, logo Farhan Motor, deskripsi, dan navigasi ke Panduan & Mulai Diagnosis
    - _Kebutuhan: 1.1, 1.2_
  - [x] 13.2 Buat halaman `PanduanPage` (`/panduan`) menampilkan langkah-langkah pembacaan kode MIL dengan ilustrasi teks/ikon
    - _Kebutuhan: 2.1, 2.2, 2.3_

- [x] 14. Implementasi alur diagnosis — Pilih Merek & Model
  - [x] 14.1 Buat komponen `PilihMerekModel` yang mengambil data dari `GET /api/merek` dan menampilkan dropdown bertingkat (merek → model)
    - Filter daftar model ketika merek dipilih
    - Tampilkan pesan jika merek tidak memiliki model terdaftar
    - _Kebutuhan: 3.1, 3.2, 3.3, 3.4_
  - [x] 14.2 Tulis unit test komponen `PilihMerekModel`
    - Verifikasi bahwa memilih merek memfilter daftar model dengan benar
    - _Kebutuhan: 3.2_

- [x] 15. Implementasi alur diagnosis — Form Input Kode MIL
  - [x] 15.1 Buat komponen `FormInputKodeMIL` dengan input field kode MIL, validasi format real-time, kemampuan tambah multiple kode, dan tombol diagnosa
    - Disable tombol diagnosa jika merek/model belum dipilih atau kode MIL tidak valid
    - Tampilkan pesan error format jika input tidak valid
    - _Kebutuhan: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 16. Implementasi alur diagnosis — Proses dan Hasil
  - [x] 16.1 Buat komponen `DiagnosisWizard` yang menggabungkan `PilihMerekModel` → `FormInputKodeMIL` → loading state → hasil
    - Tampilkan `ForwardChainingLoader` selama request API berlangsung
    - _Kebutuhan: 5.2_
  - [x] 16.2 Buat halaman `HasilDiagnosisPage` (`/diagnosis/hasil`) yang menampilkan: kode MIL input, daftar kerusakan dengan gejala/komponen/solusi, dan tombol cetak PDF + diagnosis baru
    - _Kebutuhan: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 16.3 Tulis unit test untuk komponen `HasilDiagnosisPage`
    - Verifikasi bahwa semua field (kode MIL, kerusakan, komponen, solusi) dirender untuk setiap objek hasil diagnosis
    - _Kebutuhan: 6.1_

- [x] 17. Implementasi halaman login admin
  - [x] 17.1 Buat halaman `AdminLoginPage` (`/admin/login`) dengan form email + kata sandi, penanganan error respons API, dan redirect setelah login sukses
    - _Kebutuhan: 7.1, 7.2, 7.3, 7.5_

- [x] 18. Implementasi dashboard admin dan statistik
  - [x] 18.1 Buat komponen `AdminLayout` dengan sidebar navigasi ke semua halaman admin
    - _Kebutuhan: 8.1_
  - [x] 18.2 Buat halaman `DashboardPage` (`/admin/dashboard`) yang memanggil `GET /api/admin/dashboard/statistik` dan menampilkan: `StatistikCard` (total, distribusi merek) dan `StatistikGrafik` (tren 30 hari, 5 kode teratas) menggunakan library charting (Recharts)
    - _Kebutuhan: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 19. Implementasi halaman kelola data master admin
  - [x] 19.1 Buat komponen `DataTable` generik dengan props kolom, data, dan callback aksi (tambah, edit, hapus) serta fitur pencarian
    - _Kebutuhan: 9.1, 10.5_
  - [x] 19.2 Buat halaman `KelolaMasterPage` (`/admin/master`) menggunakan `DataTable` untuk tampilan merek, model, dan akun admin — termasuk form modal tambah/edit dan dialog konfirmasi hapus
    - Tangani error duplikasi dan cek relasi dari API
    - _Kebutuhan: 9.1, 9.2, 9.3, 9.4, 9.6_

- [x] 20. Implementasi halaman kelola data teknis dan basis aturan
  - [x] 20.1 Buat halaman `KelolaDataTeknisPage` (`/admin/data-teknis`) dengan tab navigasi untuk: Kode MIL, Gejala, Kerusakan, Komponen, Solusi — masing-masing menggunakan `DataTable` dengan form CRUD
    - _Kebutuhan: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [x] 20.2 Buat halaman `KelolaBasisAturanPage` (`/admin/basis-aturan`) dengan tampilan semua aturan IF-THEN dan form tambah/edit aturan dengan dropdown yang mengambil data dari kode MIL dan kerusakan terdaftar
    - _Kebutuhan: 11.1, 11.2_

- [x] 21. Implementasi halaman riwayat diagnosis dan laporan
  - [x] 21.1 Buat halaman `RiwayatDiagnosisPage` (`/admin/riwayat`) dengan tabel riwayat, filter tanggal/merek/model, checkbox multi-select, dan tombol cetak laporan PDF
    - Panggil `POST /api/admin/laporan/cetak` dengan ID yang dipilih dan trigger download PDF
    - _Kebutuhan: 11.3, 11.4, 11.5_

- [x] 22. Checkpoint akhir — Integrasi dan verifikasi menyeluruh
  - Pastikan semua test (unit, property) backend dan frontend lolos.
  - Verifikasi alur lengkap: pilih merek → input kode MIL → hasil diagnosis → tersimpan di riwayat → tampil di dashboard admin.
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum dianggap selesai.
