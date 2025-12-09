/*
  Warnings:

  - You are about to drop the column `designReviewId` on the `Message_Info` table. All the data in the column will be lost.
  - You are about to drop the `Design_Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_confirmedAttendee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_deniedAttendee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_optionalAttendee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_requiredAttendee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_userAttended` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Event_Status" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'SCHEDULED', 'DONE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ConflictStatus" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'DENIED');

-- DropForeignKey
ALTER TABLE "public"."Design_Review" DROP CONSTRAINT "Design_Review_teamTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Design_Review" DROP CONSTRAINT "Design_Review_userCreatedId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Design_Review" DROP CONSTRAINT "Design_Review_userDeletedId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Design_Review" DROP CONSTRAINT "Design_Review_wbsElementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Meeting" DROP CONSTRAINT "Meeting_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message_Info" DROP CONSTRAINT "Message_Info_designReviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_confirmedAttendee" DROP CONSTRAINT "_confirmedAttendee_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_confirmedAttendee" DROP CONSTRAINT "_confirmedAttendee_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_deniedAttendee" DROP CONSTRAINT "_deniedAttendee_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_deniedAttendee" DROP CONSTRAINT "_deniedAttendee_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_optionalAttendee" DROP CONSTRAINT "_optionalAttendee_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_optionalAttendee" DROP CONSTRAINT "_optionalAttendee_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_requiredAttendee" DROP CONSTRAINT "_requiredAttendee_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_requiredAttendee" DROP CONSTRAINT "_requiredAttendee_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_userAttended" DROP CONSTRAINT "_userAttended_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_userAttended" DROP CONSTRAINT "_userAttended_B_fkey";

-- DropIndex
DROP INDEX "public"."Message_Info_designReviewId_idx";

-- AlterTable
ALTER TABLE "Message_Info" DROP COLUMN "designReviewId",
ADD COLUMN     "eventId" TEXT;

-- DropTable
DROP TABLE "public"."Design_Review";

-- DropTable
DROP TABLE "public"."Meeting";

-- DropTable
DROP TABLE "public"."_confirmedAttendee";

-- DropTable
DROP TABLE "public"."_deniedAttendee";

-- DropTable
DROP TABLE "public"."_optionalAttendee";

-- DropTable
DROP TABLE "public"."_requiredAttendee";

-- DropTable
DROP TABLE "public"."_userAttended";

-- DropEnum
DROP TYPE "public"."Design_Review_Status";

-- CreateTable
CREATE TABLE "Shop" (
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "description" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("shopId")
);

-- CreateTable
CREATE TABLE "Machinery" (
    "machineryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Machinery_pkey" PRIMARY KEY ("machineryId")
);

-- CreateTable
CREATE TABLE "Shop_Machinery" (
    "shopMachineryId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "machineryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Shop_Machinery_pkey" PRIMARY KEY ("shopMachineryId")
);

-- CreateTable
CREATE TABLE "Schedule_Slot" (
    "scheduleSlotId" TEXT NOT NULL,
    "days" "DayOfWeek"[],
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "recurrenceNumber" INTEGER NOT NULL,
    "initialDateScheduled" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Schedule_Slot_pkey" PRIMARY KEY ("scheduleSlotId")
);

-- CreateTable
CREATE TABLE "Event" (
    "eventId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "eventTypeId" TEXT NOT NULL,
    "approved" "ConflictStatus",
    "approvalRequiredFromUserId" TEXT,
    "teamTypeId" TEXT,
    "location" TEXT,
    "zoomLink" TEXT,
    "documentIds" TEXT[],
    "status" "Event_Status" NOT NULL,
    "questionDocument" TEXT,
    "description" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "Calendar" (
    "calendarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "description" TEXT NOT NULL,
    "colorHexCode" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("calendarId")
);

-- CreateTable
CREATE TABLE "Event_Type" (
    "eventTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "requiredMembers" BOOLEAN NOT NULL,
    "optionalMembers" BOOLEAN NOT NULL,
    "teams" BOOLEAN NOT NULL,
    "teamType" BOOLEAN NOT NULL,
    "location" BOOLEAN NOT NULL,
    "zoomLink" BOOLEAN NOT NULL,
    "shop" BOOLEAN NOT NULL,
    "machinery" BOOLEAN NOT NULL,
    "workPackage" BOOLEAN NOT NULL,
    "questionDocument" BOOLEAN NOT NULL,
    "documents" BOOLEAN NOT NULL,
    "description" BOOLEAN NOT NULL,
    "onlyHeadsOrAboveForEventCreation" BOOLEAN NOT NULL,
    "requiresConfirmation" BOOLEAN NOT NULL,
    "sendSlackNotifications" BOOLEAN NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Event_Type_pkey" PRIMARY KEY ("eventTypeId")
);

-- CreateTable
CREATE TABLE "_EventToSchedule_Slot" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToSchedule_Slot_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_requiredEventAttendee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_requiredEventAttendee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_optionalEventAttendee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_optionalEventAttendee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_confirmedEventAttendee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_confirmedEventAttendee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_deniedEventAttendee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_deniedEventAttendee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_affiliatedTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_affiliatedTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventToShop" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToShop_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventToMachinery" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToMachinery_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventToWork_Package" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToWork_Package_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CalendarToEvent_Type" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CalendarToEvent_Type_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_name_key" ON "Shop"("name");

-- CreateIndex
CREATE INDEX "Shop_Machinery_machineryId_idx" ON "Shop_Machinery"("machineryId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_Machinery_shopId_machineryId_key" ON "Shop_Machinery"("shopId", "machineryId");

-- CreateIndex
CREATE INDEX "Schedule_Slot_initialDateScheduled_endDate_idx" ON "Schedule_Slot"("initialDateScheduled", "endDate");

-- CreateIndex
CREATE INDEX "_EventToSchedule_Slot_B_index" ON "_EventToSchedule_Slot"("B");

-- CreateIndex
CREATE INDEX "_requiredEventAttendee_B_index" ON "_requiredEventAttendee"("B");

-- CreateIndex
CREATE INDEX "_optionalEventAttendee_B_index" ON "_optionalEventAttendee"("B");

-- CreateIndex
CREATE INDEX "_confirmedEventAttendee_B_index" ON "_confirmedEventAttendee"("B");

-- CreateIndex
CREATE INDEX "_deniedEventAttendee_B_index" ON "_deniedEventAttendee"("B");

-- CreateIndex
CREATE INDEX "_affiliatedTeam_B_index" ON "_affiliatedTeam"("B");

-- CreateIndex
CREATE INDEX "_EventToShop_B_index" ON "_EventToShop"("B");

-- CreateIndex
CREATE INDEX "_EventToMachinery_B_index" ON "_EventToMachinery"("B");

-- CreateIndex
CREATE INDEX "_EventToWork_Package_B_index" ON "_EventToWork_Package"("B");

-- CreateIndex
CREATE INDEX "_CalendarToEvent_Type_B_index" ON "_CalendarToEvent_Type"("B");

-- CreateIndex
CREATE INDEX "Message_Info_eventId_idx" ON "Message_Info"("eventId");

-- AddForeignKey
ALTER TABLE "Message_Info" ADD CONSTRAINT "Message_Info_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machinery" ADD CONSTRAINT "Machinery_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machinery" ADD CONSTRAINT "Machinery_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machinery" ADD CONSTRAINT "Machinery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop_Machinery" ADD CONSTRAINT "Shop_Machinery_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("shopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop_Machinery" ADD CONSTRAINT "Shop_Machinery_machineryId_fkey" FOREIGN KEY ("machineryId") REFERENCES "Machinery"("machineryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "Event_Type"("eventTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_approvalRequiredFromUserId_fkey" FOREIGN KEY ("approvalRequiredFromUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "Team_Type"("teamTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Type" ADD CONSTRAINT "Event_Type_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Type" ADD CONSTRAINT "Event_Type_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Type" ADD CONSTRAINT "Event_Type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToSchedule_Slot" ADD CONSTRAINT "_EventToSchedule_Slot_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToSchedule_Slot" ADD CONSTRAINT "_EventToSchedule_Slot_B_fkey" FOREIGN KEY ("B") REFERENCES "Schedule_Slot"("scheduleSlotId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiredEventAttendee" ADD CONSTRAINT "_requiredEventAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiredEventAttendee" ADD CONSTRAINT "_requiredEventAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionalEventAttendee" ADD CONSTRAINT "_optionalEventAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionalEventAttendee" ADD CONSTRAINT "_optionalEventAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_confirmedEventAttendee" ADD CONSTRAINT "_confirmedEventAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_confirmedEventAttendee" ADD CONSTRAINT "_confirmedEventAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deniedEventAttendee" ADD CONSTRAINT "_deniedEventAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deniedEventAttendee" ADD CONSTRAINT "_deniedEventAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_affiliatedTeam" ADD CONSTRAINT "_affiliatedTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_affiliatedTeam" ADD CONSTRAINT "_affiliatedTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToShop" ADD CONSTRAINT "_EventToShop_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToShop" ADD CONSTRAINT "_EventToShop_B_fkey" FOREIGN KEY ("B") REFERENCES "Shop"("shopId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToMachinery" ADD CONSTRAINT "_EventToMachinery_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToMachinery" ADD CONSTRAINT "_EventToMachinery_B_fkey" FOREIGN KEY ("B") REFERENCES "Machinery"("machineryId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToWork_Package" ADD CONSTRAINT "_EventToWork_Package_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToWork_Package" ADD CONSTRAINT "_EventToWork_Package_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package"("workPackageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarToEvent_Type" ADD CONSTRAINT "_CalendarToEvent_Type_A_fkey" FOREIGN KEY ("A") REFERENCES "Calendar"("calendarId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CalendarToEvent_Type" ADD CONSTRAINT "_CalendarToEvent_Type_B_fkey" FOREIGN KEY ("B") REFERENCES "Event_Type"("eventTypeId") ON DELETE CASCADE ON UPDATE CASCADE;
