/*
  Warnings:

  - Added the required column `initialDateScheduled` to the `Design_Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateSet` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurringInterval` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" ALTER COLUMN "dateSet" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Design_Review" ADD COLUMN     "initialDateScheduled" DATE NOT NULL;

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "dateSet" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "recurringInterval" INTEGER NOT NULL;
