/*
  Warnings:

  - You are about to drop the column `vendorContact` on the `Sponsor` table. All the data in the column will be lost.
  - Added the required column `contactName` to the `Sponsor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Prospective_Sponsor_Status" AS ENUM ('IN_PROGRESS', 'DECLINED', 'NOT_IN_CONTACT', 'NO_RESPONSE', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "First_Contact_Method" AS ENUM ('INBOUND_FORM', 'INBOUND_EMAIL', 'OUTBOUND_EMAIL', 'OTHER');

-- DropForeignKey
ALTER TABLE "Sponsor_Task" DROP CONSTRAINT "Sponsor_Task_sponsorId_fkey";

-- AlterTable
ALTER TABLE "Sponsor" DROP COLUMN "vendorContact",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "contactPosition" TEXT;

-- AlterTable
ALTER TABLE "Sponsor_Task" ADD COLUMN     "done" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prospectiveSponsorId" TEXT,
ALTER COLUMN "sponsorId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Prospective_Sponsor" (
    "prospectiveSponsorId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastContactDate" TIMESTAMP(3) NOT NULL,
    "highlightThresholdDays" INTEGER NOT NULL DEFAULT 10,
    "status" "Prospective_Sponsor_Status" NOT NULL DEFAULT 'IN_PROGRESS',
    "firstContactMethod" "First_Contact_Method" NOT NULL,
    "contactorUserId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactPosition" TEXT,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Prospective_Sponsor_pkey" PRIMARY KEY ("prospectiveSponsorId")
);

-- CreateIndex
CREATE INDEX "Prospective_Sponsor_organizationId_idx" ON "Prospective_Sponsor"("organizationId");

-- CreateIndex
CREATE INDEX "Prospective_Sponsor_contactorUserId_idx" ON "Prospective_Sponsor"("contactorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Prospective_Sponsor_organizationName_organizationId_key" ON "Prospective_Sponsor"("organizationName", "organizationId");

-- CreateIndex
CREATE INDEX "Sponsor_Task_prospectiveSponsorId_idx" ON "Sponsor_Task"("prospectiveSponsorId");

-- AddForeignKey
ALTER TABLE "Sponsor_Task" ADD CONSTRAINT "Sponsor_Task_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("sponsorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor_Task" ADD CONSTRAINT "Sponsor_Task_prospectiveSponsorId_fkey" FOREIGN KEY ("prospectiveSponsorId") REFERENCES "Prospective_Sponsor"("prospectiveSponsorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospective_Sponsor" ADD CONSTRAINT "Prospective_Sponsor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospective_Sponsor" ADD CONSTRAINT "Prospective_Sponsor_contactorUserId_fkey" FOREIGN KEY ("contactorUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
