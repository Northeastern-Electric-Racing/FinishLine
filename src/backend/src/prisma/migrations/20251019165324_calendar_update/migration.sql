/*
  Warnings:

  - Made the column `approved` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `endDate` to the `ScheduleSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "approved" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."EventType" ALTER COLUMN "initialDateScheduled" DROP DEFAULT,
ALTER COLUMN "allDay" DROP DEFAULT,
ALTER COLUMN "recurring" DROP DEFAULT,
ALTER COLUMN "members" DROP DEFAULT,
ALTER COLUMN "location" DROP DEFAULT,
ALTER COLUMN "zoomLink" DROP DEFAULT,
ALTER COLUMN "availabilities" DROP DEFAULT,
ALTER COLUMN "shop" DROP DEFAULT,
ALTER COLUMN "machinery" DROP DEFAULT,
ALTER COLUMN "workPackage" DROP DEFAULT,
ALTER COLUMN "questionDocument" DROP DEFAULT,
ALTER COLUMN "documents" DROP DEFAULT,
ALTER COLUMN "description" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."ScheduleSlot" ADD COLUMN     "endDate" DATE NOT NULL;
