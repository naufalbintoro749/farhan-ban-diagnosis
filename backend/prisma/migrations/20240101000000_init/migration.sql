-- CreateTable
CREATE TABLE "Merek" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "merekId" INTEGER NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KodeMIL" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "merekId" INTEGER NOT NULL,
    "modelId" INTEGER,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KodeMIL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gejala" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gejala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kerusakan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kerusakan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Komponen" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Komponen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solusi" (
    "id" SERIAL NOT NULL,
    "langkah" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KerusakanKomponen" (
    "kerusakanId" INTEGER NOT NULL,
    "komponenId" INTEGER NOT NULL,

    CONSTRAINT "KerusakanKomponen_pkey" PRIMARY KEY ("kerusakanId","komponenId")
);

-- CreateTable
CREATE TABLE "KerusakanSolusi" (
    "kerusakanId" INTEGER NOT NULL,
    "solusiId" INTEGER NOT NULL,

    CONSTRAINT "KerusakanSolusi_pkey" PRIMARY KEY ("kerusakanId","solusiId")
);

-- CreateTable
CREATE TABLE "BasisAturan" (
    "id" SERIAL NOT NULL,
    "kodeMILId" INTEGER NOT NULL,
    "gejalaid" INTEGER NOT NULL,
    "kerusakanId" INTEGER NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BasisAturan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" SERIAL NOT NULL,
    "modelId" INTEGER NOT NULL,
    "kodeMILInput" TEXT[],
    "hasilDiagnosis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merek_nama_key" ON "Merek"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Model_nama_merekId_key" ON "Model"("nama", "merekId");

-- CreateIndex
CREATE UNIQUE INDEX "KodeMIL_kode_merekId_modelId_key" ON "KodeMIL"("kode", "merekId", "modelId");

-- CreateIndex
CREATE UNIQUE INDEX "Gejala_nama_key" ON "Gejala"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Kerusakan_nama_key" ON "Kerusakan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Komponen_nama_key" ON "Komponen"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_merekId_fkey" FOREIGN KEY ("merekId") REFERENCES "Merek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KodeMIL" ADD CONSTRAINT "KodeMIL_merekId_fkey" FOREIGN KEY ("merekId") REFERENCES "Merek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KodeMIL" ADD CONSTRAINT "KodeMIL_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KerusakanKomponen" ADD CONSTRAINT "KerusakanKomponen_kerusakanId_fkey" FOREIGN KEY ("kerusakanId") REFERENCES "Kerusakan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KerusakanKomponen" ADD CONSTRAINT "KerusakanKomponen_komponenId_fkey" FOREIGN KEY ("komponenId") REFERENCES "Komponen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KerusakanSolusi" ADD CONSTRAINT "KerusakanSolusi_kerusakanId_fkey" FOREIGN KEY ("kerusakanId") REFERENCES "Kerusakan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KerusakanSolusi" ADD CONSTRAINT "KerusakanSolusi_solusiId_fkey" FOREIGN KEY ("solusiId") REFERENCES "Solusi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasisAturan" ADD CONSTRAINT "BasisAturan_kodeMILId_fkey" FOREIGN KEY ("kodeMILId") REFERENCES "KodeMIL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasisAturan" ADD CONSTRAINT "BasisAturan_gejalaid_fkey" FOREIGN KEY ("gejalaid") REFERENCES "Gejala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasisAturan" ADD CONSTRAINT "BasisAturan_kerusakanId_fkey" FOREIGN KEY ("kerusakanId") REFERENCES "Kerusakan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
