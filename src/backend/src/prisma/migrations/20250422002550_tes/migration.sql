-- DropForeignKey
ALTER TABLE "PartReviewCommonMistake" DROP CONSTRAINT "PartReviewCommonMistake_organizationId_fkey";

-- AlterTable
ALTER TABLE "PartReviewCommonMistake" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PartReviewCommonMistake" ADD CONSTRAINT "PartReviewCommonMistake_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "ProjectId_and_index" RENAME TO "Part_projectId_index_key";
