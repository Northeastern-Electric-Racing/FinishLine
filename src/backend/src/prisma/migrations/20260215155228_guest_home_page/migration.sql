/*
  Warnings:

  - You are about to drop the column `applyInterestImageId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `exploreAsGuestImageId` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "applyInterestImageId",
DROP COLUMN "exploreAsGuestImageId",
ADD COLUMN     "finishlineDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "finishlineLogo" TEXT;
