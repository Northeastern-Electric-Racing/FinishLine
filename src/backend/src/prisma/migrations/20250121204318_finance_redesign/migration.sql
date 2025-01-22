/*
  Warnings:

  - Added the required column `reimbursementNumber` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activeYears` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addedByUserId` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignToUserId` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contacts` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountCode` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joinDate` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notes` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notifyDate` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxExempt` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tier` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twoFactorContact` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sponsor_Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Sponsor_Tier" AS ENUM ('GOLD', 'SILVER', 'BRONZE');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "reimbursementNumber" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "activeYears" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "addedByUserId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "assignToUserId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contacts" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "discountCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN     "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN     "notes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "notifyDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN     "password" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "Sponsor_Status" NOT NULL  DEFAULT 'ACTIVE',
ADD COLUMN     "taxExempt" BOOLEAN NOT NULL  DEFAULT TRUE,
ADD COLUMN     "tier" "Sponsor_Tier" NOT NULL DEFAULT 'BRONZE',
ADD COLUMN     "twoFactorContact" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "username" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "value" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "_ProjectToReimbursement_Request" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToReimbursement_Request_AB_unique" ON "_ProjectToReimbursement_Request"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToReimbursement_Request_B_index" ON "_ProjectToReimbursement_Request"("B");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_assignToUserId_fkey" FOREIGN KEY ("assignToUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_reimbursementNumber_fkey" FOREIGN KEY ("reimbursementNumber") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" ADD CONSTRAINT "_ProjectToReimbursement_Request_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" ADD CONSTRAINT "_ProjectToReimbursement_Request_B_fkey" FOREIGN KEY ("B") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ProjectToReimbursement_Request" RENAME COLUMN "A" TO "projectId";

ALTER TABLE "_ProjectToReimbursement_Request" RENAME COLUMN "B" TO "reimbursementRequestId";

INSERT INTO "_ProjectToReimbursement_Request" ("projectId", "reimbursementRequestId")

SELECT DISTINCT Project."projectId" as "projectId", "Reimbursement_Request"."reimbursementRequestId" as "reimbursementRequestId"

FROM "Reimbursement_Request" 

JOIN "Reimbursement_Product" reimbursementProduct ON "Reimbursement_Request"."reimbursementRequestId" = reimbursementProduct."reimbursementRequestId"

JOIN "Reimbursement_Product_Reason" reimbursementProductReason ON reimbursementProduct."reimbursementProductReasonId" = reimbursementProductReason."reimbursementProductReasonId"

JOIN "WBS_Element" wbs_element ON reimbursementProductReason."wbsElementId" = wbs_element."wbsElementId"

JOIN "Project" project ON project."wbsElementId" = wbs_element."wbsElementId"