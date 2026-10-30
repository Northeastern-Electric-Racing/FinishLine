-- DropForeignKey
ALTER TABLE "Change" DROP CONSTRAINT "Change_changeRequestId_fkey";

-- AlterTable
ALTER TABLE "Change" ALTER COLUMN "changeRequestId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE SET NULL ON UPDATE CASCADE;
