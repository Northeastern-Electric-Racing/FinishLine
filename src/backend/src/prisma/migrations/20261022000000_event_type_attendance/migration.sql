-- AlterTable
-- Backfill existing event types with false, then drop the default so the column stays required with no default like the other Event_Type flags
ALTER TABLE "Event_Type" ADD COLUMN     "takeAttendance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event_Type" ALTER COLUMN "takeAttendance" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Meeting_Attendance" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE INDEX "Meeting_Attendance_eventId_idx" ON "Meeting_Attendance"("eventId");

-- AddForeignKey
ALTER TABLE "Meeting_Attendance" ADD CONSTRAINT "Meeting_Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;
