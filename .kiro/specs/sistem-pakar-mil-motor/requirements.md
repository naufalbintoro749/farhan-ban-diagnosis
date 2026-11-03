# Dokumen Kebutuhan Sistem

## Pendahuluan

Sistem Pakar Diagnosis Kerusakan Sepeda Motor Honda dan Yamaha Berbasis Kode Kedipan MIL (Malfunction Indicator Lamp) adalah aplikasi web yang dikembangkan untuk Farhan Motor. Sistem ini membantu mekanik dan pemilik kendaraan dalam mendiagnosis kerusakan sepeda motor berdasarkan pola kedipan lampu MIL menggunakan metode inferensi Forward Chaining. Sistem menyediakan antarmuka pengguna yang intuitif serta panel administrasi untuk pengelolaan basis pengetahuan dan pelaporan.

---

## Glosarium

- **Sistem_Pakar**: Aplikasi web yang menggunakan basis pengetahuan dan mesin inferensi untuk mendiagnosis kerusakan sepeda motor.
- **MIL**: Malfunction Indicator Lamp — lampu indikator kerusakan pada sepeda motor injeksi yang berkedip dengan pola tertentu untuk menandai kode kesalahan.
- **Kode_MIL**: Kode numerik yang direpresentasikan oleh pola kedipan lampu MIL, mengidentifikasi jenis kerusakan tertentu pada sistem injeksi.
- **Forward_Chaining**: Metode inferensi yang dimulai dari fakta yang diketahui (kode MIL) menuju kesimpulan (diagnosis kerusakan).
- **Mesin_Inferensi**: Komponen backend yang mengeksekusi algoritma Forward Chaining terhadap basis aturan untuk menghasilkan diagnosis.
- **Basis_Aturan**: Kumpulan aturan IF-THEN yang menghubungkan kode MIL dengan gejala, kerusakan, komponen yang rusak, dan solusi perbaikan.
- **Pengguna**: Pengunjung atau mekanik yang menggunakan antarmuka publik sistem untuk melakukan diagnosis.
- **Admin**: Pengelola sistem yang memiliki akses ke panel administrasi untuk mengelola data dan melihat laporan.
- **Komponen**: Bagian fisik dari sepeda motor yang terkait dengan suatu kerusakan (misalnya: sensor TPS, injektor, ECU).
- **Riwayat_Diagnosis**: Catatan hasil diagnosis yang telah dilakukan, tersimpan di basis data.
- **Laporan**: Dokumen cetak atau ekspor berisi rangkuman riwayat diagnosis.

---

## Kebutuhan

### Kebutuhan 1: Halaman Beranda Pengguna

**User Story:** Sebagai pengguna, saya ingin melihat informasi sistem pakar di halaman beranda, sehingga saya dapat memahami tujuan dan kemampuan sistem sebelum menggunakannya.

#### Kriteria Penerimaan

1. THE Sistem_Pakar SHALL menampilkan nama sistem, logo Farhan Motor, dan deskripsi singkat sistem pada halaman beranda.
2. THE Sistem_Pakar SHALL menampilkan tautan navigasi menuju Panduan Penggunaan dan menu Mulai Diagnosis pada halaman beranda.
3. WHEN pengguna mengakses halaman beranda, THE Sistem_Pakar SHALL memuat dan menampilkan halaman dalam waktu kurang dari 3 detik.

---

### Kebutuhan 2: Panduan Penggunaan Sistem

**User Story:** Sebagai pengguna, saya ingin membaca panduan penggunaan sistem, sehingga saya dapat menggunakan sistem diagnosis dengan benar.

#### Kriteria Penerimaan

1. THE Sistem_Pakar SHALL menampilkan langkah-langkah cara membaca kode kedipan MIL pada halaman panduan.
2. THE Sistem_Pakar SHALL menampilkan ilustrasi atau deskripsi cara menghitung pola kedipan MIL pada halaman panduan.
3. THE Sistem_Pakar SHALL menampilkan petunjuk cara memilih merek dan model motor serta memasukkan kode MIL pada halaman panduan.

