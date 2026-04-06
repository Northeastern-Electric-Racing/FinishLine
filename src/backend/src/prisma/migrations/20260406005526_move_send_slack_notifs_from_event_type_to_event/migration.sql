/*
  Warnings:

  - You are about to drop the column `sendSlackNotifications` on the `Event_Type` table. All the data in the column will be lost.
  - Added the required column `sendSlackNotifications` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "sendSlackNotifications" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Event_Type" DROP COLUMN "sendSlackNotifications";
