/*
  Warnings:

  - You are about to drop the column `availability` on the `Schedule_Settings` table. All the data in the column will be lost.

*/

-- CreateTable
CREATE TABLE "Availability" (
    "availabilityId" TEXT NOT NULL,
    "scheduleSettingsId" TEXT NOT NULL,
    "availability" INTEGER[],
    "dateSet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("availabilityId")
);

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_scheduleSettingsId_fkey" FOREIGN KEY ("scheduleSettingsId") REFERENCES "Schedule_Settings"("drScheduleSettingsId") ON DELETE RESTRICT ON UPDATE CASCADE;

/* Migrate all existing availabilities to new availability table */
INSERT INTO "Availability" ("availabilityId", "scheduleSettingsId", "availability", "dateSet") SELECT gen_random_uuid(), "drScheduleSettingsId", "availability", CURRENT_TIMESTAMP FROM "Schedule_Settings";

-- AlterTable
ALTER TABLE "Schedule_Settings" DROP COLUMN "availability";


