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
CREATE TABLE "Document" (
    "documentId" TEXT NOT NULL,
    "googleFileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deletedByUserId" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentEventId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("documentId")
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
    "questionDocumentLink" TEXT,
    "description" TEXT,
    "teamTypeId" TEXT,

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
    "optionalMembers" BOOLEAN NOT NULL DEFAULT FALSE,
    "requiredMembers" BOOLEAN NOT NULL DEFAULT FALSE,
    "teams" BOOLEAN NOT NULL DEFAULT FALSE,
    "teamType" BOOLEAN NOT NULL DEFAULT FALSE,
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
    "sendSlackNotifications" BOOLEAN NOT NULL DEFAULT FALSE,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Event_Type_pkey" PRIMARY KEY ("eventTypeId")
);

-- CreateEnum
CREATE TYPE "public"."Event_Status" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'SCHEDULED', 'DONE');

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "status" "public"."Event_Status" NOT NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX "Document_googleFileId_key" ON "Document"("googleFileId");

-- CreateIndex
CREATE INDEX "Document_documentEventId_idx" ON "Document"("documentEventId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_documentEventId_fkey" FOREIGN KEY ("documentEventId") REFERENCES "Event"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

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
CREATE INDEX "Shop_Machinery_machineryId_idx" ON "public"."Shop_Machinery"("machineryId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_Machinery_shopId_machineryId_key" ON "public"."Shop_Machinery"("shopId", "machineryId");

-- CreateIndex
CREATE INDEX "Schedule_Slot_initialDateScheduled_endDate_idx" ON "public"."Schedule_Slot"("initialDateScheduled", "endDate");

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
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "public"."Team_Type"("teamTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- Create Event_Types for Design Review (one per organization)
INSERT INTO "public"."Event_Type" (
    "eventTypeId",
    "name",
    "dateCreated",
    "userCreatedId",
    "requiredMembers",
    "optionalMembers",
    "teams",
    "teamType",
    "location",
    "zoomLink",
    "shop",
    "machinery",
    "workPackage",
    "questionDocument",
    "documents",
    "description",
    "onlyHeadsOrAboveForEventCreation",
    "requiresConfirmation",
    "organizationId"
)
SELECT DISTINCT ON (org."organizationId")
    gen_random_uuid(),
    'Design Review',
    NOW(),
    org."userCreatedId",
    true, -- requiredMembers
    true, -- optionalMembers
    false, -- teams 
    true, -- team type 
    true, -- location
    true, -- zoomLink
    false, -- shop
    false, -- machinery
    true, -- workPackage (based on wbsElementId)
    true, -- questionDocument (docTemplateLink)
    true, -- documents
    false, -- description
    true, -- onlyHeadsOrAboveForEventCreation
    true, -- requiresConfirmation
    org."organizationId"
FROM "public"."Organization" org
WHERE EXISTS (
    SELECT 1 FROM "public"."Design_Review" dr
    JOIN "public"."WBS_Element" w ON dr."wbsElementId" = w."wbsElementId"
    WHERE w."organizationId" = org."organizationId"
    AND dr."dateDeleted" IS NULL
);

-- Create Event_Types for Meeting (one per organization)
INSERT INTO "public"."Event_Type" (
    "eventTypeId",
    "name",
    "dateCreated",
    "userCreatedId",
    "requiredMembers",
    "optionalMembers",
    "teams",
    "teamType",
    "location",
    "zoomLink",
    "shop",
    "machinery",
    "workPackage",
    "questionDocument",
    "documents",
    "description",
    "onlyHeadsOrAboveForEventCreation",
    "requiresConfirmation",
    "organizationId"
)
SELECT DISTINCT ON (org."organizationId")
    gen_random_uuid(),
    'Meeting',
    NOW(),
    org."userCreatedId",
    false, -- requiredMembers
    false, -- optionalMembers
    true, -- teams
    false, -- team type
    false, -- location
    false, -- zoomLink
    false, -- shop
    false, -- machinery
    false, -- workPackage
    false, -- questionDocument
    false, -- documents
    false, -- description
    false, -- onlyHeadsOrAboveForEventCreation
    false, -- requiresConfirmation
    org."organizationId"
FROM "public"."Organization" org
WHERE EXISTS (
    SELECT 1 FROM "public"."Meeting" m
    JOIN "public"."Team" t ON m."teamId" = t."teamId"
    WHERE t."organizationId" = org."organizationId"
);

-- Migrate Design_Review records to Event table
INSERT INTO "public"."Event" (
    "eventId",
    "dateCreated",
    "dateDeleted",
    "title",
    "userCreatedId",
    "userDeletedId",
    "eventTypeId",
    "approved",
    "approvalRequiredFromUserId",
    "location",
    "zoomLink",
    "questionDocumentLink",
    "description",
    "status",
    "teamTypeId"
)
SELECT 
    dr."designReviewId",
    dr."dateCreated",
    dr."dateDeleted",
    'Design Review - ' || w."name", -- Generate title from WBS element name
    dr."userCreatedId",
    dr."userDeletedId",
    (SELECT et."eventTypeId" 
     FROM "public"."Event_Type" et 
     WHERE et."name" = 'Design Review' 
     AND et."organizationId" = w."organizationId" 
     LIMIT 1),
    CASE WHEN dr."status" IN ('CONFIRMED', 'SCHEDULED', 'DONE') THEN true ELSE false END,
    NULL, -- approvalRequiredFromUserId (not in Design_Review)
    dr."location",
    dr."zoomLink",
    dr."docTemplateLink", -- questionDocument uses docTemplateLink
    NULL, -- description (not in Design_Review)
    dr."status"::"text"::"public"."Event_Status",
    dr."teamTypeId"
FROM "public"."Design_Review" dr
JOIN "public"."WBS_Element" w ON dr."wbsElementId" = w."wbsElementId";

-- Create Schedule_Slot records for Design Reviews
-- This creates one slot per time per design review
-- Design Reviews are non-recurring, so endDate = dateScheduled
CREATE TEMP TABLE temp_dr_schedule_slots AS
SELECT 
    dr."designReviewId" as event_id,
    gen_random_uuid() as slot_id,
    ARRAY[CASE EXTRACT(DOW FROM dr."dateScheduled")
        WHEN 0 THEN 'SUNDAY'::public."DayOfWeek"
        WHEN 1 THEN 'MONDAY'::public."DayOfWeek"
        WHEN 2 THEN 'TUESDAY'::public."DayOfWeek"
        WHEN 3 THEN 'WEDNESDAY'::public."DayOfWeek"
        WHEN 4 THEN 'THURSDAY'::public."DayOfWeek"
        WHEN 5 THEN 'FRIDAY'::public."DayOfWeek"
        WHEN 6 THEN 'SATURDAY'::public."DayOfWeek"
    END] as days,
    dr."dateScheduled" + ((10 + time_slot) * INTERVAL '1 hour') as start_time,
    dr."dateScheduled" + ((11 + time_slot) * INTERVAL '1 hour') as end_time,
    0 as recurrence_number,
    dr."initialDateScheduled" as initial_date,
    dr."dateScheduled" as end_date,
    false as all_day
FROM "public"."Design_Review" dr
CROSS JOIN LATERAL unnest(dr."meetingTimes") AS time_slot;

-- Insert schedule slots from temp table
INSERT INTO "public"."Schedule_Slot" (
    "scheduleSlotId",
    "days",
    "startTime",
    "endTime",
    "recurrenceNumber",
    "initialDateScheduled",
    "endDate",
    "allDay"
)
SELECT 
    slot_id,
    days,
    start_time,
    end_time,
    recurrence_number,
    initial_date,
    end_date,
    all_day
FROM temp_dr_schedule_slots;

-- Link Schedule_Slots to Events using the temp table
INSERT INTO "public"."_EventToSchedule_Slot" ("A", "B")
SELECT event_id, slot_id
FROM temp_dr_schedule_slots;

-- Drop temp table
DROP TABLE temp_dr_schedule_slots;

-- Migrate Design Review member relationships
INSERT INTO "public"."_requiredEventAttendee" ("A", "B")
SELECT dr."designReviewId", ra."B"
FROM "public"."Design_Review" dr
JOIN "public"."_requiredAttendee" ra ON dr."designReviewId" = ra."A";

INSERT INTO "public"."_optionalEventAttendee" ("A", "B")
SELECT dr."designReviewId", oa."B"
FROM "public"."Design_Review" dr
JOIN "public"."_optionalAttendee" oa ON dr."designReviewId" = oa."A";

INSERT INTO "public"."_confirmedEventAttendee" ("A", "B")
SELECT dr."designReviewId", ca."B"
FROM "public"."Design_Review" dr
JOIN "public"."_confirmedAttendee" ca ON dr."designReviewId" = ca."A";

INSERT INTO "public"."_deniedEventAttendee" ("A", "B")
SELECT dr."designReviewId", da."B"
FROM "public"."Design_Review" dr
JOIN "public"."_deniedAttendee" da ON dr."designReviewId" = da."A";

-- Link Design Reviews to Work Packages (via wbsElementId)
INSERT INTO "public"."_EventToWork_Package" ("A", "B")
SELECT dr."designReviewId", wp."workPackageId"
FROM "public"."Design_Review" dr
JOIN "public"."Work_Package" wp ON dr."wbsElementId" = wp."wbsElementId";

--  Migrate Meeting records to Event table
INSERT INTO "public"."Event" (
    "eventId",
    "dateCreated",
    "title",
    "userCreatedId",
    "eventTypeId",
    "approved",
    "status"
)
SELECT 
    m."meetingId",
    NOW(),
    m."title",
    t."headId", -- Use the team head as the creator
    (SELECT et."eventTypeId" 
     FROM "public"."Event_Type" et 
     WHERE et."name" = 'Meeting' 
     AND et."organizationId" = t."organizationId"
     LIMIT 1),
    false, -- Meetings aren't pre-approved
    'UNCONFIRMED'::public."Event_Status"
FROM "public"."Meeting" m
JOIN "public"."Team" t ON m."teamId" = t."teamId";

-- Create Schedule_Slot records for Meetings
-- This creates one slot per time per meeting
CREATE TEMP TABLE temp_meeting_schedule_slots AS
SELECT 
    m."meetingId" as event_id,
    gen_random_uuid() as slot_id,
    ARRAY[CASE EXTRACT(DOW FROM m."dateSet")
        WHEN 0 THEN 'SUNDAY'::public."DayOfWeek"
        WHEN 1 THEN 'MONDAY'::public."DayOfWeek"
        WHEN 2 THEN 'TUESDAY'::public."DayOfWeek"
        WHEN 3 THEN 'WEDNESDAY'::public."DayOfWeek"
        WHEN 4 THEN 'THURSDAY'::public."DayOfWeek"
        WHEN 5 THEN 'FRIDAY'::public."DayOfWeek"
        WHEN 6 THEN 'SATURDAY'::public."DayOfWeek"
    END] as days,
    m."dateSet" + ((10 + time_slot) * INTERVAL '1 hour') as start_time,
    m."dateSet" + ((11 + time_slot) * INTERVAL '1 hour') as end_time,
    CASE WHEN m."recurringInterval" > 0 THEN m."recurringInterval" ELSE 0 END as recurrence_number,
    m."dateSet"::DATE as initial_date,
    CASE 
        WHEN m."recurringInterval" > 0 THEN (m."dateSet" + INTERVAL '1 year')::DATE 
        ELSE m."dateSet"::DATE 
    END as end_date,
    false as all_day
FROM "public"."Meeting" m
CROSS JOIN LATERAL unnest(m."meetingTimes") AS time_slot;

-- Insert schedule slots from temp table
INSERT INTO "public"."Schedule_Slot" (
    "scheduleSlotId",
    "days",
    "startTime",
    "endTime",
    "recurrenceNumber",
    "initialDateScheduled",
    "endDate",
    "allDay"
)
SELECT 
    slot_id,
    days,
    start_time,
    end_time,
    recurrence_number,
    initial_date,
    end_date,
    all_day
FROM temp_meeting_schedule_slots;

-- Link Schedule_Slots to Events using the temp table
INSERT INTO "public"."_EventToSchedule_Slot" ("A", "B")
SELECT event_id, slot_id
FROM temp_meeting_schedule_slots;

-- Drop temp table
DROP TABLE temp_meeting_schedule_slots;

-- Link Meetings to Teams
INSERT INTO "public"."_affiliatedTeam" ("A", "B")
SELECT m."meetingId", m."teamId"
FROM "public"."Meeting" m;

ALTER TABLE "Message_Info" ADD COLUMN     "eventId" TEXT;

UPDATE "Message_Info"
SET "eventId" = "designReviewId"
WHERE "designReviewId" IS NOT NULL;

DROP INDEX IF EXISTS "Message_Info_designReviewId_idx";

ALTER TABLE "Message_Info" DROP COLUMN IF EXISTS "designReviewId";

CREATE INDEX IF NOT EXISTS "Message_Info_eventId_idx" ON "Message_Info"("eventId");

ALTER TABLE "Message_Info"
ADD CONSTRAINT "Message_Info_eventId_fkey"
FOREIGN KEY ("eventId")
REFERENCES "Event"("eventId")
ON DELETE SET NULL   
ON UPDATE CASCADE;

-- Drop old relation tables for Design_Review
DROP TABLE "public"."_requiredAttendee" CASCADE;
DROP TABLE "public"."_optionalAttendee" CASCADE;
DROP TABLE "public"."_confirmedAttendee" CASCADE;
DROP TABLE "public"."_deniedAttendee" CASCADE;
DROP TABLE "public"."_userAttended" CASCADE;

-- Drop the old Meeting and Design_Review tables
DROP TABLE "public"."Meeting" CASCADE;
DROP TABLE "public"."Design_Review" CASCADE;

-- DropEnum
DROP TYPE "public"."Design_Review_Status";