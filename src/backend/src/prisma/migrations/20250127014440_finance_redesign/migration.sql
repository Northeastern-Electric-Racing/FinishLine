-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "reimbursementRequestId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "addedByUserId" TEXT,
ADD COLUMN     "discountCode" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "password" TEXT NOT NULL DEFAULT '',
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
CREATE TABLE "_ProjectToReimbursement_Request" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_name_organizationId_key" ON "Sponsor"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToReimbursement_Request_AB_unique" ON "_ProjectToReimbursement_Request"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToReimbursement_Request_B_index" ON "_ProjectToReimbursement_Request"("B");

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
ALTER TABLE "Material" ADD CONSTRAINT "Material_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor_Tier" ADD CONSTRAINT "Sponsor_Tier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

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