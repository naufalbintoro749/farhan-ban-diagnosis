import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai seed data...');

  // ── Merek ──────────────────────────────────────────────────────────────────
  const honda = await prisma.merek.upsert({
    where: { nama: 'Honda' },
    update: {},
    create: { nama: 'Honda', aktif: true },
  });

  const yamaha = await prisma.merek.upsert({
    where: { nama: 'Yamaha' },
    update: {},
    create: { nama: 'Yamaha', aktif: true },
  });

  console.log(`Merek dibuat: Honda (id=${honda.id}), Yamaha (id=${yamaha.id})`);

  // ── Model Honda ────────────────────────────────────────────────────────────
  const beatFi = await prisma.model.upsert({
    where: { nama_merekId: { nama: 'Beat FI', merekId: honda.id } },
    update: {},
    create: { nama: 'Beat FI', merekId: honda.id, aktif: true },
  });

  const vario125 = await prisma.model.upsert({
    where: { nama_merekId: { nama: 'Vario 125', merekId: honda.id } },
    update: {},
    create: { nama: 'Vario 125', merekId: honda.id, aktif: true },
  });

  const supra125 = await prisma.model.upsert({
    where: { nama_merekId: { nama: 'Supra X 125', merekId: honda.id } },
    update: {},
    create: { nama: 'Supra X 125', merekId: honda.id, aktif: true },
  });

  // ── Model Yamaha ───────────────────────────────────────────────────────────
  const mioM3 = await prisma.model.upsert({
    where: { nama_merekId: { nama: 'Mio M3', merekId: yamaha.id } },
    update: {},
    create: { nama: 'Mio M3', merekId: yamaha.id, aktif: true },
  });

  const nmax = await prisma.model.upsert({
    where: { nama_merekId: { nama: 'NMAX', merekId: yamaha.id } },
    update: {},
    create: { nama: 'NMAX', merekId: yamaha.id, aktif: true },
  });

  const vixion = await prisma.model.upsert({
    where: { nama_merekId: { nama: 'Vixion', merekId: yamaha.id } },
    update: {},
    create: { nama: 'Vixion', merekId: yamaha.id, aktif: true },
  });

  console.log('Model dibuat:', beatFi.nama, vario125.nama, supra125.nama, mioM3.nama, nmax.nama, vixion.nama);

  // Helper untuk upsert KodeMIL (agar tidak error null pada compound unique Prisma)
  async function upsertKodeMIL(data: { kode: string; deskripsi: string; merekId: number; modelId: number | null; aktif: boolean }) {
    const existing = await prisma.kodeMIL.findFirst({
      where: {
        kode: data.kode,
        merekId: data.merekId,
        modelId: data.modelId,
      },
    });
    if (existing) {
      return prisma.kodeMIL.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.kodeMIL.create({ data });
  }

  // ── Kode MIL Honda (berlaku untuk semua model Honda, modelId = null) ────────
  const hondaMIL = await Promise.all([
    upsertKodeMIL({ kode: '7', deskripsi: 'Sensor EOT (Engine Oil Temperature) / ECT bermasalah', merekId: honda.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '8', deskripsi: 'Sensor TP (Throttle Position) bermasalah', merekId: honda.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '9', deskripsi: 'Sensor IAT (Intake Air Temperature) bermasalah', merekId: honda.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '12', deskripsi: 'Injektor (Injector) bermasalah', merekId: honda.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '29', deskripsi: 'IACV (Idle Air Control Valve) bermasalah', merekId: honda.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '33', deskripsi: 'Sensor O2 (Oksigen) bermasalah', merekId: honda.id, modelId: null, aktif: true }),
  ]);

  // ── Kode MIL Yamaha ────────────────────────────────────────────────────────
  const yamahaMIL = await Promise.all([
    upsertKodeMIL({ kode: '12', deskripsi: 'Sensor CPS (Crankshaft Position Sensor) bermasalah', merekId: yamaha.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '13', deskripsi: 'Sensor MAP (Manifold Absolute Pressure) bermasalah', merekId: yamaha.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '14', deskripsi: 'Sensor TPS (Throttle Position Sensor) bermasalah', merekId: yamaha.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '19', deskripsi: 'Sensor IAP / tekanan udara masuk bermasalah', merekId: yamaha.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '30', deskripsi: 'Injektor bermasalah', merekId: yamaha.id, modelId: null, aktif: true }),
    upsertKodeMIL({ kode: '33', deskripsi: 'Sensor O2 bermasalah', merekId: yamaha.id, modelId: null, aktif: true }),
  ]);

  console.log(`Kode MIL Honda: ${hondaMIL.length} dibuat, Yamaha: ${yamahaMIL.length} dibuat`);

  // ── Gejala ─────────────────────────────────────────────────────────────────
  const gejalaSensor = await prisma.gejala.upsert({
    where: { nama: 'Lampu MIL menyala' },
    update: {},
    create: { nama: 'Lampu MIL menyala', deskripsi: 'Lampu indikator kerusakan pada panel instrumen menyala' },
  });
  const gejalaIdleTidakStabil = await prisma.gejala.upsert({
    where: { nama: 'Putaran idle tidak stabil' },
    update: {},
    create: { nama: 'Putaran idle tidak stabil', deskripsi: 'RPM mesin naik-turun tidak teratur saat idle' },
  });
  const gejalaBorosBBM = await prisma.gejala.upsert({
    where: { nama: 'Konsumsi bahan bakar boros' },
    update: {},
    create: { nama: 'Konsumsi bahan bakar boros', deskripsi: 'Pemakaian bahan bakar melebihi kondisi normal' },
  });
  const gejalaPerformaTurun = await prisma.gejala.upsert({
    where: { nama: 'Performa mesin menurun' },
    update: {},
    create: { nama: 'Performa mesin menurun', deskripsi: 'Akselerasi terasa berat atau tenaga mesin berkurang' },
  });
  const gejalaInjektor = await prisma.gejala.upsert({
    where: { nama: 'Mesin sulit dinyalakan' },
    update: {},
    create: { nama: 'Mesin sulit dinyalakan', deskripsi: 'Motor perlu beberapa kali percobaan sebelum mesin menyala' },
  });
  const gejalaOT = await prisma.gejala.upsert({
    where: { nama: 'Suhu mesin tidak terbaca normal' },
    update: {},
    create: { nama: 'Suhu mesin tidak terbaca normal', deskripsi: 'Indikator suhu mesin menunjukkan nilai tidak wajar' },
  });

  console.log('Gejala dibuat');

  // ── Kerusakan ──────────────────────────────────────────────────────────────
  const kerusakanSensorTPSH = await prisma.kerusakan.upsert({
    where: { nama: 'Kerusakan Sensor TPS Honda' },
    update: {},
    create: { nama: 'Kerusakan Sensor TPS Honda', deskripsi: 'Sensor posisi throttle pada motor Honda mengalami kerusakan atau koneksi longgar' },
  });
  const kerusakanInjektorH = await prisma.kerusakan.upsert({
    where: { nama: 'Kerusakan Injektor Honda' },
    update: {},
    create: { nama: 'Kerusakan Injektor Honda', deskripsi: 'Injektor bahan bakar pada motor Honda tersumbat atau rusak' },
  });
  const kerusakanSensorEOT = await prisma.kerusakan.upsert({
    where: { nama: 'Kerusakan Sensor EOT Honda' },
    update: {},
    create: { nama: 'Kerusakan Sensor EOT Honda', deskripsi: 'Sensor suhu oli mesin pada motor Honda tidak berfungsi' },
  });
  const kerusakanSensorTPSY = await prisma.kerusakan.upsert({
    where: { nama: 'Kerusakan Sensor TPS Yamaha' },
    update: {},
    create: { nama: 'Kerusakan Sensor TPS Yamaha', deskripsi: 'Sensor posisi throttle pada motor Yamaha mengalami kerusakan' },
  });
  const kerusakanInjektorY = await prisma.kerusakan.upsert({
    where: { nama: 'Kerusakan Injektor Yamaha' },
    update: {},
    create: { nama: 'Kerusakan Injektor Yamaha', deskripsi: 'Injektor bahan bakar pada motor Yamaha tersumbat atau rusak' },
  });
  const kerusakanSensorMAP = await prisma.kerusakan.upsert({
    where: { nama: 'Kerusakan Sensor MAP Yamaha' },
    update: {},
    create: { nama: 'Kerusakan Sensor MAP Yamaha', deskripsi: 'Sensor tekanan manifold absolut pada motor Yamaha tidak berfungsi normal' },
  });

  console.log('Kerusakan dibuat');

  // ── Komponen ───────────────────────────────────────────────────────────────
  const komponenTPS = await prisma.komponen.upsert({
    where: { nama: 'Sensor TPS (Throttle Position Sensor)' },
    update: {},
    create: { nama: 'Sensor TPS (Throttle Position Sensor)', deskripsi: 'Sensor yang mengukur posisi bukaan throttle/gas' },
  });
  const komponenInjektor = await prisma.komponen.upsert({
    where: { nama: 'Injektor (Fuel Injector)' },
    update: {},
    create: { nama: 'Injektor (Fuel Injector)', deskripsi: 'Komponen yang menginjeksikan bahan bakar ke ruang bakar' },
  });
  const komponenEOT = await prisma.komponen.upsert({
    where: { nama: 'Sensor EOT/ECT (Engine Oil/Coolant Temperature)' },
    update: {},
    create: { nama: 'Sensor EOT/ECT (Engine Oil/Coolant Temperature)', deskripsi: 'Sensor yang mengukur suhu oli atau cairan pendingin mesin' },
  });
  const komponenMAP = await prisma.komponen.upsert({
    where: { nama: 'Sensor MAP (Manifold Absolute Pressure)' },
    update: {},
    create: { nama: 'Sensor MAP (Manifold Absolute Pressure)', deskripsi: 'Sensor yang mengukur tekanan udara di intake manifold' },
  });
  const komponenECU = await prisma.komponen.upsert({
    where: { nama: 'ECU (Engine Control Unit)' },
    update: {},
    create: { nama: 'ECU (Engine Control Unit)', deskripsi: 'Unit kontrol elektronik utama yang mengelola sistem injeksi' },
  });
  const komponenKabelSensor = await prisma.komponen.upsert({
    where: { nama: 'Kabel dan konektor sensor' },
    update: {},
    create: { nama: 'Kabel dan konektor sensor', deskripsi: 'Jaringan kabel dan konektor yang menghubungkan sensor ke ECU' },
  });

  console.log('Komponen dibuat');

  // ── Solusi ─────────────────────────────────────────────────────────────────
  const solusiCekSensor = await prisma.solusi.upsert({
    where: { id: 1 },
    update: {},
    create: { langkah: 'Periksa koneksi kabel dan konektor sensor, pastikan tidak longgar atau berkarat', urutan: 1 },
  });
  const solusiGantiSensor = await prisma.solusi.upsert({
    where: { id: 2 },
    update: {},
    create: { langkah: 'Ganti sensor dengan yang baru sesuai spesifikasi pabrik jika pembersihan tidak membantu', urutan: 2 },
  });
  const solusiKalibrasiTPV = await prisma.solusi.upsert({
    where: { id: 3 },
    update: {},
    create: { langkah: 'Lakukan kalibrasi ulang TPS menggunakan alat diagnostik (misalnya HDS Honda atau FIDT Yamaha)', urutan: 1 },
  });
  const solusiCekInjektor = await prisma.solusi.upsert({
    where: { id: 4 },
    update: {},
    create: { langkah: 'Bersihkan injektor menggunakan cairan pembersih injektor atau ultrasonic cleaner', urutan: 1 },
  });
  const solusiGantiInjektor = await prisma.solusi.upsert({
    where: { id: 5 },
    update: {},
    create: { langkah: 'Ganti injektor dengan unit baru jika pembersihan tidak menyelesaikan masalah', urutan: 2 },
  });
  const solusiClearDTC = await prisma.solusi.upsert({
    where: { id: 6 },
    update: {},
    create: { langkah: 'Hapus kode DTC setelah perbaikan menggunakan alat diagnostik dan pastikan lampu MIL mati', urutan: 3 },
  });

  console.log('Solusi dibuat');

  // ── Relasi Kerusakan ↔ Komponen ────────────────────────────────────────────
  await Promise.all([
    // TPS Honda
    prisma.kerusakanKomponen.upsert({
      where: { kerusakanId_komponenId: { kerusakanId: kerusakanSensorTPSH.id, komponenId: komponenTPS.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorTPSH.id, komponenId: komponenTPS.id },
    }),
    prisma.kerusakanKomponen.upsert({
      where: { kerusakanId_komponenId: { kerusakanId: kerusakanSensorTPSH.id, komponenId: komponenKabelSensor.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorTPSH.id, komponenId: komponenKabelSensor.id },
    }),
    // Injektor Honda
    prisma.kerusakanKomponen.upsert({
      where: { kerusakanId_komponenId: { kerusakanId: kerusakanInjektorH.id, komponenId: komponenInjektor.id } },
      update: {},
      create: { kerusakanId: kerusakanInjektorH.id, komponenId: komponenInjektor.id },
    }),
    // EOT Honda
    prisma.kerusakanKomponen.upsert({
      where: { kerusakanId_komponenId: { kerusakanId: kerusakanSensorEOT.id, komponenId: komponenEOT.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorEOT.id, komponenId: komponenEOT.id },
    }),
    // TPS Yamaha
    prisma.kerusakanKomponen.upsert({
      where: { kerusakanId_komponenId: { kerusakanId: kerusakanSensorTPSY.id, komponenId: komponenTPS.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorTPSY.id, komponenId: komponenTPS.id },
    }),
    // Injektor Yamaha
    prisma.kerusakanKomponen.upsert({
      where: { kerusakanId_komponenId: { kerusakanId: kerusakanInjektorY.id, komponenId: komponenInjektor.id } },
      update: {},
      create: { kerusakanId: kerusakanInjektorY.id, komponenId: komponenInjektor.id },
    }),
    // MAP Yamaha
    prisma.kerusakanKomponen.upsert({
      where: { kerusakanId_komponenId: { kerusakanId: kerusakanSensorMAP.id, komponenId: komponenMAP.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorMAP.id, komponenId: komponenMAP.id },
    }),
    prisma.kerusakanKomponen.upsert({
      where: { kerusakanId_komponenId: { kerusakanId: kerusakanSensorMAP.id, komponenId: komponenECU.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorMAP.id, komponenId: komponenECU.id },
    }),
  ]);

  // ── Relasi Kerusakan ↔ Solusi ──────────────────────────────────────────────
  await Promise.all([
    // TPS Honda
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorTPSH.id, solusiId: solusiCekSensor.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorTPSH.id, solusiId: solusiCekSensor.id },
    }),
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorTPSH.id, solusiId: solusiKalibrasiTPV.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorTPSH.id, solusiId: solusiKalibrasiTPV.id },
    }),
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorTPSH.id, solusiId: solusiGantiSensor.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorTPSH.id, solusiId: solusiGantiSensor.id },
    }),
    // Injektor Honda
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanInjektorH.id, solusiId: solusiCekInjektor.id } },
      update: {},
      create: { kerusakanId: kerusakanInjektorH.id, solusiId: solusiCekInjektor.id },
    }),
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanInjektorH.id, solusiId: solusiGantiInjektor.id } },
      update: {},
      create: { kerusakanId: kerusakanInjektorH.id, solusiId: solusiGantiInjektor.id },
    }),
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanInjektorH.id, solusiId: solusiClearDTC.id } },
      update: {},
      create: { kerusakanId: kerusakanInjektorH.id, solusiId: solusiClearDTC.id },
    }),
    // EOT Honda
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorEOT.id, solusiId: solusiCekSensor.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorEOT.id, solusiId: solusiCekSensor.id },
    }),
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorEOT.id, solusiId: solusiGantiSensor.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorEOT.id, solusiId: solusiGantiSensor.id },
    }),
    // TPS Yamaha
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorTPSY.id, solusiId: solusiCekSensor.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorTPSY.id, solusiId: solusiCekSensor.id },
    }),
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorTPSY.id, solusiId: solusiKalibrasiTPV.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorTPSY.id, solusiId: solusiKalibrasiTPV.id },
    }),
    // Injektor Yamaha
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanInjektorY.id, solusiId: solusiCekInjektor.id } },
      update: {},
      create: { kerusakanId: kerusakanInjektorY.id, solusiId: solusiCekInjektor.id },
    }),
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanInjektorY.id, solusiId: solusiGantiInjektor.id } },
      update: {},
      create: { kerusakanId: kerusakanInjektorY.id, solusiId: solusiGantiInjektor.id },
    }),
    // MAP Yamaha
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorMAP.id, solusiId: solusiCekSensor.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorMAP.id, solusiId: solusiCekSensor.id },
    }),
    prisma.kerusakanSolusi.upsert({
      where: { kerusakanId_solusiId: { kerusakanId: kerusakanSensorMAP.id, solusiId: solusiGantiSensor.id } },
      update: {},
      create: { kerusakanId: kerusakanSensorMAP.id, solusiId: solusiGantiSensor.id },
    }),
  ]);

  console.log('Relasi Kerusakan-Komponen dan Kerusakan-Solusi dibuat');

  // ── Basis Aturan (IF kode MIL THEN kerusakan) ──────────────────────────────
  // Honda: kode 8 (TPS) → Kerusakan Sensor TPS Honda
  await prisma.basisAturan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      kodeMILId: hondaMIL[1].id, // kode 8
      gejalaid: gejalaSensor.id,
      kerusakanId: kerusakanSensorTPSH.id,
      bobot: 1.0,
      aktif: true,
    },
  });
  await prisma.basisAturan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      kodeMILId: hondaMIL[1].id, // kode 8
      gejalaid: gejalaPerformaTurun.id,
      kerusakanId: kerusakanSensorTPSH.id,
      bobot: 0.8,
      aktif: true,
    },
  });

  // Honda: kode 12 (Injektor) → Kerusakan Injektor Honda
  await prisma.basisAturan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      kodeMILId: hondaMIL[3].id, // kode 12
      gejalaid: gejalaInjektor.id,
      kerusakanId: kerusakanInjektorH.id,
      bobot: 1.0,
      aktif: true,
    },
  });
  await prisma.basisAturan.upsert({
    where: { id: 4 },
    update: {},
    create: {
      kodeMILId: hondaMIL[3].id, // kode 12
      gejalaid: gejalaBorosBBM.id,
      kerusakanId: kerusakanInjektorH.id,
      bobot: 0.9,
      aktif: true,
    },
  });

  // Honda: kode 7 (EOT) → Kerusakan Sensor EOT Honda
  await prisma.basisAturan.upsert({
    where: { id: 5 },
    update: {},
    create: {
      kodeMILId: hondaMIL[0].id, // kode 7
      gejalaid: gejalaOT.id,
      kerusakanId: kerusakanSensorEOT.id,
      bobot: 1.0,
      aktif: true,
    },
  });

  // Honda: kode 8 + kode 12 bersama → TPS + Injektor Honda
  await prisma.basisAturan.upsert({
    where: { id: 6 },
    update: {},
    create: {
      kodeMILId: hondaMIL[1].id, // kode 8
      gejalaid: gejalaIdleTidakStabil.id,
      kerusakanId: kerusakanSensorTPSH.id,
      bobot: 0.9,
      aktif: true,
    },
  });

  // Yamaha: kode 14 (TPS) → Kerusakan Sensor TPS Yamaha
  await prisma.basisAturan.upsert({
    where: { id: 7 },
    update: {},
    create: {
      kodeMILId: yamahaMIL[2].id, // kode 14
      gejalaid: gejalaSensor.id,
      kerusakanId: kerusakanSensorTPSY.id,
      bobot: 1.0,
      aktif: true,
    },
  });
  await prisma.basisAturan.upsert({
    where: { id: 8 },
    update: {},
    create: {
      kodeMILId: yamahaMIL[2].id, // kode 14
      gejalaid: gejalaIdleTidakStabil.id,
      kerusakanId: kerusakanSensorTPSY.id,
      bobot: 0.8,
      aktif: true,
    },
  });

  // Yamaha: kode 30 (Injektor) → Kerusakan Injektor Yamaha
  await prisma.basisAturan.upsert({
    where: { id: 9 },
    update: {},
    create: {
      kodeMILId: yamahaMIL[4].id, // kode 30
      gejalaid: gejalaInjektor.id,
      kerusakanId: kerusakanInjektorY.id,
      bobot: 1.0,
      aktif: true,
    },
  });

  // Yamaha: kode 13 (MAP) → Kerusakan Sensor MAP Yamaha
  await prisma.basisAturan.upsert({
    where: { id: 10 },
    update: {},
    create: {
      kodeMILId: yamahaMIL[1].id, // kode 13
      gejalaid: gejalaPerformaTurun.id,
      kerusakanId: kerusakanSensorMAP.id,
      bobot: 1.0,
      aktif: true,
    },
  });
  await prisma.basisAturan.upsert({
    where: { id: 11 },
    update: {},
    create: {
      kodeMILId: yamahaMIL[1].id, // kode 13
      gejalaid: gejalaIdleTidakStabil.id,
      kerusakanId: kerusakanSensorMAP.id,
      bobot: 0.8,
      aktif: true,
    },
  });

  console.log('Basis aturan dibuat');
}

// ── Seed Admin (task 2.4) ──────────────────────────────────────────────────
async function seedAdmin() {
  const SALT_ROUNDS = 10;
  const passwordHash = await bcrypt.hash('Admin@Farhan2024!', SALT_ROUNDS);

  await prisma.admin.upsert({
    where: { email: 'admin@farhanmotor.com' },
    update: {},
    create: {
      email: 'admin@farhanmotor.com',
      passwordHash,
      nama: 'Administrator Farhan Motor',
    },
  });

  console.log('Akun admin awal dibuat: admin@farhanmotor.com');
}

main()
  .then(() => seedAdmin())
  .then(() => {
    console.log('Seed selesai.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed gagal:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
