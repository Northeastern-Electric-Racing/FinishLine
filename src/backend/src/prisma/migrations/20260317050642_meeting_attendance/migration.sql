-- CreateTable
CREATE TABLE "Meeting_Attendance" (
    "meetingAttendanceId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "slackChannelId" TEXT NOT NULL,
    "slackMessageTimestamp" TEXT NOT NULL,

    CONSTRAINT "Meeting_Attendance_pkey" PRIMARY KEY ("meetingAttendanceId")
);

-- CreateTable
CREATE TABLE "_meetingAttendees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_meetingAttendees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Meeting_Attendance_organizationId_idx" ON "Meeting_Attendance"("organizationId");

-- CreateIndex
CREATE INDEX "Meeting_Attendance_teamId_idx" ON "Meeting_Attendance"("teamId");

-- CreateIndex
CREATE INDEX "_meetingAttendees_B_index" ON "_meetingAttendees"("B");

-- AddForeignKey
ALTER TABLE "Meeting_Attendance" ADD CONSTRAINT "Meeting_Attendance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting_Attendance" ADD CONSTRAINT "Meeting_Attendance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("teamId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting_Attendance" ADD CONSTRAINT "Meeting_Attendance_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_meetingAttendees" ADD CONSTRAINT "_meetingAttendees_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting_Attendance"("meetingAttendanceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_meetingAttendees" ADD CONSTRAINT "_meetingAttendees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
