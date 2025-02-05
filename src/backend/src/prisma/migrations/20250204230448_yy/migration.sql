/*
  Warnings:

  - You are about to drop the column `projectId` on the `_ProjectToReimbursement_Request` table. All the data in the column will be lost.
  - You are about to drop the column `reimbursementRequestId` on the `_ProjectToReimbursement_Request` table. All the data in the column will be lost.
  - The primary key for the `_assignedBy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_assignedTo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_blockedBy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_blocking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_confirmedAttendee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_deniedAttendee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_favoritedBy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_graphCars` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_optionalAttendee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_organizationMembers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_proposedBlockedBy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_proposedProjectTeams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_receivedAnnouncements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_requestedChangeRequestReviewers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_requiredAttendee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_teamsAsLead` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_teamsAsMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_userAttended` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_userPopUps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_ProjectToReimbursement_Request` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_assignedBy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_assignedTo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_blockedBy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_blocking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_confirmedAttendee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_deniedAttendee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_favoritedBy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_graphCars` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_optionalAttendee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_organizationMembers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_proposedBlockedBy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_proposedProjectTeams` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_receivedAnnouncements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_requestedChangeRequestReviewers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_requiredAttendee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_teamsAsLead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_teamsAsMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_userAttended` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_userPopUps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `A` to the `_ProjectToReimbursement_Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `B` to the `_ProjectToReimbursement_Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_reimbursementRequestId_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" DROP CONSTRAINT "_ProjectToReimbursement_Request_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" DROP CONSTRAINT "_ProjectToReimbursement_Request_B_fkey";

-- DropIndex
DROP INDEX "_ProjectToReimbursement_Request_AB_unique";

-- DropIndex
DROP INDEX "_ProjectToReimbursement_Request_B_index";

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "passwordHash" DROP DEFAULT,
ALTER COLUMN "username" DROP DEFAULT;

-- AlterTable
ALTER TABLE "_ProjectToReimbursement_Request" DROP COLUMN "projectId",
DROP COLUMN "reimbursementRequestId",
ADD COLUMN     "A" TEXT NOT NULL,
ADD COLUMN     "B" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "_assignedBy" DROP CONSTRAINT "_assignedBy_AB_pkey";

-- AlterTable
ALTER TABLE "_assignedTo" DROP CONSTRAINT "_assignedTo_AB_pkey";

-- AlterTable
ALTER TABLE "_blockedBy" DROP CONSTRAINT "_blockedBy_AB_pkey";

-- AlterTable
ALTER TABLE "_blocking" DROP CONSTRAINT "_blocking_AB_pkey";

-- AlterTable
ALTER TABLE "_confirmedAttendee" DROP CONSTRAINT "_confirmedAttendee_AB_pkey";

-- AlterTable
ALTER TABLE "_deniedAttendee" DROP CONSTRAINT "_deniedAttendee_AB_pkey";

-- AlterTable
ALTER TABLE "_favoritedBy" DROP CONSTRAINT "_favoritedBy_AB_pkey";

-- AlterTable
ALTER TABLE "_graphCars" DROP CONSTRAINT "_graphCars_AB_pkey";

-- AlterTable
ALTER TABLE "_optionalAttendee" DROP CONSTRAINT "_optionalAttendee_AB_pkey";

-- AlterTable
ALTER TABLE "_organizationMembers" DROP CONSTRAINT "_organizationMembers_AB_pkey";

-- AlterTable
ALTER TABLE "_proposedBlockedBy" DROP CONSTRAINT "_proposedBlockedBy_AB_pkey";

-- AlterTable
ALTER TABLE "_proposedProjectTeams" DROP CONSTRAINT "_proposedProjectTeams_AB_pkey";

-- AlterTable
ALTER TABLE "_receivedAnnouncements" DROP CONSTRAINT "_receivedAnnouncements_AB_pkey";

-- AlterTable
ALTER TABLE "_requestedChangeRequestReviewers" DROP CONSTRAINT "_requestedChangeRequestReviewers_AB_pkey";

-- AlterTable
ALTER TABLE "_requiredAttendee" DROP CONSTRAINT "_requiredAttendee_AB_pkey";

-- AlterTable
ALTER TABLE "_teamsAsLead" DROP CONSTRAINT "_teamsAsLead_AB_pkey";

-- AlterTable
ALTER TABLE "_teamsAsMember" DROP CONSTRAINT "_teamsAsMember_AB_pkey";

-- AlterTable
ALTER TABLE "_userAttended" DROP CONSTRAINT "_userAttended_AB_pkey";

-- AlterTable
ALTER TABLE "_userPopUps" DROP CONSTRAINT "_userPopUps_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToReimbursement_Request_AB_unique" ON "_ProjectToReimbursement_Request"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToReimbursement_Request_B_index" ON "_ProjectToReimbursement_Request"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_assignedBy_AB_unique" ON "_assignedBy"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_assignedTo_AB_unique" ON "_assignedTo"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_blockedBy_AB_unique" ON "_blockedBy"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_blocking_AB_unique" ON "_blocking"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_confirmedAttendee_AB_unique" ON "_confirmedAttendee"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_deniedAttendee_AB_unique" ON "_deniedAttendee"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_favoritedBy_AB_unique" ON "_favoritedBy"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_graphCars_AB_unique" ON "_graphCars"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_optionalAttendee_AB_unique" ON "_optionalAttendee"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_organizationMembers_AB_unique" ON "_organizationMembers"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposedBlockedBy_AB_unique" ON "_proposedBlockedBy"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposedProjectTeams_AB_unique" ON "_proposedProjectTeams"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_receivedAnnouncements_AB_unique" ON "_receivedAnnouncements"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_requestedChangeRequestReviewers_AB_unique" ON "_requestedChangeRequestReviewers"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_requiredAttendee_AB_unique" ON "_requiredAttendee"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_teamsAsLead_AB_unique" ON "_teamsAsLead"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_teamsAsMember_AB_unique" ON "_teamsAsMember"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_userAttended_AB_unique" ON "_userAttended"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_userPopUps_AB_unique" ON "_userPopUps"("A", "B");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" ADD CONSTRAINT "_ProjectToReimbursement_Request_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" ADD CONSTRAINT "_ProjectToReimbursement_Request_B_fkey" FOREIGN KEY ("B") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE CASCADE ON UPDATE CASCADE;
