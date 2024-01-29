-- CreateEnum
CREATE TYPE "Club_Accounts" AS ENUM ('CASH', 'BUDGET');

-- CreateEnum
CREATE TYPE "Reimbursement_Status_Type" AS ENUM ('PENDING_FINANCE', 'SABO_SUBMITTED', 'ADVISOR_APPROVED', 'REIMBURSED');

-- CreateTable
CREATE TABLE "Reimbursement_Status" (
    "reimbursementStatusId" SERIAL NOT NULL,
    "type" "Reimbursement_Status_Type" NOT NULL,
    "userId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reimbursementRequestId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Status_pkey" PRIMARY KEY ("reimbursementStatusId")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "receiptId" TEXT NOT NULL,
    "googleFileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deletedByUserId" INTEGER,
    "dateDeleted" TIMESTAMP(3),
    "createdByUserId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reimbursementRequestId" TEXT NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("receiptId")
);

-- CreateTable
CREATE TABLE "Reimbursement_Request" (
    "reimbursementRequestId" TEXT NOT NULL,
    "identifier" SERIAL NOT NULL,
    "saboId" INTEGER,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "dateOfExpense" TIMESTAMP(3) NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "vendorId" TEXT NOT NULL,
    "account" "Club_Accounts" NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "dateDelivered" TIMESTAMP(3),
    "expenseTypeId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Request_pkey" PRIMARY KEY ("reimbursementRequestId")
);

-- CreateTable
CREATE TABLE "Reimbursement_Product" (
    "reimbursementProductId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "cost" INTEGER NOT NULL,
    "wbsElementId" INTEGER NOT NULL,
    "reimbursementRequestId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Product_pkey" PRIMARY KEY ("reimbursementProductId")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "vendorId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("vendorId")
);

-- CreateTable
CREATE TABLE "Expense_Type" (
    "expenseTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "allowed" BOOLEAN NOT NULL,

    CONSTRAINT "Expense_Type_pkey" PRIMARY KEY ("expenseTypeId")
);

-- CreateTable
CREATE TABLE "Reimbursement" (
    "reimbursementId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "userSubmittedId" INTEGER NOT NULL,
    "purchaserId" INTEGER NOT NULL,

    CONSTRAINT "Reimbursement_pkey" PRIMARY KEY ("reimbursementId")
);

-- CreateTable
CREATE TABLE "User_Secure_Settings" (
    "userSecureSettingsId" TEXT NOT NULL,
    "nuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "User_Secure_Settings_pkey" PRIMARY KEY ("userSecureSettingsId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_googleFileId_key" ON "Receipt"("googleFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Request_saboId_key" ON "Reimbursement_Request"("saboId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_Secure_Settings_nuid_key" ON "User_Secure_Settings"("nuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_Secure_Settings_userId_key" ON "User_Secure_Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_Secure_Settings_phoneNumber_key" ON "User_Secure_Settings"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Reimbursement_Status" ADD CONSTRAINT "Reimbursement_Status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Status" ADD CONSTRAINT "Reimbursement_Status_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("vendorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_expenseTypeId_fkey" FOREIGN KEY ("expenseTypeId") REFERENCES "Expense_Type"("expenseTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product" ADD CONSTRAINT "Reimbursement_Product_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product" ADD CONSTRAINT "Reimbursement_Product_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_userSubmittedId_fkey" FOREIGN KEY ("userSubmittedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Secure_Settings" ADD CONSTRAINT "User_Secure_Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
