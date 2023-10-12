/*
  Warnings:

  - You are about to drop the column `wbsElementId` on the `Reimbursement_Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Other_Reimbursement_Product_Reason" AS ENUM ('TOOLS_AND_EQUIPMENT', 'COMPETITION', 'CONSUMABLES', 'GENERAL_STOCK', 'SUBSCRIPTIONS_AND_MEMBERSHIPS');

-- AlterTable
ALTER TABLE "Reimbursement_Product" ADD COLUMN "reimbursementProductReasonId" TEXT;

-- CreateTable
CREATE TABLE "Reimbursement_Product_Reason" (
    "reimbursementProductReasonId" TEXT NOT NULL,
    "wbsElementId" INTEGER,
    "otherReason" "Other_Reimbursement_Product_Reason",
    "reimbursementProductId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Product_Reason_pkey" PRIMARY KEY ("reimbursementProductReasonId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Product_Reason_reimbursementProductId_key" ON "Reimbursement_Product_Reason"("reimbursementProductId");

INSERT INTO "Reimbursement_Product_Reason" ("reimbursementProductReasonId", "wbsElementId", "reimbursementProductId") SELECT gen_random_uuid(), "wbsElementId", "reimbursementProductId" FROM "Reimbursement_Product";

-- DropForeignKey
ALTER TABLE "Reimbursement_Product" DROP CONSTRAINT "Reimbursement_Product_wbsElementId_fkey";

-- AlterTable
ALTER TABLE "Reimbursement_Product" DROP COLUMN "wbsElementId";

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Reason" ADD CONSTRAINT "Reimbursement_Product_Reason_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Reason" ADD CONSTRAINT "Reimbursement_Product_Reason_reimbursementProductId_fkey" FOREIGN KEY ("reimbursementProductId") REFERENCES "Reimbursement_Product"("reimbursementProductId") ON DELETE RESTRICT ON UPDATE CASCADE;
