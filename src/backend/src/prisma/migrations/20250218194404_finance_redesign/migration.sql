/*
  Warnings:

  - You are about to drop the column `allowedRefundSources` on the `Account_Code` table. All the data in the column will be lost.
  - You are about to drop the column `otherReason` on the `Reimbursement_Product_Reason` table. All the data in the column will be lost.
  - You are about to drop the column `account` on the `Reimbursement_Request` table. All the data in the column will be lost.
  - Added the required column `indexCodeId` to the `Reimbursement_Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxExempt` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Index_Code" (
    "indexCodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
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
    "accountCodeId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Product_Other_Reason_pkey" PRIMARY KEY ("otherReimbursementProductReasonId")
);
-- AlterTable
ALTER TABLE "Reimbursement_Request" ADD COLUMN     "indexCodeId" TEXT NOT NULL;

UPDATE "Reimbursement_Request" AS rr
SET "indexCodeId" = (
    SELECT "indexCodeId"  
    FROM "Index_Code" AS ic
    WHERE ic."indexCodeId" = rr."indexCodeId"
)
WHERE rr."indexCodeId" IS NOT NULL;

-- AlterTable
ALTER TABLE "Reimbursement_Product_Reason" ADD COLUMN     "otherReasonId" TEXT;

INSERT INTO "Index_Code" ("indexCodeId", "name", "dateCreated", "userCreatedId")
SELECT gen_random_uuid(), "Account_Code"."name", NOW(), 'default-user-id'
FROM "Reimbursement_Request"
JOIN "Account_Code" ON "Account_Code"."accountCodeId" = "Reimbursement_Request"."indexCodeId";

INSERT INTO "Reimbursement_Product_Other_Reason" ("otherReimbursementProductReasonId", "name", "dateCreated", "userCreatedId", "budget", "indexCodeId", "accountCodeId")
SELECT gen_random_uuid(), "otherReason", NOW(), 'default-user-id', 0, 'default-index-id', 'default-account-id' 
FROM "Reimbursement_Product_Reason"
WHERE "otherReason" IS NOT NULL
GROUP BY "otherReason"; 

CREATE TABLE "Account_To_Index_Code_Mapping" (
    "oldClubAccount" TEXT NOT NULL,  
    "indexCodeName" TEXT NOT NULL   
);

INSERT INTO "Account_To_Index_Code_Mapping" ("oldClubAccount", "indexCodeName")
VALUES
    ('CASH', 'Cash'),
    ('BUDGET', 'Budget');

ALTER TABLE "Reimbursement_Request" ALTER COLUMN "account" SET DATA TYPE TEXT USING "account"::TEXT;

UPDATE "Reimbursement_Request" AS rr
SET "indexCodeId" = (
    SELECT ic."indexCodeId"
    FROM "Index_Code" AS ic
    JOIN "Account_To_Index_Code_Mapping" AS mapping
    ON ic."name" = mapping."indexCodeName"
    WHERE mapping."oldClubAccount" = rr."account"::text 
)
WHERE rr."account" IS NOT NULL;

ALTER TABLE "Account_Code" ADD COLUMN "allowedRefundSources_temp" TEXT[]; 

UPDATE "Account_Code" AS ac
SET "allowedRefundSources_temp" = (
  SELECT ARRAY(
    SELECT ic."indexCodeId"
    FROM "Account_To_Index_Code_Mapping" AS mapping
    JOIN "Index_Code" AS ic
      ON ic."name" = mapping."indexCodeName"
    WHERE mapping."oldClubAccount" = ANY(ac."allowedRefundSources"::text[])  
  )
)
WHERE ac."allowedRefundSources" IS NOT NULL;

ALTER TABLE "Account_Code" DROP COLUMN "allowedRefundSources";
ALTER TABLE "Account_Code" ADD COLUMN "allowedRefundSources" TEXT[];
UPDATE "Account_Code" SET "allowedRefundSources" = "allowedRefundSources_temp";
ALTER TABLE "Account_Code" DROP COLUMN "allowedRefundSources_temp";

DROP TABLE "Account_To_Index_Code_Mapping";

CREATE TABLE "Other_Reason_Enum_To_Model" (
    "oldOtherReason" TEXT NOT NULL,  
    "otherReasonName" TEXT NOT NULL   
);

INSERT INTO "Other_Reason_Enum_To_Model" ("oldOtherReason", "otherReasonName")
VALUES
    ('TOOLS_AND_EQUIPMENT', 'Tools and Equipment'),
    ('COMPETITION', 'Competition'),
    ('CONSUMABLES', 'Consumables'),
    ('GENERAL_STOCK', 'General Stock'),
    ('SUBSCRIPTIONS_AND_MEMBERSHIPS', 'Subscriptions and Memberships');

ALTER TABLE "Reimbursement_Product_Reason" ALTER COLUMN "otherReason" SET DATA TYPE TEXT USING "otherReason"::TEXT;

UPDATE "Reimbursement_Product_Reason" AS rr
SET "otherReasonId" = (
    SELECT rpor."otherReimbursementProductReasonId"
    FROM "Reimbursement_Product_Other_Reason" AS rpor
    JOIN "Other_Reason_Enum_To_Model" AS mapping
    ON rpor."name" = mapping."otherReasonName"
    WHERE mapping."oldOtherReason" = rr."otherReason"::text  -- Ensure explicit cast
)
WHERE rr."otherReason" IS NOT NULL;

DROP TABLE "Other_Reason_Enum_To_Model";

DROP TYPE "Club_Accounts";
DROP TYPE "Other_Reimbursement_Product_Reason";

-- AlterTable
ALTER TABLE "Account_Code" DROP COLUMN "allowedRefundSources";

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "reimbursementRequestId" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "addedByUserId" TEXT,
ADD COLUMN     "discountCode" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "password" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "taxExempt" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN     "twoFactorContactId" TEXT,
ADD COLUMN     "username" TEXT NOT NULL DEFAULT '';

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
CREATE TABLE "_Account_CodeToIndex_Code" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_name_organizationId_key" ON "Sponsor"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "_Account_CodeToIndex_Code_AB_unique" ON "_Account_CodeToIndex_Code"("A", "B");

-- CreateIndex
CREATE INDEX "_Account_CodeToIndex_Code_B_index" ON "_Account_CodeToIndex_Code"("B");

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
ALTER TABLE "Index_Code" ADD CONSTRAINT "Index_Code_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Other_Reason" ADD CONSTRAINT "Reimbursement_Product_Other_Reason_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Other_Reason" ADD CONSTRAINT "Reimbursement_Product_Other_Reason_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Other_Reason" ADD CONSTRAINT "Reimbursement_Product_Other_Reason_indexCodeId_fkey" FOREIGN KEY ("indexCodeId") REFERENCES "Index_Code"("indexCodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Other_Reason" ADD CONSTRAINT "Reimbursement_Product_Other_Reason_accountCodeId_fkey" FOREIGN KEY ("accountCodeId") REFERENCES "Account_Code"("accountCodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Account_CodeToIndex_Code" ADD CONSTRAINT "_Account_CodeToIndex_Code_A_fkey" FOREIGN KEY ("A") REFERENCES "Account_Code"("accountCodeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Account_CodeToIndex_Code" ADD CONSTRAINT "_Account_CodeToIndex_Code_B_fkey" FOREIGN KEY ("B") REFERENCES "Index_Code"("indexCodeId") ON DELETE CASCADE ON UPDATE CASCADE;
