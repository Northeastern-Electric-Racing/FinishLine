/*
  Warnings:

  - You are about to drop the column `wbsElementId` on the `Reimbursement_Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reimbursementProductReasonId]` on the table `Reimbursement_Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reimbursementProductReasonId` to the `Reimbursement_Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Other_Reimbursement_Product_Reason" AS ENUM ('TOOLS_AND_EQUIPMENT', 'COMPETITION', 'CONSUMABLES', 'GENERAL_STOCK', 'SUBSCRIPTIONS_AND_MEMBERSHIPS');

-- AlterTable
ALTER TABLE "Reimbursement_Product"
ADD COLUMN "reimbursementProductReasonId" TEXT;

-- CreateTable
CREATE TABLE "Reimbursement_Product_Reason" (
    "reimbursementProductReasonId" TEXT NOT NULL,
    "wbsElementId" INTEGER,
    "otherReason" "Other_Reimbursement_Product_Reason",
    "reimbursementProductId" TEXT,

    CONSTRAINT "Reimbursement_Product_Reason_pkey" PRIMARY KEY ("reimbursementProductReasonId")
);

INSERT INTO "Reimbursement_Product_Reason" ("reimbursementProductReasonId", "wbsElementId", "reimbursementProductId") SELECT gen_random_uuid(), "wbsElementId", "reimbursementProductId" FROM "Reimbursement_Product";

UPDATE "Reimbursement_Product"
SET "reimbursementProductReasonId" = (
    SELECT "reimbursementProductReasonId"
    FROM "Reimbursement_Product_Reason"
    WHERE "Reimbursement_Product_Reason"."reimbursementProductId" = "Reimbursement_Product"."reimbursementProductId"
);

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Product_reimbursementProductReasonId_key" ON "Reimbursement_Product"("reimbursementProductReasonId");


-- DropForeignKey
ALTER TABLE "Reimbursement_Product" DROP CONSTRAINT "Reimbursement_Product_wbsElementId_fkey";

-- AlterTable
ALTER TABLE "Reimbursement_Product" DROP COLUMN "wbsElementId";

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Reason" ADD CONSTRAINT "Reimbursement_Product_Reason_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Reimbursement_Product" ALTER COLUMN "reimbursementProductReasonId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product" ADD CONSTRAINT "Reimbursement_Product_reimbursementProductReasonId_fkey" FOREIGN KEY ("reimbursementProductReasonId") REFERENCES "Reimbursement_Product_Reason"("reimbursementProductReasonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Reimbursement_Product_Reason"
DROP COLUMN "reimbursementProductId";