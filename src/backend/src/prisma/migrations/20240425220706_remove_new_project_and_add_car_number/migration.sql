/*
  Warnings:

  - You are about to drop the column `newProject` on the `Project_Proposed_Changes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project_Proposed_Changes" DROP COLUMN "newProject",
ADD COLUMN     "carNumber" INTEGER;
