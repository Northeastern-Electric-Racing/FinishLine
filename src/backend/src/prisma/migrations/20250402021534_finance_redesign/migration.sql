/*
  Warnings:

  - You are about to drop the column `allowedRefundSources` on the `Account_Code` table. All the data in the column will be lost.
  - You are about to drop the column `otherReason` on the `Reimbursement_Product_Reason` table. All the data in the column will be lost.
  - You are about to drop the column `account` on the `Reimbursement_Request` table. All the data in the column will be lost.
  - Added the required column `indexCodeId` to the `Reimbursement_Request` table without a default value. This is not possible if the table is not empty.
*/

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "reimbursementRequestId" TEXT;

-- AlterTable
ALTER TABLE "Reimbursement_Product_Reason" DROP COLUMN "otherReason",
ADD COLUMN     "otherReasonId" TEXT;

-- AlterTable
ALTER TABLE "Reimbursement_Request" ADD COLUMN     "indexCodeId" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "addedByUserId" TEXT,
ADD COLUMN     "discountCode" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "password" TEXT NOT NULL DEFAULT "",
ADD COLUMN     "taxExempt" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN     "twoFactorContactId" TEXT,
ADD COLUMN     "username" TEXT NOT NULL DEFAULT "";

-- CreateTable
CREATE TABLE "Sponsor" (
    "sponsorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "activeStatus" BOOLEAN NOT NULL,
    "vendorContact" TEXT NOT NULL,
    "sponsorTierId" TEXT NOT NULL,
    "sponsorValue" INTEGER NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "discountCode" TEXT,
    "activeYears" INTEGER[],
    "taxExempt" BOOLEAN NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("sponsorId")
);

-- CreateTable
CREATE TABLE "Sponsor_Task" (
    "sponsorTaskId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "notifyDate" TIMESTAMP(3),
    "assigneeUserId" TEXT,
    "notes" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,

    CONSTRAINT "Sponsor_Task_pkey" PRIMARY KEY ("sponsorTaskId")
);

-- CreateTable
CREATE TABLE "Sponsor_Tier" (
    "sponsorTierId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHexCode" TEXT NOT NULL,

    CONSTRAINT "Sponsor_Tier_pkey" PRIMARY KEY ("sponsorTierId")
);

-- CreateTable
CREATE TABLE "Index_Code" (
    "indexCodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userDeletedId" TEXT,

    CONSTRAINT "Index_Code_pkey" PRIMARY KEY ("indexCodeId")
);

-- CreateTable
CREATE TABLE "Reimbursement_Product_Other_Reason" (
    "otherReimbursementProductReasonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "budget" INTEGER NOT NULL,
    "indexCodeId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Product_Other_Reason_pkey" PRIMARY KEY ("otherReimbursementProductReasonId")
);

-- CreateTable
CREATE TABLE "_Account_CodeToIndex_Code" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Account_CodeToIndex_Code_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Account_CodeToReimbursement_Product_Other_Reason" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Account_CodeToReimbursement_Product_Other_Reason_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateAdminUser
INSERT INTO "User" ("userId", "firstName", "lastName", "googleAuthId", "email") VALUES ('0', 'Admin', 'User', 'admin', 'admin@gmail.com');

-- Ensure every organization gets its own CASH and BUDGET index codes
WITH orgs AS (
    SELECT "organizationId" FROM "Organization"
),
inserted AS (
    INSERT INTO "Index_Code" ("indexCodeId", "name", "userCreatedId", "organizationId")
    SELECT gen_random_uuid(), 'CASH', '0', o."organizationId" FROM orgs o
    UNION ALL
    SELECT gen_random_uuid(), 'BUDGET', '0', o."organizationId" FROM orgs o
    RETURNING "indexCodeId", "name", "organizationId"
)

-- Insert into Reimbursement_Product_Other_Reason using the correct indexCodeId per organization
INSERT INTO "Reimbursement_Product_Other_Reason" ("otherReimbursementProductReasonId", "name", "userCreatedId", "budget", "indexCodeId")
SELECT 
    gen_random_uuid(), 
    reason.name, 
    '0', 
    0, 
    i."indexCodeId"
