-- AlterTable
ALTER TABLE "Reimbursement_Product"
ADD COLUMN     "budgetAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cashAmount" INTEGER NOT NULL DEFAULT 0;
