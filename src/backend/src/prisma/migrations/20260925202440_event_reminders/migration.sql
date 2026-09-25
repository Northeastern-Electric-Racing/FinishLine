-- CreateEnum
CREATE TYPE "Event_Reminder_Tier" AS ENUM ('HOURS_48', 'HOURS_24', 'HOURS_1');

-- CreateTable
CREATE TABLE "Event_Reminder" (
    "eventReminderId" TEXT NOT NULL,
    "scheduleSlotId" TEXT NOT NULL,
    "tier" "Event_Reminder_Tier" NOT NULL,
    "slotStartTime" TIMESTAMP(3) NOT NULL,
    "slackChannelId" TEXT NOT NULL,
    "dateSent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_Reminder_pkey" PRIMARY KEY ("eventReminderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_Reminder_scheduleSlotId_tier_slotStartTime_slackChann_key" ON "Event_Reminder"("scheduleSlotId", "tier", "slotStartTime", "slackChannelId");

-- AddForeignKey
ALTER TABLE "Event_Reminder" ADD CONSTRAINT "Event_Reminder_scheduleSlotId_fkey" FOREIGN KEY ("scheduleSlotId") REFERENCES "Schedule_Slot"("scheduleSlotId") ON DELETE CASCADE ON UPDATE CASCADE;
