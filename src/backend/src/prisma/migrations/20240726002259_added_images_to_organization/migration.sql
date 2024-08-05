/*
  Warnings:

  - A unique constraint covering the columns `[applyInterestImageId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[exploreAsGuestImageId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "applyInterestImageId" TEXT,
ADD COLUMN     "exploreAsGuestImageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_applyInterestImageId_key" ON "Organization"("applyInterestImageId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_exploreAsGuestImageId_key" ON "Organization"("exploreAsGuestImageId");
