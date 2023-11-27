/*
  Warnings:

  - You are about to drop the column `userId` on the `Team` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_userId_fkey";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "userId",
ADD COLUMN     "userArchivedId" INTEGER;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_userArchivedId_fkey" FOREIGN KEY ("userArchivedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
