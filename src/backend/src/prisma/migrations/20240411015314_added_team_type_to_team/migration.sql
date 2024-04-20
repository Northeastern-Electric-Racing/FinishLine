-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "teamTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "TeamType"("teamTypeId") ON DELETE SET NULL ON UPDATE CASCADE;
