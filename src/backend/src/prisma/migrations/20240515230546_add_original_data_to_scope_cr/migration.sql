/*
  Warnings:

  - You are about to drop the column `wbsProposedChangesId` on the `Scope_CR` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[changeRequestAsOriginalDataId]` on the table `Wbs_Proposed_Changes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Wbs_Proposed_Changes" DROP CONSTRAINT "Wbs_Proposed_Changes_changeRequestId_fkey";

-- AlterTable
ALTER TABLE "Scope_CR" DROP COLUMN "wbsProposedChangesId";

-- AlterTable
ALTER TABLE "Wbs_Proposed_Changes" ADD COLUMN     "changeRequestAsOriginalDataId" INTEGER,
ALTER COLUMN "changeRequestId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Wbs_Proposed_Changes_changeRequestAsOriginalDataId_key" ON "Wbs_Proposed_Changes"("changeRequestAsOriginalDataId");

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Scope_CR"("scopeCrId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_changeRequestAsOriginalDataId_fkey" FOREIGN KEY ("changeRequestAsOriginalDataId") REFERENCES "Scope_CR"("scopeCrId") ON DELETE SET NULL ON UPDATE CASCADE;
