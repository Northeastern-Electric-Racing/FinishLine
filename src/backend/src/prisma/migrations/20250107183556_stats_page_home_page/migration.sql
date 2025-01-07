/*
  Warnings:

  - You are about to drop the column `logoImage` on the `Organization` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Graph_Type" AS ENUM ('PROJECT_BUDGET_BY_PROJECT', 'PROJECT_BUDGET_BY_TEAM', 'PROJECT_BUDGET_BY_DIVISION', 'CHANGE_REQUESTS_BY_PROJECT', 'CHANGE_REQUESTS_BY_TEAM', 'CHANGE_REQUESTS_BY_DIVISION', 'REIMBURSEMENT_TOTAL_BY_PROJECT', 'REIMBURSEMENT_TOTAL_BY_TEAM', 'REIMBURSEMENT_TOTAL_BY_DIVISION');

-- CreateEnum
CREATE TYPE "Graph_Display_Type" AS ENUM ('PIE', 'BAR');

-- CreateEnum
CREATE TYPE "Measure" AS ENUM ('SUM', 'AVG');

-- CreateEnum
CREATE TYPE "Graph_Permission" AS ENUM ('EDIT_GRAPH', 'CREATE_GRAPH', 'VIEW_GRAPH', 'DELETE_GRAPH');

-- CreateEnum
CREATE TYPE "Graph_Collection_Permission" AS ENUM ('EDIT_GRAPH_COLLECTION', 'CREATE_GRAPH_COLLECTION', 'VIEW_GRAPH_COLLECTION', 'DELETE_GRAPH_COLLECTION');

-- CreateEnum
CREATE TYPE "Special_Permission" AS ENUM ('FINANCE_ONLY');

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "logoImage",
ADD COLUMN     "logoImageId" TEXT,
ADD COLUMN     "slackWorkspaceId" TEXT;

-- AlterTable
ALTER TABLE "Team_Type" ADD COLUMN     "dateDeleted" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "additionalPermissions" TEXT[];

-- CreateTable
CREATE TABLE "Graph" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "graphType" "Graph_Type" NOT NULL,
    "displayGraphType" "Graph_Display_Type" NOT NULL,
    "measure" "Measure" NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "specialPermissions" "Special_Permission"[],
    "graphCollectionId" TEXT,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Graph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graph_Collection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "viewPermissions" "Special_Permission"[],
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Graph_Collection_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "_graphCars" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
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
CREATE UNIQUE INDEX "_graphCars_AB_unique" ON "_graphCars"("A", "B");

-- CreateIndex
CREATE INDEX "_graphCars_B_index" ON "_graphCars"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_receivedAnnouncements_AB_unique" ON "_receivedAnnouncements"("A", "B");

-- CreateIndex
CREATE INDEX "_receivedAnnouncements_B_index" ON "_receivedAnnouncements"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_userPopUps_AB_unique" ON "_userPopUps"("A", "B");

-- CreateIndex
CREATE INDEX "_userPopUps_B_index" ON "_userPopUps"("B");

-- AddForeignKey
ALTER TABLE "Team_Type" ADD CONSTRAINT "Team_Type_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_graphCollectionId_fkey" FOREIGN KEY ("graphCollectionId") REFERENCES "Graph_Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopUp" ADD CONSTRAINT "PopUp_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_graphCars" ADD CONSTRAINT "_graphCars_A_fkey" FOREIGN KEY ("A") REFERENCES "Car"("carId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_graphCars" ADD CONSTRAINT "_graphCars_B_fkey" FOREIGN KEY ("B") REFERENCES "Graph"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_receivedAnnouncements" ADD CONSTRAINT "_receivedAnnouncements_A_fkey" FOREIGN KEY ("A") REFERENCES "Announcement"("announcementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_receivedAnnouncements" ADD CONSTRAINT "_receivedAnnouncements_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userPopUps" ADD CONSTRAINT "_userPopUps_A_fkey" FOREIGN KEY ("A") REFERENCES "PopUp"("popUpId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userPopUps" ADD CONSTRAINT "_userPopUps_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
