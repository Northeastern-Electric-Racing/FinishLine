/*
  Warnings:

  - You are about to drop the column `projectId` on the `Task` table. All the data in the column will be lost.
  - Added the required column `wbsElementId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "projectId",
ADD COLUMN     "wbsElementId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;
