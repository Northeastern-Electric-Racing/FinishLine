/*
  Warnings:

  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `text` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_ReceivedAnnouncements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_NotificationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ReceivedAnnouncements_AB_unique" ON "_ReceivedAnnouncements"("A", "B");

-- CreateIndex
CREATE INDEX "_ReceivedAnnouncements_B_index" ON "_ReceivedAnnouncements"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NotificationToUser_AB_unique" ON "_NotificationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_NotificationToUser_B_index" ON "_NotificationToUser"("B");

-- AddForeignKey
ALTER TABLE "_ReceivedAnnouncements" ADD CONSTRAINT "_ReceivedAnnouncements_A_fkey" FOREIGN KEY ("A") REFERENCES "Announcement"("announcementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReceivedAnnouncements" ADD CONSTRAINT "_ReceivedAnnouncements_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToUser" ADD CONSTRAINT "_NotificationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Notification"("notificationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotificationToUser" ADD CONSTRAINT "_NotificationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
