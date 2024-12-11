-- CreateTable
CREATE TABLE "Announcement" (
    "announcementId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "dateCrated" TIMESTAMP(3) NOT NULL,
    "userCreatedId" TEXT NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("announcementId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notificationId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateTable
CREATE TABLE "_ReceivedAnnouncements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_UserNotifications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ReceivedAnnouncements_AB_unique" ON "_ReceivedAnnouncements"("A", "B");

-- CreateIndex
CREATE INDEX "_ReceivedAnnouncements_B_index" ON "_ReceivedAnnouncements"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserNotifications_AB_unique" ON "_UserNotifications"("A", "B");

-- CreateIndex
CREATE INDEX "_UserNotifications_B_index" ON "_UserNotifications"("B");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReceivedAnnouncements" ADD CONSTRAINT "_ReceivedAnnouncements_A_fkey" FOREIGN KEY ("A") REFERENCES "Announcement"("announcementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReceivedAnnouncements" ADD CONSTRAINT "_ReceivedAnnouncements_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserNotifications" ADD CONSTRAINT "_UserNotifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("notificationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserNotifications" ADD CONSTRAINT "_UserNotifications_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
