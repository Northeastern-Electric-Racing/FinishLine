/*
  Warnings:

  - Added the required column `initialDateScheduled` to the `Design_Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateSet` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurringInterval` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" ALTER COLUMN "dateSet" DROP DEFAULT;

/* Drop all existing availabilities */
DELETE FROM "Availability";

-- AlterTable
ALTER TABLE "Design_Review" ADD COLUMN "initialDateScheduled" DATE DEFAULT '2000-01-01';

/* Insert Initial Date Scheduled to equal dateScheduled for all existing Design Reviews */
UPDATE "Design_Review" SET "initialDateScheduled" = "dateScheduled";

/* Drop the default value */
ALTER TABLE "Design_Review" ALTER COLUMN "initialDateScheduled" SET NOT NULL;
ALTER TABLE "Design_Review" ALTER COLUMN "initialDateScheduled" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "dateSet" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "recurringInterval" INTEGER NOT NULL;
