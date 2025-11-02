-- AlterTable
ALTER TABLE "Reimbursement_Request" ADD COLUMN     "assigneeId" TEXT;

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
