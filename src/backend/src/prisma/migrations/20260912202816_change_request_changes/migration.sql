-- AlterTable
ALTER TABLE "Change_Request" ADD COLUMN     "snapshotBlockingCount" INTEGER,
ADD COLUMN     "snapshotDuration" INTEGER,
ADD COLUMN     "snapshotStartDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Work_Package_Proposed_Changes" ADD COLUMN     "timelineChangeFromUnmarkedBlocker" BOOLEAN NOT NULL DEFAULT false;
