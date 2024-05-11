/*
  Warnings:

  - You are about to drop the column `projectLeadId` on the `Wbs_Proposed_Changes` table. All the data in the column will be lost.
  - You are about to drop the column `projectManagerId` on the `Wbs_Proposed_Changes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Wbs_Proposed_Changes" DROP CONSTRAINT "Wbs_Proposed_Changes_projectLeadId_fkey";

-- DropForeignKey
ALTER TABLE "Wbs_Proposed_Changes" DROP CONSTRAINT "Wbs_Proposed_Changes_projectManagerId_fkey";

-- AlterTable
ALTER TABLE "Wbs_Proposed_Changes" DROP COLUMN "projectLeadId",
DROP COLUMN "projectManagerId",
ADD COLUMN     "leadId" INTEGER,
ADD COLUMN     "managerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
