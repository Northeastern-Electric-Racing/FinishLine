/*
  Warnings:

  - You are about to drop the `RefundSource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RefundSource" DROP CONSTRAINT "RefundSource_indexCodeId_fkey";

-- DropForeignKey
ALTER TABLE "RefundSource" DROP CONSTRAINT "RefundSource_reimbursementProductId_fkey";

-- DropTable
DROP TABLE "RefundSource";

-- CreateTable
CREATE TABLE "Refund_Source" (
    "refundSourceId" TEXT NOT NULL,
    "indexCodeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reimbursementProductId" TEXT,

    CONSTRAINT "Refund_Source_pkey" PRIMARY KEY ("refundSourceId")
);

-- AddForeignKey
ALTER TABLE "Refund_Source" ADD CONSTRAINT "Refund_Source_indexCodeId_fkey" FOREIGN KEY ("indexCodeId") REFERENCES "Index_Code"("indexCodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund_Source" ADD CONSTRAINT "Refund_Source_reimbursementProductId_fkey" FOREIGN KEY ("reimbursementProductId") REFERENCES "Reimbursement_Product"("reimbursementProductId") ON DELETE SET NULL ON UPDATE CASCADE;
