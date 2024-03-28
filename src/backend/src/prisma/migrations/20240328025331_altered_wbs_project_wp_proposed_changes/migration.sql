/*
  Warnings:

  - You are about to drop the column `orderInProject` on the `Work_Package_Proposed_Changes` table. All the data in the column will be lost.
  - Added the required column `newProject` to the `Project_Proposed_Changes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project_Proposed_Changes" ADD COLUMN     "newProject" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Wbs_Proposed_Changes" ADD COLUMN     "dateDeleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Work_Package_Proposed_Changes" DROP COLUMN "orderInProject";
