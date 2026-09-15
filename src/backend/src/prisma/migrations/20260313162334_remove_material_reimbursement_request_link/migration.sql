/*
  Warnings:

  - You are about to drop the column `reimbursementRequestId` on the `Material` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_reimbursementRequestId_fkey";

-- DropIndex
DROP INDEX "Material_reimbursementRequestId_idx";

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "reimbursementRequestId";
