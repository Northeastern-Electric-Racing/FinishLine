-- AlterTable
-- Backfill existing event types with false, then drop the default so the column stays required with no default like the other Event_Type flags
ALTER TABLE "Event_Type" ADD COLUMN     "takeAttendance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event_Type" ALTER COLUMN "takeAttendance" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Meeting_Attendance" ADD COLUMN     "scheduleSlotId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_Attendance_scheduleSlotId_teamId_key" ON "Meeting_Attendance"("scheduleSlotId", "teamId");

-- AddForeignKey
ALTER TABLE "Meeting_Attendance" ADD CONSTRAINT "Meeting_Attendance_scheduleSlotId_fkey" FOREIGN KEY ("scheduleSlotId") REFERENCES "Schedule_Slot"("scheduleSlotId") ON DELETE SET NULL ON UPDATE CASCADE;
