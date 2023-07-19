/*
  Warnings:

  - You are about to drop the column `leaderId` on the `Team` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[headId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `headId` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_leaderId_fkey";


-- AlterTable
ALTER TABLE "Team" RENAME COLUMN "leaderId" TO "headId";

-- CreateTable
CREATE TABLE "_teamsAsLead" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_teamsAsLead_AB_unique" ON "_teamsAsLead"("A", "B");

-- CreateIndex
CREATE INDEX "_teamsAsLead_B_index" ON "_teamsAsLead"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Team_headId_key" ON "Team"("headId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamsAsLead" ADD CONSTRAINT "_teamsAsLead_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamsAsLead" ADD CONSTRAINT "_teamsAsLead_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
