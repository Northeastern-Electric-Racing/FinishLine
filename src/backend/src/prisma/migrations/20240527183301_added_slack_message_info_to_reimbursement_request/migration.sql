-- AlterTable
ALTER TABLE "Message_Info" ADD COLUMN     "reimbursementRequestId" TEXT;

-- AddForeignKey
ALTER TABLE "Message_Info" ADD CONSTRAINT "Message_Info_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE SET NULL ON UPDATE CASCADE;
