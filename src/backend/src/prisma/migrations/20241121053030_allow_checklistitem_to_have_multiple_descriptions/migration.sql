/*
  Warnings:

  - You are about to drop the column `description` on the `ChecklistItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChecklistItem" DROP COLUMN "description",
ADD COLUMN     "descriptions" TEXT[];
