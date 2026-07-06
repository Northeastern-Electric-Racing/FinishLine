/*
  Warnings:

  - The values [ISSUE,DEFINITION_CHANGE,OTHER] on the enum `CR_Type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `scopeChangeRequestAsOriginalDataId` on the `Wbs_Proposed_Changes` table. All the data in the column will be lost.
  - You are about to drop the column `scopeChangeRequestId` on the `Wbs_Proposed_Changes` table. All the data in the column will be lost.
  - You are about to drop the `Proposed_Solution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Scope_CR` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Scope_CR_Why` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[wbsProposedChangesId]` on the table `Change_Request` will be added. If there are existing duplicate values, this will fail.

*/

ALTER TYPE "CR_Type" ADD VALUE 'STANDARD';

COMMIT;

BEGIN;

-- Step 1: Add why column so the backfill can write to it
ALTER TABLE "Change_Request" ADD COLUMN "why" TEXT;

-- Step 2: Backfill
UPDATE "Change_Request" cr
SET 
  why = CONCAT(
    'Type: ', cr.type::text,
    CASE WHEN sc.what IS NOT NULL THEN CONCAT(E'\nWhat: ', sc.what) ELSE '' END,
    CASE WHEN why_agg.why_text IS NOT NULL THEN CONCAT(E'\nWhy: ', why_agg.why_text) ELSE '' END
  ),
  type = 'STANDARD'::"CR_Type"
FROM "Scope_CR" sc
LEFT JOIN (
  SELECT 
    "scopeCrId",
    STRING_AGG(CONCAT(type::text, ': ', explain), ', ') as why_text
  FROM "Scope_CR_Why"
  GROUP BY "scopeCrId"
) why_agg ON why_agg."scopeCrId" = sc."scopeCrId"
WHERE sc."changeRequestId" = cr."crId"
AND cr.type IN ('ISSUE', 'DEFINITION_CHANGE', 'OTHER');

-- Step 3: Replace enum
CREATE TYPE "CR_Type_new" AS ENUM ('LEADERSHIP', 'STAGE_GATE', 'ACTIVATION', 'BUDGET', 'STANDARD');
ALTER TABLE "Change_Request" ALTER COLUMN "type" TYPE "CR_Type_new" USING ("type"::text::"CR_Type_new");
ALTER TYPE "CR_Type" RENAME TO "CR_Type_old";
ALTER TYPE "CR_Type_new" RENAME TO "CR_Type";
DROP TYPE "CR_Type_old";

-- Step 4: Add wbsProposedChangesId (why already added above, remove it from here)
ALTER TABLE "Change_Request" ADD COLUMN "wbsProposedChangesId" TEXT;

-- DropForeignKey
ALTER TABLE "Proposed_Solution" DROP CONSTRAINT "Proposed_Solution_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Proposed_Solution" DROP CONSTRAINT "Proposed_Solution_scopeChangeRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Scope_CR" DROP CONSTRAINT "Scope_CR_changeRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Scope_CR_Why" DROP CONSTRAINT "Scope_CR_Why_scopeCrId_fkey";

-- DropForeignKey
ALTER TABLE "Wbs_Proposed_Changes" DROP CONSTRAINT "Wbs_Proposed_Changes_scopeChangeRequestAsOriginalDataId_fkey";

-- DropForeignKey
ALTER TABLE "Wbs_Proposed_Changes" DROP CONSTRAINT "Wbs_Proposed_Changes_scopeChangeRequestId_fkey";

-- DropIndex
DROP INDEX "Wbs_Proposed_Changes_scopeChangeRequestAsOriginalDataId_idx";

-- DropIndex
DROP INDEX "Wbs_Proposed_Changes_scopeChangeRequestAsOriginalDataId_key";

-- DropIndex
DROP INDEX "Wbs_Proposed_Changes_scopeChangeRequestId_idx";

-- DropIndex
DROP INDEX "Wbs_Proposed_Changes_scopeChangeRequestId_key";

-- AlterTable
ALTER TABLE "Wbs_Proposed_Changes" DROP COLUMN "scopeChangeRequestAsOriginalDataId",
DROP COLUMN "scopeChangeRequestId";

-- DropTable
DROP TABLE "Proposed_Solution";

-- DropTable
DROP TABLE "Scope_CR";

-- DropTable
DROP TABLE "Scope_CR_Why";

-- DropEnum
DROP TYPE "Scope_CR_Why_Type";

-- CreateIndex
CREATE UNIQUE INDEX "Change_Request_wbsProposedChangesId_key" ON "Change_Request"("wbsProposedChangesId");

-- AddForeignKey
ALTER TABLE "Change_Request" ADD CONSTRAINT "Change_Request_wbsProposedChangesId_fkey" FOREIGN KEY ("wbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
