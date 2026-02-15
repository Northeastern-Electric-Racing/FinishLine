/*
  Warnings:

  - You are about to drop the column `vendorContact` on the `Sponsor` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Prospective_Sponsor_Status" AS ENUM ('IN_PROGRESS', 'DECLINED', 'NOT_IN_CONTACT', 'NO_RESPONSE', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "First_Contact_Method" AS ENUM ('INBOUND_FORM', 'INBOUND_EMAIL', 'OUTBOUND_EMAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "Sponsor_Value_Type" AS ENUM ('MONETARY', 'STOCK', 'DISCOUNT');

-- DropForeignKey
ALTER TABLE "Sponsor_Task" DROP CONSTRAINT "Sponsor_Task_sponsorId_fkey";

-- CreateTable: Sponsor_Contact
CREATE TABLE "Sponsor_Contact" (
    "sponsorContactId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,

    CONSTRAINT "Sponsor_Contact_pkey" PRIMARY KEY ("sponsorContactId")
);

-- Add contactId column to Sponsor (nullable initially)
ALTER TABLE "Sponsor" ADD COLUMN "contactId" TEXT;

-- Create one Sponsor_Contact per Sponsor and link them in one step
WITH new_contacts AS (
  INSERT INTO "Sponsor_Contact" ("sponsorContactId", "name")
  SELECT gen_random_uuid(), COALESCE("vendorContact", '')
  FROM "Sponsor"
  RETURNING "sponsorContactId", "name", ctid
), numbered_contacts AS (
  SELECT "sponsorContactId", ROW_NUMBER() OVER (ORDER BY ctid) AS rn
  FROM new_contacts
), numbered_sponsors AS (
  SELECT "sponsorId", ROW_NUMBER() OVER (ORDER BY "sponsorId") AS rn
  FROM "Sponsor"
)
UPDATE "Sponsor" s
SET "contactId" = nc."sponsorContactId"
FROM numbered_sponsors ns
JOIN numbered_contacts nc ON ns.rn = nc.rn
WHERE s."sponsorId" = ns."sponsorId";

-- Enforce NOT NULL and unique, drop old column
ALTER TABLE "Sponsor" ALTER COLUMN "contactId" SET NOT NULL;
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_contactId_key" UNIQUE ("contactId");
ALTER TABLE "Sponsor" DROP COLUMN "vendorContact";

-- AddForeignKey: Sponsor -> Sponsor_Contact
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Sponsor_Contact"("sponsorContactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Sponsor - add value types, stock/discount descriptions, make sponsorValue and sponsorTierId nullable
ALTER TABLE "Sponsor"
ADD COLUMN     "valueTypes" "Sponsor_Value_Type"[] DEFAULT ARRAY['MONETARY']::"Sponsor_Value_Type"[],
ADD COLUMN     "stockDescription" TEXT,
ADD COLUMN     "discountDescription" TEXT;

ALTER TABLE "Sponsor" ALTER COLUMN "sponsorValue" DROP NOT NULL;
ALTER TABLE "Sponsor" ALTER COLUMN "sponsorTierId" DROP NOT NULL;

-- AlterTable: Sponsor_Task
ALTER TABLE "Sponsor_Task" ADD COLUMN     "done" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prospectiveSponsorId" TEXT,
ALTER COLUMN "sponsorId" DROP NOT NULL;

-- CreateTable: Prospective_Sponsor
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
    "contactId" TEXT NOT NULL,
    "notes" TEXT,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Prospective_Sponsor_pkey" PRIMARY KEY ("prospectiveSponsorId")
);

-- CreateIndex
CREATE INDEX "Prospective_Sponsor_organizationId_idx" ON "Prospective_Sponsor"("organizationId");

-- CreateIndex
CREATE INDEX "Prospective_Sponsor_contactorUserId_idx" ON "Prospective_Sponsor"("contactorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Prospective_Sponsor_organizationName_organizationId_key" ON "Prospective_Sponsor"("organizationName", "organizationId");

-- CreateIndex: unique contactId on Prospective_Sponsor
CREATE UNIQUE INDEX "Prospective_Sponsor_contactId_key" ON "Prospective_Sponsor"("contactId");

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

-- AddForeignKey
ALTER TABLE "Prospective_Sponsor" ADD CONSTRAINT "Prospective_Sponsor_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Sponsor_Contact"("sponsorContactId") ON DELETE RESTRICT ON UPDATE CASCADE;
