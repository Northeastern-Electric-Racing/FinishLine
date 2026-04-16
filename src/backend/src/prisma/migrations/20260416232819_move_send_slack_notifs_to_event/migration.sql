-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "sendSlackNotifications" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Event_Type" DROP COLUMN "sendSlackNotifications";
