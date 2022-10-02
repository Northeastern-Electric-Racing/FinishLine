/*
  Warnings:

  - You are about to drop the column `slackId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "slackId";

-- AlterTable
ALTER TABLE "User_Settings" ADD COLUMN     "slackId" TEXT;
