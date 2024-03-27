/*
  Warnings:

  - You are about to drop the column `projectLeadId` on the `WBS_Element` table. All the data in the column will be lost.
  - You are about to drop the column `projectManagerId` on the `WBS_Element` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WBS_Element" DROP CONSTRAINT "WBS_Element_projectLeadId_fkey";

-- DropForeignKey
ALTER TABLE "WBS_Element" DROP CONSTRAINT "WBS_Element_projectManagerId_fkey";

-- AlterTable
ALTER TABLE "WBS_Element" DROP COLUMN "projectLeadId",
DROP COLUMN "projectManagerId",
ADD COLUMN     "leadId" INTEGER,
ADD COLUMN     "managerId" INTEGER;

-- AddForeignKey
ALTER TABLE "WBS_Element" ADD CONSTRAINT "WBS_Element_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element" ADD CONSTRAINT "WBS_Element_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