---

### Kebutuhan 3: Pemilihan Merek dan Model Sepeda Motor

**User Story:** Sebagai pengguna, saya ingin memilih merek dan model sepeda motor, sehingga sistem dapat menggunakan basis aturan yang sesuai untuk diagnosis.

#### Kriteria Penerimaan

1. WHEN pengguna membuka form diagnosis, THE Sistem_Pakar SHALL menampilkan daftar merek sepeda motor yang tersedia (Honda dan Yamaha).
2. WHEN pengguna memilih satu merek, THE Sistem_Pakar SHALL menampilkan hanya daftar model motor yang terdaftar untuk merek tersebut.
3. WHEN pengguna memilih model motor, THE Sistem_Pakar SHALL menyimpan pilihan merek dan model sebagai konteks diagnosis sesi tersebut.
4. IF merek yang dipilih tidak memiliki model yang terdaftar, THEN THE Sistem_Pakar SHALL menampilkan pesan bahwa belum ada data model untuk merek tersebut.

---

### Kebutuhan 4: Form Input Kode Kedipan MIL

**User Story:** Sebagai pengguna, saya ingin memasukkan kode kedipan MIL yang terbaca dari sepeda motor, sehingga sistem dapat memproses diagnosis berdasarkan kode tersebut.

#### Kriteria Penerimaan

1. WHEN pengguna telah memilih merek dan model, THE Sistem_Pakar SHALL menampilkan form input untuk memasukkan kode kedipan MIL.
2. WHEN pengguna memasukkan kode MIL yang valid, THE Sistem_Pakar SHALL menerima input dan mengaktifkan tombol diagnosa.
3. WHEN pengguna memasukkan kode MIL yang berformat tidak valid (bukan angka atau di luar rentang yang dikenali), THE Sistem_Pakar SHALL menampilkan pesan kesalahan format dan mencegah proses diagnosis.
4. IF pengguna menekan tombol diagnosa tanpa memilih merek dan model terlebih dahulu, THEN THE Sistem_Pakar SHALL menampilkan pesan peringatan bahwa merek dan model wajib dipilih.
5. THE Sistem_Pakar SHALL memungkinkan pengguna untuk memasukkan lebih dari satu kode MIL dalam satu sesi diagnosis.

---

### Kebutuhan 5: Proses Diagnosis Menggunakan Forward Chaining

**User Story:** Sebagai pengguna, saya ingin sistem memproses kode MIL secara otomatis menggunakan logika Forward Chaining, sehingga saya mendapatkan diagnosis yang akurat berdasarkan basis aturan.

#### Kriteria Penerimaan

1. WHEN pengguna menekan tombol diagnosa dengan kode MIL yang valid, THE Mesin_Inferensi SHALL mencocokkan kode MIL dengan basis aturan yang sesuai dengan merek dan model motor yang dipilih.
2. WHILE proses inferensi berlangsung, THE Sistem_Pakar SHALL menampilkan indikator loading kepada pengguna.
3. WHEN basis aturan berhasil mencocokkan kode MIL, THE Mesin_Inferensi SHALL menghasilkan satu atau lebih kesimpulan berupa kerusakan yang teridentifikasi beserta komponennya.
4. WHEN lebih dari satu aturan cocok dengan kode MIL yang diinput, THE Mesin_Inferensi SHALL memproses dan mengembalikan seluruh kerusakan yang relevan.
5. IF tidak ada aturan yang cocok dengan kode MIL yang diinput untuk merek dan model tersebut, THEN THE Mesin_Inferensi SHALL mengembalikan status "tidak ditemukan" beserta saran untuk berkonsultasi dengan teknisi.
6. WHEN proses diagnosis selesai, THE Mesin_Inferensi SHALL menyimpan rekaman diagnosis ke Riwayat_Diagnosis secara otomatis.

---

### Kebutuhan 6: Hasil Diagnosis dan Rekomendasi Perbaikan

