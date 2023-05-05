/*
  Warnings:

  - You are about to drop the column `expenssTypeId` on the `Reimbursement_Request` table. All the data in the column will be lost.
  - You are about to drop the column `receiptPicture` on the `Reimbursement_Request` table. All the data in the column will be lost.
  - Added the required column `expenseTypeId` to the `Reimbursement_Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reimbursement_Request" DROP CONSTRAINT "Reimbursement_Request_expenssTypeId_fkey";

-- AlterTable
ALTER TABLE "Reimbursement_Request" DROP COLUMN "expenssTypeId",
DROP COLUMN "receiptPicture",
ADD COLUMN     "expenseTypeId" TEXT NOT NULL,
ADD COLUMN     "receiptPictures" TEXT[];

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_expenseTypeId_fkey" FOREIGN KEY ("expenseTypeId") REFERENCES "Expense_Type"("expenseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;
