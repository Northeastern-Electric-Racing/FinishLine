-- AlterTable
ALTER TABLE "public"."Availability" ADD COLUMN     "eventId" TEXT;

-- CreateTable
CREATE TABLE "public"."Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Machinery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Machinery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "eventTypeId" TEXT NOT NULL,
    "approved" BOOLEAN,
    "approvedByUserId" TEXT,
    "meetingTimes" INTEGER[],
    "initialDateScheduled" DATE NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "memberId" TEXT,
    "location" TEXT,
    "zoomLink" TEXT,
    "shopId" TEXT,
    "machineryId" TEXT,
    "workPackageId" TEXT,
    "description" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Calendar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "description" TEXT NOT NULL DEFAULT '',
    "colorHexCode" TEXT NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "calendarId" TEXT NOT NULL,
    "meetingTimes" BOOLEAN,
    "initialDateScheduled" BOOLEAN,
    "allDay" BOOLEAN,
    "recurring" BOOLEAN,
    "members" BOOLEAN,
    "location" BOOLEAN,
    "zoomLink" BOOLEAN,
    "availabilities" BOOLEAN,
    "shop" BOOLEAN,
    "machinery" BOOLEAN,
    "workPackage" BOOLEAN,
    "documents" BOOLEAN,
    "description" BOOLEAN,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_MachineryToShop" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MachineryToShop_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MachineryToShop_B_index" ON "public"."_MachineryToShop"("B");

-- AddForeignKey
ALTER TABLE "public"."Shop" ADD CONSTRAINT "Shop_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shop" ADD CONSTRAINT "Shop_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Machinery" ADD CONSTRAINT "Machinery_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Machinery" ADD CONSTRAINT "Machinery_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "public"."EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_machineryId_fkey" FOREIGN KEY ("machineryId") REFERENCES "public"."Machinery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_workPackageId_fkey" FOREIGN KEY ("workPackageId") REFERENCES "public"."Work_Package"("workPackageId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventType" ADD CONSTRAINT "EventType_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MachineryToShop" ADD CONSTRAINT "_MachineryToShop_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Machinery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MachineryToShop" ADD CONSTRAINT "_MachineryToShop_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `Calendar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Calendar` table. All the data in the column will be lost.
  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `recurring` on the `Event` table. All the data in the column will be lost.
  - The primary key for the `EventType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EventType` table. All the data in the column will be lost.
  - The primary key for the `Machinery` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Machinery` table. All the data in the column will be lost.
  - The primary key for the `Shop` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Shop` table. All the data in the column will be lost.
  - The required column `calendarId` was added to the `Calendar` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userCreatedId` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - The required column `eventId` was added to the `Event` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `recurringInterval` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userCreatedId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - The required column `eventTypeId` was added to the `EventType` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userCreatedId` to the `EventType` table without a default value. This is not possible if the table is not empty.
  - The required column `machineryId` was added to the `Machinery` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `shopId` was added to the `Shop` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."Availability" DROP CONSTRAINT "Availability_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_eventTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_machineryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_memberId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_shopId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventType" DROP CONSTRAINT "EventType_calendarId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MachineryToShop" DROP CONSTRAINT "_MachineryToShop_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MachineryToShop" DROP CONSTRAINT "_MachineryToShop_B_fkey";

-- AlterTable
ALTER TABLE "public"."Calendar" DROP CONSTRAINT "Calendar_pkey",
DROP COLUMN "id",
ADD COLUMN     "calendarId" TEXT NOT NULL,
ADD COLUMN     "userCreatedId" TEXT NOT NULL,
ADD COLUMN     "userDeletedId" TEXT,
ADD CONSTRAINT "Calendar_pkey" PRIMARY KEY ("calendarId");

-- AlterTable
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_pkey",
DROP COLUMN "id",
DROP COLUMN "recurring",
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "recurringInterval" INTEGER NOT NULL,
ADD COLUMN     "userCreatedId" TEXT NOT NULL,
ADD COLUMN     "userDeletedId" TEXT,
ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("eventId");

-- AlterTable
ALTER TABLE "public"."EventType" DROP CONSTRAINT "EventType_pkey",
DROP COLUMN "id",
ADD COLUMN     "eventTypeId" TEXT NOT NULL,
ADD COLUMN     "userCreatedId" TEXT NOT NULL,
ADD COLUMN     "userDeletedId" TEXT,
ADD CONSTRAINT "EventType_pkey" PRIMARY KEY ("eventTypeId");

-- AlterTable
ALTER TABLE "public"."Machinery" DROP CONSTRAINT "Machinery_pkey",
DROP COLUMN "id",
ADD COLUMN     "machineryId" TEXT NOT NULL,
ADD CONSTRAINT "Machinery_pkey" PRIMARY KEY ("machineryId");

-- AlterTable
ALTER TABLE "public"."Shop" DROP CONSTRAINT "Shop_pkey",
DROP COLUMN "id",
ADD COLUMN     "shopId" TEXT NOT NULL,
ADD CONSTRAINT "Shop_pkey" PRIMARY KEY ("shopId");

-- CreateTable
CREATE TABLE "public"."_eventAttender" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_eventAttender_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_eventAttender_B_index" ON "public"."_eventAttender"("B");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "public"."EventType"("eventTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("shopId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_machineryId_fkey" FOREIGN KEY ("machineryId") REFERENCES "public"."Machinery"("machineryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calendar" ADD CONSTRAINT "Calendar_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calendar" ADD CONSTRAINT "Calendar_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventType" ADD CONSTRAINT "EventType_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventType" ADD CONSTRAINT "EventType_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventType" ADD CONSTRAINT "EventType_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."Calendar"("calendarId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MachineryToShop" ADD CONSTRAINT "_MachineryToShop_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Machinery"("machineryId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MachineryToShop" ADD CONSTRAINT "_MachineryToShop_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Shop"("shopId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_eventAttender" ADD CONSTRAINT "_eventAttender_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_eventAttender" ADD CONSTRAINT "_eventAttender_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;