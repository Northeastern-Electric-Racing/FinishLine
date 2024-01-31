-- CreateEnum
CREATE TYPE "Design_Review_Status" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'SCHEDULED', 'DONE');

-- CreateEnum
CREATE TYPE "Design_Review_Team" AS ENUM ('ELECTRICAL', 'SOFTWARE', 'MECHANICAL');

-- CreateTable
CREATE TABLE "Design_Review" (
    "designReviewId" SERIAL NOT NULL,
    "dateScheduled" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "status" "Design_Review_Status" NOT NULL,
    "teamType" "Design_Review_Team" NOT NULL,
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
    "drScheduleSettingsId" SERIAL NOT NULL,
    "personalGmail" TEXT NOT NULL,
    "personalZoomLink" TEXT NOT NULL,
    "availabilityId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Schedule_Settings_pkey" PRIMARY KEY ("drScheduleSettingsId")
);

-- CreateTable
CREATE TABLE "Availability" (
    "availabilityId" SERIAL NOT NULL,
    "mondayAvailability" TIMESTAMP(3)[],
    "tuesdayAvailability" TIMESTAMP(3)[],
    "wednesdayAvailability" TIMESTAMP(3)[],
    "thursdayAvailability" TIMESTAMP(3)[],
    "fridayAvailability" TIMESTAMP(3)[],
    "saturdayAvailability" TIMESTAMP(3)[],
    "sundayAvailability" TIMESTAMP(3)[],

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("availabilityId")
);

-- CreateTable
CREATE TABLE "_requiredAttendee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_optionalAttendee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_confirmedAttendee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_deniedAttendee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_userAttended" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_Settings_availabilityId_key" ON "Schedule_Settings"("availabilityId");

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
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Settings" ADD CONSTRAINT "Schedule_Settings_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability"("availabilityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Settings" ADD CONSTRAINT "Schedule_Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

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
