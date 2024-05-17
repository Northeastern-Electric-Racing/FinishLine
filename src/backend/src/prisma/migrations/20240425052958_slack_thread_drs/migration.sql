-- DropForeignKey
ALTER TABLE "Message_Info" DROP CONSTRAINT "Message_Info_changeRequestId_fkey";

-- AlterTable
ALTER TABLE "Message_Info" ADD COLUMN     "designReviewId" TEXT,
ALTER COLUMN "changeRequestId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Message_Info" ADD CONSTRAINT "Message_Info_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message_Info" ADD CONSTRAINT "Message_Info_designReviewId_fkey" FOREIGN KEY ("designReviewId") REFERENCES "Design_Review"("designReviewId") ON DELETE SET NULL ON UPDATE CASCADE;
