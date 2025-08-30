/*
  Warnings:

  - You are about to drop the column `vendorContact` on the `Sponsor` table. All the data in the column will be lost.
  - Added the required column `sponsorContact` to the `Sponsor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sponsor" DROP COLUMN "vendorContact",
ADD COLUMN     "sponsorContact" TEXT NOT NULL;
