-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "reimbursementRequestId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "addedByUserId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "discountCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "notes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "password" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "twoFactorContactId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "username" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Sponsoring_Vendor" (
    "sponsoringVendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "activeStatus" BOOLEAN NOT NULL,
    "vendorContact" TEXT NOT NULL,
    "sponsorTierId" TEXT NOT NULL,
    "sponsorValue" INTEGER NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "discountCode" TEXT NOT NULL,
    "activeYears" INTEGER[],
    "taxExempt" BOOLEAN NOT NULL,

    CONSTRAINT "Sponsoring_Vendor_pkey" PRIMARY KEY ("sponsoringVendorId")
);

-- CreateTable
CREATE TABLE "Sponsoring_Vendor_Tasks" (
    "sponsoringVendorTasksId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "notifyDate" TIMESTAMP(3) NOT NULL,
    "assignToUserId" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "Sponsoring_Vendor_Tasks_pkey" PRIMARY KEY ("sponsoringVendorTasksId")
);

-- CreateTable
CREATE TABLE "Sponsor_Tier" (
    "sponsorTierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Sponsor_Tier_pkey" PRIMARY KEY ("sponsorTierId")
);

-- CreateTable
CREATE TABLE "_ProjectToReimbursement_Request" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Sponsoring_Vendor_organizationId_key" ON "Sponsoring_Vendor"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToReimbursement_Request_AB_unique" ON "_ProjectToReimbursement_Request"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToReimbursement_Request_B_index" ON "_ProjectToReimbursement_Request"("B");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_twoFactorContactId_fkey" FOREIGN KEY ("twoFactorContactId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsoring_Vendor" ADD CONSTRAINT "Sponsoring_Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsoring_Vendor" ADD CONSTRAINT "Sponsoring_Vendor_sponsorTierId_fkey" FOREIGN KEY ("sponsorTierId") REFERENCES "Sponsor_Tier"("sponsorTierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsoring_Vendor_Tasks" ADD CONSTRAINT "Sponsoring_Vendor_Tasks_assignToUserId_fkey" FOREIGN KEY ("assignToUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsoring_Vendor_Tasks" ADD CONSTRAINT "Sponsoring_Vendor_Tasks_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Sponsoring_Vendor"("sponsoringVendorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

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
