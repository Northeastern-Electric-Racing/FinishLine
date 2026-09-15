-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "notificationChannelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "notificationChannelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
