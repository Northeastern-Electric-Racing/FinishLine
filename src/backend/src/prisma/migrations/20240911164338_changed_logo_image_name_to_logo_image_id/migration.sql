/*
  Warnings:

  - You are about to drop the column `logoImage` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "logoImage",
ADD COLUMN     "logoImageId" TEXT;
