-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "dateArchived" TIMESTAMP(3),
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
