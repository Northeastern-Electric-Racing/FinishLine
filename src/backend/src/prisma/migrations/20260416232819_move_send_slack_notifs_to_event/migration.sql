-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "sendSlackNotifications" BOOLEAN NOT NULL DEFAULT false;

-- Backfill Event.sendSlackNotifications from Event_Type before dropping the old column
UPDATE "Event" e
SET "sendSlackNotifications" = true
FROM "Event_Type" et
WHERE e."eventTypeId" = et."eventTypeId"
AND et."sendSlackNotifications" = true;

-- AlterTable
ALTER TABLE "Event_Type" DROP COLUMN "sendSlackNotifications";
