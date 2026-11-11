-- AlterTable
ALTER TABLE "Event" ADD COLUMN "sendSlackNotifications" BOOLEAN NOT NULL DEFAULT true;

-- Backfill each event's setting from its event type
UPDATE "Event" e
SET "sendSlackNotifications" = et."sendSlackNotifications"
FROM "Event_Type" et
WHERE e."eventTypeId" = et."eventTypeId";

-- AlterTable
ALTER TABLE "Event_Type" DROP COLUMN "sendSlackNotifications";