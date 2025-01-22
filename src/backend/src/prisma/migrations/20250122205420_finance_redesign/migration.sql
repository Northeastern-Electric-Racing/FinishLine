-- CreateEnum
CREATE TYPE "Sponsor_Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "reimbursementNumber" TEXT NOT NULL;

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
ADD COLUMN     "sponsor_TierId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "Sponsor_Status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "taxExempt" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN     "twoFactorContact" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "username" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "value" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Sponsor_Tier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Sponsor_Tier_pkey" PRIMARY KEY ("id")
);

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
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_sponsor_TierId_fkey" FOREIGN KEY ("sponsor_TierId") REFERENCES "Sponsor_Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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