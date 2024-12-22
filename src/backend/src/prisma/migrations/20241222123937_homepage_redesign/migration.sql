-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoImageId" TEXT,
ADD COLUMN     "slackWorkspaceId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "organizationId" TEXT;

-- CreateTable
CREATE TABLE "Announcement" (
    "announcementId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "senderName" TEXT NOT NULL,
    "slackEventId" TEXT NOT NULL,
    "slackChannelName" TEXT NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("announcementId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notificationId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "eventLink" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateTable
CREATE TABLE "_receivedAnnouncements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_userNotifications" (
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
CREATE UNIQUE INDEX "_userNotifications_AB_unique" ON "_userNotifications"("A", "B");

-- CreateIndex
CREATE INDEX "_userNotifications_B_index" ON "_userNotifications"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_receivedAnnouncements" ADD CONSTRAINT "_receivedAnnouncements_A_fkey" FOREIGN KEY ("A") REFERENCES "Announcement"("announcementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_receivedAnnouncements" ADD CONSTRAINT "_receivedAnnouncements_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userNotifications" ADD CONSTRAINT "_userNotifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("notificationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userNotifications" ADD CONSTRAINT "_userNotifications_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
