-- CreateEnum
CREATE TYPE "Event_Reminder_Tier" AS ENUM ('HOURS_48', 'HOURS_24', 'HOURS_1');

-- CreateEnum
CREATE TYPE "Event_Reminder_Status" AS ENUM ('PENDING', 'SENT');

-- CreateTable
CREATE TABLE "Event_Reminder" (
    "eventReminderId" TEXT NOT NULL,
    "scheduleSlotId" TEXT NOT NULL,
    "tier" "Event_Reminder_Tier" NOT NULL,
    "slotStartTime" TIMESTAMP(3) NOT NULL,
    "slackChannelId" TEXT NOT NULL,
    "status" "Event_Reminder_Status" NOT NULL DEFAULT 'PENDING',
    "claimToken" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "Event_Reminder_pkey" PRIMARY KEY ("eventReminderId")
);

-- CreateIndex
CREATE INDEX "Event_Reminder_status_claimedAt_idx" ON "Event_Reminder"("status", "claimedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_Reminder_scheduleSlotId_tier_slotStartTime_slackChann_key" ON "Event_Reminder"("scheduleSlotId", "tier", "slotStartTime", "slackChannelId");

-- AddForeignKey
ALTER TABLE "Event_Reminder" ADD CONSTRAINT "Event_Reminder_scheduleSlotId_fkey" FOREIGN KEY ("scheduleSlotId") REFERENCES "Schedule_Slot"("scheduleSlotId") ON DELETE CASCADE ON UPDATE CASCADE;
