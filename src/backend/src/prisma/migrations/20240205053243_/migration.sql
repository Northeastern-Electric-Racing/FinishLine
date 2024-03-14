-- CreateEnum
CREATE TYPE "Design_Review_Status" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'SCHEDULED', 'DONE');

-- CreateTable
CREATE TABLE "TeamType" (
    "teamTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TeamType_pkey" PRIMARY KEY ("teamTypeId")
);

-- CreateTable
CREATE TABLE "Design_Review" (
    "designReviewId" TEXT NOT NULL,
    "dateScheduled" DATE NOT NULL,
    "meetingTimes" INTEGER[],
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCreatedId" INTEGER NOT NULL,
    "status" "Design_Review_Status" NOT NULL,
    "teamTypeId" TEXT NOT NULL,
    "location" TEXT,
    "isOnline" BOOLEAN NOT NULL,
    "isInPerson" BOOLEAN NOT NULL,
    "zoomLink" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,
    "docTemplateLink" TEXT,
    "wbsElementId" INTEGER NOT NULL,

    CONSTRAINT "Design_Review_pkey" PRIMARY KEY ("designReviewId")
);

-- CreateTable
CREATE TABLE "Schedule_Settings" (
    "drScheduleSettingsId" TEXT NOT NULL,
    "personalGmail" TEXT NOT NULL,
    "personalZoomLink" TEXT NOT NULL,
    "availability" INTEGER[],
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Schedule_Settings_pkey" PRIMARY KEY ("drScheduleSettingsId")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meetingTimes" INTEGER[],
    "teamId" TEXT NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("meetingId")
);

-- CreateTable
CREATE TABLE "_requiredAttendee" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_optionalAttendee" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_confirmedAttendee" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_deniedAttendee" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_userAttended" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamType_name_key" ON "TeamType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_Settings_userId_key" ON "Schedule_Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_requiredAttendee_AB_unique" ON "_requiredAttendee"("A", "B");

-- CreateIndex
CREATE INDEX "_requiredAttendee_B_index" ON "_requiredAttendee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_optionalAttendee_AB_unique" ON "_optionalAttendee"("A", "B");

-- CreateIndex
CREATE INDEX "_optionalAttendee_B_index" ON "_optionalAttendee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_confirmedAttendee_AB_unique" ON "_confirmedAttendee"("A", "B");

-- CreateIndex
CREATE INDEX "_confirmedAttendee_B_index" ON "_confirmedAttendee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_deniedAttendee_AB_unique" ON "_deniedAttendee"("A", "B");

-- CreateIndex
CREATE INDEX "_deniedAttendee_B_index" ON "_deniedAttendee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_userAttended_AB_unique" ON "_userAttended"("A", "B");

-- CreateIndex
CREATE INDEX "_userAttended_B_index" ON "_userAttended"("B");

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "TeamType"("teamTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Settings" ADD CONSTRAINT "Schedule_Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("teamId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiredAttendee" ADD CONSTRAINT "_requiredAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiredAttendee" ADD CONSTRAINT "_requiredAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionalAttendee" ADD CONSTRAINT "_optionalAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionalAttendee" ADD CONSTRAINT "_optionalAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_confirmedAttendee" ADD CONSTRAINT "_confirmedAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_confirmedAttendee" ADD CONSTRAINT "_confirmedAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deniedAttendee" ADD CONSTRAINT "_deniedAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deniedAttendee" ADD CONSTRAINT "_deniedAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userAttended" ADD CONSTRAINT "_userAttended_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userAttended" ADD CONSTRAINT "_userAttended_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