**User Story:** Sebagai pengguna, saya ingin melihat hasil diagnosis lengkap beserta rekomendasi perbaikan, sehingga saya mengetahui kerusakan dan langkah yang perlu dilakukan.

#### Kriteria Penerimaan

1. WHEN proses diagnosis berhasil, THE Sistem_Pakar SHALL menampilkan halaman hasil yang memuat: kode MIL yang diinput, nama kerusakan yang teridentifikasi, gejala yang terkait, komponen yang bermasalah, dan solusi perbaikan yang direkomendasikan.
2. WHEN hasil diagnosis ditampilkan, THE Sistem_Pakar SHALL menampilkan tingkat kepercayaan atau keterangan relevansi untuk setiap kerusakan yang ditemukan.
3. IF diagnosis menghasilkan lebih dari satu kerusakan, THE Sistem_Pakar SHALL menampilkan semua kerusakan dalam daftar yang terurut berdasarkan prioritas atau relevansi.
4. THE Sistem_Pakar SHALL menyediakan tombol untuk mencetak atau mengunduh hasil diagnosis dalam format PDF.
5. THE Sistem_Pakar SHALL menyediakan tombol untuk memulai diagnosis baru dari halaman hasil.

---

### Kebutuhan 7: Login Admin

**User Story:** Sebagai admin, saya ingin masuk ke panel administrasi menggunakan kredensial yang valid, sehingga saya dapat mengelola data sistem dengan aman.

#### Kriteria Penerimaan

1. THE Sistem_Pakar SHALL menyediakan halaman login khusus admin dengan form email dan kata sandi.
2. WHEN admin memasukkan kredensial yang valid, THE Sistem_Pakar SHALL membuat sesi autentikasi dan mengarahkan admin ke dashboard.
3. WHEN admin memasukkan kredensial yang tidak valid, THE Sistem_Pakar SHALL menampilkan pesan kesalahan dan menolak akses.
4. WHILE admin dalam sesi aktif, THE Sistem_Pakar SHALL melindungi seluruh rute admin dari akses tanpa autentikasi.
5. WHEN admin menekan tombol logout, THE Sistem_Pakar SHALL menghapus sesi aktif dan mengarahkan ke halaman login.
6. IF percobaan login gagal sebanyak 5 kali berturut-turut, THEN THE Sistem_Pakar SHALL mengunci sementara akun selama 15 menit dan menampilkan pemberitahuan kepada admin.

---

### Kebutuhan 8: Dashboard Admin dan Statistik Diagnosis

**User Story:** Sebagai admin, saya ingin melihat ringkasan statistik dan aktivitas sistem di dashboard, sehingga saya dapat memantau penggunaan dan performa sistem.

#### Kriteria Penerimaan

1. WHEN admin mengakses dashboard, THE Sistem_Pakar SHALL menampilkan total jumlah diagnosis yang telah dilakukan.
2. WHEN admin mengakses dashboard, THE Sistem_Pakar SHALL menampilkan distribusi diagnosis berdasarkan merek motor (Honda vs Yamaha) dalam bentuk grafik.
3. WHEN admin mengakses dashboard, THE Sistem_Pakar SHALL menampilkan 5 kode MIL yang paling sering didiagnosis.
4. WHEN admin mengakses dashboard, THE Sistem_Pakar SHALL menampilkan jumlah diagnosis dalam 30 hari terakhir dalam bentuk grafik tren harian.
5. THE Sistem_Pakar SHALL memperbarui data statistik dashboard secara real-time setiap kali ada diagnosis baru yang masuk.

---

### Kebutuhan 9: Kelola Data Master

**User Story:** Sebagai admin, saya ingin mengelola data master merek, model motor, dan akun pengguna admin, sehingga basis data sistem selalu akurat dan terkini.

#### Kriteria Penerimaan

