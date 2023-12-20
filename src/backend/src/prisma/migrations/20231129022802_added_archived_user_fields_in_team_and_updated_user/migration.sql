-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "dateArchived" TIMESTAMP(3),
ADD COLUMN     "userArchivedId" INTEGER;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_userArchivedId_fkey" FOREIGN KEY ("userArchivedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
