ALTER TABLE "Calendar" ADD COLUMN "isLeadCalendar" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Event_Type"
ADD COLUMN "onlyAdminsOrAboveForEventCreation" BOOLEAN NOT NULL DEFAULT false;
