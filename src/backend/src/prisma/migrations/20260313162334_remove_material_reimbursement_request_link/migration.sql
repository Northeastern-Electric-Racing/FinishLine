/*
  Warnings:

  - You are about to drop the column `reimbursementRequestId` on the `Material` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_reimbursementRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Sponsor" DROP CONSTRAINT "Sponsor_sponsorTierId_fkey";

-- DropIndex
DROP INDEX "Material_reimbursementRequestId_idx";

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "reimbursementRequestId";

-- AlterTable
ALTER TABLE "Sponsor" ALTER COLUMN "valueTypes" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_sponsorTierId_fkey" FOREIGN KEY ("sponsorTierId") REFERENCES "Sponsor_Tier"("sponsorTierId") ON DELETE SET NULL ON UPDATE CASCADE;
