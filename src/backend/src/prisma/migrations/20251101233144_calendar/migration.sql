-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "public"."Shop" (
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
CREATE TABLE "public"."Machinery" (
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
CREATE TABLE "public"."Shop_Machinery" (
    "description" TEXT,
    "shopMachineryId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "machineryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Shop_Machinery_pkey" PRIMARY KEY ("shopMachineryId")
);

-- CreateTable
CREATE TABLE "public"."Schedule_Slot" (
    "scheduleSlotId" TEXT NOT NULL,
    "days" "public"."DayOfWeek"[],
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "recurrenceNumber" INTEGER NOT NULL,
    "initialDateScheduled" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Schedule_Slot_pkey" PRIMARY KEY ("scheduleSlotId")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "eventId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "eventTypeId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvalRequiredFromUserId" TEXT,
    "location" TEXT,
    "zoomLink" TEXT,
    "documentIds" TEXT[],
    "questionDocument" TEXT,
    "description" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "public"."Calendar" (
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
CREATE TABLE "public"."Event_Type" (
    "eventTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "initialDateScheduled" BOOLEAN NOT NULL DEFAULT FALSE,
    "allDay" BOOLEAN NOT NULL DEFAULT FALSE,
    "recurring" BOOLEAN NOT NULL DEFAULT FALSE,
    "optionalMembers" BOOLEAN NOT NULL DEFAULT FALSE,
    "requiredMembers" BOOLEAN NOT NULL DEFAULT FALSE,
    "teams" BOOLEAN NOT NULL DEFAULT FALSE,
    "location" BOOLEAN NOT NULL DEFAULT FALSE,
    "zoomLink" BOOLEAN NOT NULL DEFAULT FALSE,
    "shop" BOOLEAN NOT NULL DEFAULT FALSE,
    "machinery" BOOLEAN NOT NULL DEFAULT FALSE,
    "workPackage" BOOLEAN NOT NULL DEFAULT FALSE,
    "questionDocument" BOOLEAN NOT NULL DEFAULT FALSE,
    "documents" BOOLEAN NOT NULL DEFAULT FALSE, 
    "description" BOOLEAN NOT NULL DEFAULT FALSE,
    "onlyHeadsOrAboveForEventCreation" BOOLEAN NOT NULL DEFAULT FALSE,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT FALSE,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Event_Type_pkey" PRIMARY KEY ("eventTypeId")
);

-- CreateEnum
CREATE TYPE "public"."Event_Status" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'SCHEDULED', 'DONE');

-- AlterTable
ALTER TABLE "public"."Design_Review" DROP COLUMN "status",
ADD COLUMN     "status" "public"."Event_Status" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "status" "public"."Event_Status" NOT NULL;

-- DropEnum
DROP TYPE "public"."Design_Review_Status";

-- CreateTable
CREATE TABLE "public"."_EventToSchedule_Slot" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToSchedule_Slot_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_affiliatedTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_affiliatedTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EventToShop" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToShop_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EventToMachinery" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToMachinery_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EventToWork_Package" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToWork_Package_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CalendarToEvent_Type" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CalendarToEvent_Type_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_requiredEventAttendee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_requiredEventAttendee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_optionalEventAttendee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_optionalEventAttendee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_confirmedEventAttendee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_confirmedEventAttendee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_deniedEventAttendee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_deniedEventAttendee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_requiredEventAttendee_B_index" ON "public"."_requiredEventAttendee"("B");

-- CreateIndex
CREATE INDEX "_optionalEventAttendee_B_index" ON "public"."_optionalEventAttendee"("B");

-- CreateIndex
CREATE INDEX "_confirmedEventAttendee_B_index" ON "public"."_confirmedEventAttendee"("B");

-- CreateIndex
CREATE INDEX "_deniedEventAttendee_B_index" ON "public"."_deniedEventAttendee"("B");

-- AddForeignKey
ALTER TABLE "public"."_requiredEventAttendee" ADD CONSTRAINT "_requiredEventAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_requiredEventAttendee" ADD CONSTRAINT "_requiredEventAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_optionalEventAttendee" ADD CONSTRAINT "_optionalEventAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_optionalEventAttendee" ADD CONSTRAINT "_optionalEventAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_confirmedEventAttendee" ADD CONSTRAINT "_confirmedEventAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_confirmedEventAttendee" ADD CONSTRAINT "_confirmedEventAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_deniedEventAttendee" ADD CONSTRAINT "_deniedEventAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_deniedEventAttendee" ADD CONSTRAINT "_deniedEventAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Shop_name_key" ON "public"."Shop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_name_organizationId_key" ON "public"."Shop"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Machinery_name_organizationId_key" ON "public"."Machinery"("name", "organizationId");

-- CreateIndex
CREATE INDEX "Shop_Machinery_machineryId_idx" ON "public"."Shop_Machinery"("machineryId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_Machinery_shopId_machineryId_key" ON "public"."Shop_Machinery"("shopId", "machineryId");

-- CreateIndex
CREATE INDEX "Schedule_Slot_initialDateScheduled_endDate_idx" ON "public"."Schedule_Slot"("initialDateScheduled", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_name_organizationId_key" ON "public"."Calendar"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_Type_name_organizationId_key" ON "public"."Event_Type"("name", "organizationId");

-- CreateIndex
CREATE INDEX "_EventToSchedule_Slot_B_index" ON "public"."_EventToSchedule_Slot"("B");

-- CreateIndex
CREATE INDEX "_affiliatedTeam_B_index" ON "public"."_affiliatedTeam"("B");

-- CreateIndex
CREATE INDEX "_EventToShop_B_index" ON "public"."_EventToShop"("B");

-- CreateIndex
CREATE INDEX "_EventToMachinery_B_index" ON "public"."_EventToMachinery"("B");

-- CreateIndex
CREATE INDEX "_EventToWork_Package_B_index" ON "public"."_EventToWork_Package"("B");

-- CreateIndex
CREATE INDEX "_CalendarToEvent_Type_B_index" ON "public"."_CalendarToEvent_Type"("B");

-- AddForeignKey
ALTER TABLE "public"."Shop" ADD CONSTRAINT "Shop_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shop" ADD CONSTRAINT "Shop_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shop" ADD CONSTRAINT "Shop_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Machinery" ADD CONSTRAINT "Machinery_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Machinery" ADD CONSTRAINT "Machinery_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Machinery" ADD CONSTRAINT "Machinery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shop_Machinery" ADD CONSTRAINT "Shop_Machinery_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."Shop"("shopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shop_Machinery" ADD CONSTRAINT "Shop_Machinery_machineryId_fkey" FOREIGN KEY ("machineryId") REFERENCES "public"."Machinery"("machineryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "public"."Event_Type"("eventTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_approvalRequiredFromUserId_fkey" FOREIGN KEY ("approvalRequiredFromUserId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calendar" ADD CONSTRAINT "Calendar_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calendar" ADD CONSTRAINT "Calendar_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calendar" ADD CONSTRAINT "Calendar_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event_Type" ADD CONSTRAINT "Event_Type_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event_Type" ADD CONSTRAINT "Event_Type_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event_Type" ADD CONSTRAINT "Event_Type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToSchedule_Slot" ADD CONSTRAINT "_EventToSchedule_Slot_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToSchedule_Slot" ADD CONSTRAINT "_EventToSchedule_Slot_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Schedule_Slot"("scheduleSlotId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_affiliatedTeam" ADD CONSTRAINT "_affiliatedTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_affiliatedTeam" ADD CONSTRAINT "_affiliatedTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToShop" ADD CONSTRAINT "_EventToShop_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToShop" ADD CONSTRAINT "_EventToShop_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Shop"("shopId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToMachinery" ADD CONSTRAINT "_EventToMachinery_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToMachinery" ADD CONSTRAINT "_EventToMachinery_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Machinery"("machineryId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToWork_Package" ADD CONSTRAINT "_EventToWork_Package_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToWork_Package" ADD CONSTRAINT "_EventToWork_Package_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Work_Package"("workPackageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CalendarToEvent_Type" ADD CONSTRAINT "_CalendarToEvent_Type_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Calendar"("calendarId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CalendarToEvent_Type" ADD CONSTRAINT "_CalendarToEvent_Type_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Event_Type"("eventTypeId") ON DELETE CASCADE ON UPDATE CASCADE;
