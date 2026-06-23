/*
  Warnings:

  - You are about to drop the column `currentStatus` on the `Project_Rule` table. All the data in the column will be lost.
  - You are about to drop the `Rule_Status_Change` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rule_Status_Change" DROP CONSTRAINT "Rule_Status_Change_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Rule_Status_Change" DROP CONSTRAINT "Rule_Status_Change_deletedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Rule_Status_Change" DROP CONSTRAINT "Rule_Status_Change_projectRuleId_fkey";

-- AlterTable
ALTER TABLE "Project_Rule" DROP COLUMN "currentStatus";

-- AlterTable
ALTER TABLE "Rule" ADD COLUMN     "completedByUserId" TEXT,
ADD COLUMN     "completedInProjectId" TEXT,
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Rule_Status_Change";

-- DropEnum
DROP TYPE "Rule_Completion";

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_completedInProjectId_fkey" FOREIGN KEY ("completedInProjectId") REFERENCES "Project"("projectId") ON DELETE SET NULL ON UPDATE CASCADE;
