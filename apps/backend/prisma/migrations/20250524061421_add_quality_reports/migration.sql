-- AlterTable
ALTER TABLE "spec_files" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "quality_reports" (
    "id" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "lintingScore" DOUBLE PRECISION NOT NULL,
    "securityScore" DOUBLE PRECISION NOT NULL,
    "performanceScore" DOUBLE PRECISION NOT NULL,
    "report" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "specId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "quality_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "quality_reports" ADD CONSTRAINT "quality_reports_specId_fkey" FOREIGN KEY ("specId") REFERENCES "spec_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
