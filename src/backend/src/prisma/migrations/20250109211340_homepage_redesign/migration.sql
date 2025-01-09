-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoImageId" TEXT,
ADD COLUMN     "slackWorkspaceId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "featuredByOrganizationId" TEXT;

-- CreateTable
CREATE TABLE "Announcement" (
    "announcementId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "dateMessageSent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "senderName" TEXT NOT NULL,
    "slackEventId" TEXT NOT NULL,
    "slackChannelName" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("announcementId")
);

-- CreateTable
CREATE TABLE "PopUp" (
    "popUpId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "eventLink" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "PopUp_pkey" PRIMARY KEY ("popUpId")
);

-- CreateTable
CREATE TABLE "_receivedAnnouncements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_userPopUps" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_slackEventId_key" ON "Announcement"("slackEventId");

-- CreateIndex
CREATE UNIQUE INDEX "_receivedAnnouncements_AB_unique" ON "_receivedAnnouncements"("A", "B");

-- CreateIndex
CREATE INDEX "_receivedAnnouncements_B_index" ON "_receivedAnnouncements"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_userPopUps_AB_unique" ON "_userPopUps"("A", "B");

-- CreateIndex
CREATE INDEX "_userPopUps_B_index" ON "_userPopUps"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_featuredByOrganizationId_fkey" FOREIGN KEY ("featuredByOrganizationId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopUp" ADD CONSTRAINT "PopUp_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_receivedAnnouncements" ADD CONSTRAINT "_receivedAnnouncements_A_fkey" FOREIGN KEY ("A") REFERENCES "Announcement"("announcementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_receivedAnnouncements" ADD CONSTRAINT "_receivedAnnouncements_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userPopUps" ADD CONSTRAINT "_userPopUps_A_fkey" FOREIGN KEY ("A") REFERENCES "PopUp"("popUpId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userPopUps" ADD CONSTRAINT "_userPopUps_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