FROM (
    VALUES 
        ('TOOLS_AND_EQUIPMENT', 'CASH'),
        ('COMPETITION', 'BUDGET'),
        ('CONSUMABLES', 'CASH'),
        ('GENERAL_STOCK', 'BUDGET'),
        ('SUBSCRIPTIONS_AND_MEMBERSHIPS', 'CASH')
) AS reason(name, index_name)
JOIN inserted i ON reason.index_name = i."name";

UPDATE "Reimbursement_Request" rr
SET "indexCodeId" = ic."indexCodeId"
FROM "Index_Code" ic
WHERE rr."indexCode"::TEXT = ic."name"
AND rr."organizationId" = ic."organizationId";

UPDATE "Reimbursement_Product_Reason" rpr 
SET "otherReasonId" = orpr."otherReimbursementProductReasonId"
FROM "Reimbursement_Product_Other_Reason" orpr 
WHERE rpr."otherReason"::TEXT = orpr."name";

ALTER TABLE "Reimbursement_Request" ALTER COLUMN "indexCodeId" SET NOT NULL;

ALTER TABLE "Reimbursement_Request" DROP COLUMN "account";

-- DropEnum
DROP TYPE "Club_Accounts";

-- AlterTable
ALTER TABLE "Account_Code" DROP COLUMN "allowedRefundSources";

-- DropEnum
DROP TYPE "Other_Reimbursement_Product_Reason";

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_name_organizationId_key" ON "Sponsor"("name", "organizationId");

-- CreateIndex
CREATE INDEX "_Account_CodeToIndex_Code_B_index" ON "_Account_CodeToIndex_Code"("B");

-- CreateIndex
CREATE INDEX "_Account_CodeToReimbursement_Product_Other_Reason_B_index" ON "_Account_CodeToReimbursement_Product_Other_Reason"("B");

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_indexCodeId_fkey" FOREIGN KEY ("indexCodeId") REFERENCES "Index_Code"("indexCodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Reason" ADD CONSTRAINT "Reimbursement_Product_Reason_otherReasonId_fkey" FOREIGN KEY ("otherReasonId") REFERENCES "Reimbursement_Product_Other_Reason"("otherReimbursementProductReasonId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_twoFactorContactId_fkey" FOREIGN KEY ("twoFactorContactId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_sponsorTierId_fkey" FOREIGN KEY ("sponsorTierId") REFERENCES "Sponsor_Tier"("sponsorTierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor_Task" ADD CONSTRAINT "Sponsor_Task_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor_Task" ADD CONSTRAINT "Sponsor_Task_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("sponsorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor_Tier" ADD CONSTRAINT "Sponsor_Tier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Index_Code" ADD CONSTRAINT "Index_Code_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Index_Code" ADD CONSTRAINT "Index_Code_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Index_Code" ADD CONSTRAINT "Index_Code_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Other_Reason" ADD CONSTRAINT "Reimbursement_Product_Other_Reason_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Other_Reason" ADD CONSTRAINT "Reimbursement_Product_Other_Reason_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Other_Reason" ADD CONSTRAINT "Reimbursement_Product_Other_Reason_indexCodeId_fkey" FOREIGN KEY ("indexCodeId") REFERENCES "Index_Code"("indexCodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Account_CodeToIndex_Code" ADD CONSTRAINT "_Account_CodeToIndex_Code_A_fkey" FOREIGN KEY ("A") REFERENCES "Account_Code"("accountCodeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Account_CodeToIndex_Code" ADD CONSTRAINT "_Account_CodeToIndex_Code_B_fkey" FOREIGN KEY ("B") REFERENCES "Index_Code"("indexCodeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Account_CodeToReimbursement_Product_Other_Reason" ADD CONSTRAINT "_Account_CodeToReimbursement_Product_Other_Reason_A_fkey" FOREIGN KEY ("A") REFERENCES "Account_Code"("accountCodeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Account_CodeToReimbursement_Product_Other_Reason" ADD CONSTRAINT "_Account_CodeToReimbursement_Product_Other_Reason_B_fkey" FOREIGN KEY ("B") REFERENCES "Reimbursement_Product_Other_Reason"("otherReimbursementProductReasonId") ON DELETE CASCADE ON UPDATE CASCADE;
