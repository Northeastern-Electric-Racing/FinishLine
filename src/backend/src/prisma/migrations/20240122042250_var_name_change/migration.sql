/*
  Warnings:

  - You are about to drop the `Expense_Type` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reimbursement_Request" DROP CONSTRAINT "Reimbursement_Request_accountCodeId_fkey";

-- DropTable
DROP TABLE "Expense_Type";

-- CreateTable
CREATE TABLE "Account_Code" (
    "accountCodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "allowed" BOOLEAN NOT NULL,
    "allowedRefundSources" "Club_Accounts"[],

    CONSTRAINT "Account_Code_pkey" PRIMARY KEY ("accountCodeId")
);

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_accountCodeId_fkey" FOREIGN KEY ("accountCodeId") REFERENCES "Account_Code"("accountCodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
