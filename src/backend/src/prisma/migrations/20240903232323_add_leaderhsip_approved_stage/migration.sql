-- AlterEnum
ALTER TYPE "Reimbursement_Status_Type" ADD VALUE 'LEADERSHIP_APPROVED';

-- AlterTable
ALTER TABLE "Message_Info" ADD COLUMN     "reimbursementRequestId" TEXT;

-- AlterTable
ALTER TABLE "Reimbursement_Request" ALTER COLUMN "dateOfExpense" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Message_Info" ADD CONSTRAINT "Message_Info_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE SET NULL ON UPDATE CASCADE;
