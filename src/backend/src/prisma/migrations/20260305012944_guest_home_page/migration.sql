/*
  Warnings:

  - You are about to drop the column `applyInterestImageId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `exploreAsGuestImageId` on the `Organization` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sponsor" DROP CONSTRAINT "Sponsor_sponsorTierId_fkey";

-- AlterTable
ALTER TABLE "Link_Type" ADD COLUMN     "isOnGuestHomePage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "applyInterestImageId",
DROP COLUMN "exploreAsGuestImageId",
ADD COLUMN     "platformDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "platformLogoImageId" TEXT;

-- AlterTable
ALTER TABLE "Sponsor" ALTER COLUMN "valueTypes" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_sponsorTierId_fkey" FOREIGN KEY ("sponsorTierId") REFERENCES "Sponsor_Tier"("sponsorTierId") ON DELETE SET NULL ON UPDATE CASCADE;
