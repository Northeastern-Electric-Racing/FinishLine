-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "addedByUserId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Activation_CR_changeRequestId_idx" ON "Activation_CR"("changeRequestId");

-- CreateIndex
CREATE INDEX "Availability_scheduleSettingsId_idx" ON "Availability"("scheduleSettingsId");

-- CreateIndex
CREATE INDEX "Budget_CR_changeRequestId_idx" ON "Budget_CR"("changeRequestId");

-- CreateIndex
CREATE INDEX "Change_wbsElementId_idx" ON "Change"("wbsElementId");

-- CreateIndex
CREATE INDEX "Description_Bullet_wbsElementId_idx" ON "Description_Bullet"("wbsElementId");

-- CreateIndex
CREATE INDEX "Description_Bullet_proposedChangeId_idx" ON "Description_Bullet"("proposedChangeId");

-- CreateIndex
CREATE INDEX "Description_Bullet_wbsElementTemplateId_idx" ON "Description_Bullet"("wbsElementTemplateId");

-- CreateIndex
CREATE INDEX "Graph_graphCollectionId_idx" ON "Graph"("graphCollectionId");

-- CreateIndex
CREATE INDEX "Link_wbsElementId_idx" ON "Link"("wbsElementId");

-- CreateIndex
CREATE INDEX "Link_wbsProposedChangesId_idx" ON "Link"("wbsProposedChangesId");

-- CreateIndex
CREATE INDEX "Material_assemblyId_idx" ON "Material"("assemblyId");

-- CreateIndex
CREATE INDEX "Material_materialTypeId_idx" ON "Material"("materialTypeId");

-- CreateIndex
CREATE INDEX "Material_manufacturerId_idx" ON "Material"("manufacturerId");

-- CreateIndex
CREATE INDEX "Message_Info_reimbursementRequestId_idx" ON "Message_Info"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Message_Info_designReviewId_idx" ON "Message_Info"("designReviewId");

-- CreateIndex
CREATE INDEX "Part_Review_submissionId_idx" ON "Part_Review"("submissionId");

-- CreateIndex
CREATE INDEX "Part_Review_Popup_reviewId_idx" ON "Part_Review_Popup"("reviewId");

-- CreateIndex
CREATE INDEX "Part_Review_Request_partId_idx" ON "Part_Review_Request"("partId");

-- CreateIndex
CREATE INDEX "Part_Submission_partId_idx" ON "Part_Submission"("partId");

-- CreateIndex
CREATE INDEX "Project_Proposed_Changes_wbsProposedChangesId_idx" ON "Project_Proposed_Changes"("wbsProposedChangesId");

-- CreateIndex
CREATE INDEX "Proposed_Solution_scopeChangeRequestId_idx" ON "Proposed_Solution"("scopeChangeRequestId");

-- CreateIndex
CREATE INDEX "Receipt_reimbursementRequestId_idx" ON "Receipt"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Refund_Source_reimbursementProductId_idx" ON "Refund_Source"("reimbursementProductId");

-- CreateIndex
CREATE INDEX "Reimbursement_Product_reimbursementRequestId_idx" ON "Reimbursement_Product"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Reimbursement_Request_Comment_reimbursementRequestId_idx" ON "Reimbursement_Request_Comment"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Reimbursement_Status_reimbursementRequestId_idx" ON "Reimbursement_Status"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Scope_CR_changeRequestId_idx" ON "Scope_CR"("changeRequestId");

-- CreateIndex
CREATE INDEX "Scope_CR_Why_scopeCrId_idx" ON "Scope_CR_Why"("scopeCrId");

-- CreateIndex
CREATE INDEX "Sponsor_sponsorTierId_idx" ON "Sponsor"("sponsorTierId");

-- CreateIndex
CREATE INDEX "Sponsor_Task_sponsorId_idx" ON "Sponsor_Task"("sponsorId");

-- CreateIndex
CREATE INDEX "Stage_Gate_CR_changeRequestId_idx" ON "Stage_Gate_CR"("changeRequestId");

-- CreateIndex
CREATE INDEX "Task_wbsElementId_idx" ON "Task"("wbsElementId");

-- CreateIndex
CREATE INDEX "Wbs_Proposed_Changes_scopeChangeRequestAsOriginalDataId_idx" ON "Wbs_Proposed_Changes"("scopeChangeRequestAsOriginalDataId");

-- CreateIndex
CREATE INDEX "Wbs_Proposed_Changes_scopeChangeRequestId_idx" ON "Wbs_Proposed_Changes"("scopeChangeRequestId");

-- CreateIndex
CREATE INDEX "Work_Package_projectId_idx" ON "Work_Package"("projectId");

-- CreateIndex
CREATE INDEX "Work_Package_Proposed_Changes_wbsProposedChangesId_idx" ON "Work_Package_Proposed_Changes"("wbsProposedChangesId");

-- CreateIndex
CREATE INDEX "Work_Package_Template_projectTemplateId_idx" ON "Work_Package_Template"("projectTemplateId");