1. WHEN admin membuka halaman kelola data master, THE Sistem_Pakar SHALL menampilkan daftar merek, model motor, dan akun admin yang tersimpan.
2. WHEN admin menambahkan data merek baru dengan nama yang valid, THE Sistem_Pakar SHALL menyimpan data merek ke basis data dan menampilkannya dalam daftar.
3. WHEN admin mengedit data merek atau model yang sudah ada, THE Sistem_Pakar SHALL memperbarui data di basis data dan merefresh tampilan daftar.
4. WHEN admin menghapus data merek yang masih memiliki model terdaftar, THE Sistem_Pakar SHALL menampilkan peringatan konfirmasi dan mencegah penghapusan sampai relasi dihapus terlebih dahulu.
5. WHEN admin menambahkan akun admin baru, THE Sistem_Pakar SHALL meng-hash kata sandi sebelum menyimpannya ke basis data.
6. IF admin mencoba menyimpan data merek atau model dengan nama yang sudah ada, THEN THE Sistem_Pakar SHALL menampilkan pesan kesalahan duplikasi dan menolak penyimpanan.

---

### Kebutuhan 10: Kelola Data Kode MIL, Gejala, Kerusakan, Komponen, dan Solusi

**User Story:** Sebagai admin, saya ingin mengelola seluruh data teknis diagnosis, sehingga basis pengetahuan sistem dapat diperbarui sesuai perkembangan data lapangan.

#### Kriteria Penerimaan

1. THE Sistem_Pakar SHALL menyediakan antarmuka CRUD (tambah, lihat, edit, hapus) untuk data Kode_MIL, gejala, kerusakan, komponen, dan solusi.
2. WHEN admin menambahkan kode MIL baru, THE Sistem_Pakar SHALL memvalidasi bahwa kode tersebut belum terdaftar untuk merek dan model yang sama, lalu menyimpannya.
3. WHEN admin menghapus data kerusakan yang masih direferensikan oleh Basis_Aturan aktif, THE Sistem_Pakar SHALL menampilkan peringatan dan mencegah penghapusan.
4. WHEN admin menyimpan perubahan pada data teknis, THE Sistem_Pakar SHALL langsung merefleksikan perubahan pada proses diagnosis selanjutnya tanpa perlu restart sistem.
5. THE Sistem_Pakar SHALL menyediakan fungsi pencarian dan filter pada setiap tabel data teknis untuk memudahkan navigasi data.

---

### Kebutuhan 11: Kelola Basis Aturan, Riwayat Diagnosis, dan Cetak Laporan

**User Story:** Sebagai admin, saya ingin mengelola basis aturan, melihat riwayat diagnosis, dan mencetak laporan, sehingga sistem dapat dipantau, diaudit, dan dioptimalkan.

#### Kriteria Penerimaan

1. WHEN admin membuka halaman kelola basis aturan, THE Sistem_Pakar SHALL menampilkan semua aturan IF-THEN yang terdaftar beserta kode MIL, gejala, dan kerusakan terkait.
2. WHEN admin menambahkan atau mengedit aturan, THE Sistem_Pakar SHALL memvalidasi bahwa kode MIL dan kerusakan yang dirujuk sudah terdaftar di data master sebelum menyimpan.
3. WHEN admin membuka halaman riwayat diagnosis, THE Sistem_Pakar SHALL menampilkan daftar semua diagnosis dengan informasi: tanggal, merek, model, kode MIL, dan hasil diagnosis.
4. WHEN admin memfilter riwayat berdasarkan rentang tanggal, merek, atau model, THE Sistem_Pakar SHALL menampilkan hanya rekaman yang sesuai dengan filter.
5. WHEN admin memilih satu atau lebih riwayat diagnosis dan menekan tombol cetak laporan, THE Sistem_Pakar SHALL menghasilkan dokumen laporan dalam format PDF yang dapat diunduh.
6. IF admin mencoba menghapus aturan yang masih aktif digunakan sebagai referensi basis pengetahuan utama, THEN THE Sistem_Pakar SHALL meminta konfirmasi sebelum melanjutkan penghapusan.
