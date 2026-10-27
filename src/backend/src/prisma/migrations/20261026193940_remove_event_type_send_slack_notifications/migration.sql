/*
  Warnings:

  - You are about to drop the column `sendSlackNotifications` on the `Event_Type` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event_Type" DROP COLUMN "sendSlackNotifications";
