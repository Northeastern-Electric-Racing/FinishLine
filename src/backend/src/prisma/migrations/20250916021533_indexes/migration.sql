-- CreateIndex
CREATE INDEX "Account_Code_organizationId_idx" ON "public"."Account_Code"("organizationId");

-- CreateIndex
CREATE INDEX "Activation_CR_changeRequestId_idx" ON "public"."Activation_CR"("changeRequestId");

-- CreateIndex
CREATE INDEX "Announcement_organizationId_idx" ON "public"."Announcement"("organizationId");

-- CreateIndex
CREATE INDEX "Assembly_wbsElementId_idx" ON "public"."Assembly"("wbsElementId");

-- CreateIndex
CREATE INDEX "Availability_scheduleSettingsId_idx" ON "public"."Availability"("scheduleSettingsId");

-- CreateIndex
CREATE INDEX "Budget_CR_changeRequestId_idx" ON "public"."Budget_CR"("changeRequestId");

-- CreateIndex
CREATE INDEX "Car_wbsElementId_idx" ON "public"."Car"("wbsElementId");

-- CreateIndex
CREATE INDEX "Change_wbsElementId_idx" ON "public"."Change"("wbsElementId");

-- CreateIndex
CREATE INDEX "Change_changeRequestId_idx" ON "public"."Change"("changeRequestId");

-- CreateIndex
CREATE INDEX "Change_categoryId_idx" ON "public"."Change"("categoryId");

-- CreateIndex
CREATE INDEX "Change_accountCodeId_idx" ON "public"."Change"("accountCodeId");

-- CreateIndex
CREATE INDEX "Change_Request_reviewerId_idx" ON "public"."Change_Request"("reviewerId");

-- CreateIndex
CREATE INDEX "Change_Request_organizationId_idx" ON "public"."Change_Request"("organizationId");

-- CreateIndex
CREATE INDEX "Checklist_organizationId_idx" ON "public"."Checklist"("organizationId");

-- CreateIndex
CREATE INDEX "Checklist_teamId_idx" ON "public"."Checklist"("teamId");

-- CreateIndex
CREATE INDEX "Checklist_teamTypeId_idx" ON "public"."Checklist"("teamTypeId");

-- CreateIndex
CREATE INDEX "Contact_organizationId_idx" ON "public"."Contact"("organizationId");

-- CreateIndex
CREATE INDEX "Description_Bullet_wbsElementId_idx" ON "public"."Description_Bullet"("wbsElementId");

-- CreateIndex
CREATE INDEX "Description_Bullet_proposedChangeId_idx" ON "public"."Description_Bullet"("proposedChangeId");

-- CreateIndex
CREATE INDEX "Description_Bullet_wbsElementTemplateId_idx" ON "public"."Description_Bullet"("wbsElementTemplateId");

-- CreateIndex
CREATE INDEX "Description_Bullet_descriptionBulletTypeId_idx" ON "public"."Description_Bullet"("descriptionBulletTypeId");

-- CreateIndex
CREATE INDEX "Description_Bullet_Type_organizationId_idx" ON "public"."Description_Bullet_Type"("organizationId");

-- CreateIndex
CREATE INDEX "Design_Review_teamTypeId_idx" ON "public"."Design_Review"("teamTypeId");

-- CreateIndex
CREATE INDEX "Graph_graphCollectionId_idx" ON "public"."Graph"("graphCollectionId");

-- CreateIndex
CREATE INDEX "Graph_organizationId_idx" ON "public"."Graph"("organizationId");

-- CreateIndex
CREATE INDEX "Graph_Collection_organizationId_idx" ON "public"."Graph_Collection"("organizationId");

-- CreateIndex
CREATE INDEX "Index_Code_organizationId_idx" ON "public"."Index_Code"("organizationId");

-- CreateIndex
CREATE INDEX "Link_wbsElementId_idx" ON "public"."Link"("wbsElementId");

-- CreateIndex
CREATE INDEX "Link_wbsProposedChangesId_idx" ON "public"."Link"("wbsProposedChangesId");

-- CreateIndex
CREATE INDEX "Link_organizationId_idx" ON "public"."Link"("organizationId");

-- CreateIndex
CREATE INDEX "Link_linkTypeId_idx" ON "public"."Link"("linkTypeId");

-- CreateIndex
CREATE INDEX "Link_Type_organizationId_idx" ON "public"."Link_Type"("organizationId");

-- CreateIndex
CREATE INDEX "Manufacturer_organizationId_idx" ON "public"."Manufacturer"("organizationId");

-- CreateIndex
CREATE INDEX "Material_assemblyId_idx" ON "public"."Material"("assemblyId");

-- CreateIndex
CREATE INDEX "Material_materialTypeId_idx" ON "public"."Material"("materialTypeId");

-- CreateIndex
CREATE INDEX "Material_manufacturerId_idx" ON "public"."Material"("manufacturerId");

-- CreateIndex
CREATE INDEX "Material_reimbursementRequestId_idx" ON "public"."Material"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Material_wbsElementId_idx" ON "public"."Material"("wbsElementId");

-- CreateIndex
CREATE INDEX "Material_Type_organizationId_idx" ON "public"."Material_Type"("organizationId");

-- CreateIndex
CREATE INDEX "Message_Info_reimbursementRequestId_idx" ON "public"."Message_Info"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Message_Info_designReviewId_idx" ON "public"."Message_Info"("designReviewId");

-- CreateIndex
CREATE INDEX "Message_Info_changeRequestId_idx" ON "public"."Message_Info"("changeRequestId");

-- CreateIndex
CREATE INDEX "Milestone_organizationId_idx" ON "public"."Milestone"("organizationId");

-- CreateIndex
CREATE INDEX "Part_Review_submissionId_idx" ON "public"."Part_Review"("submissionId");

-- CreateIndex
CREATE INDEX "Part_Review_Popup_reviewId_idx" ON "public"."Part_Review_Popup"("reviewId");

-- CreateIndex
CREATE INDEX "Part_Review_Request_partId_idx" ON "public"."Part_Review_Request"("partId");

-- CreateIndex
CREATE INDEX "Part_Submission_partId_idx" ON "public"."Part_Submission"("partId");

-- CreateIndex
CREATE INDEX "Part_Tag_organizationId_idx" ON "public"."Part_Tag"("organizationId");

-- CreateIndex
CREATE INDEX "PopUp_organizationId_idx" ON "public"."PopUp"("organizationId");

-- CreateIndex
CREATE INDEX "Project_carId_idx" ON "public"."Project"("carId");

-- CreateIndex
CREATE INDEX "Project_Proposed_Changes_wbsProposedChangesId_idx" ON "public"."Project_Proposed_Changes"("wbsProposedChangesId");

-- CreateIndex
CREATE INDEX "Project_Proposed_Changes_carId_idx" ON "public"."Project_Proposed_Changes"("carId");

-- CreateIndex
CREATE INDEX "Proposed_Solution_scopeChangeRequestId_idx" ON "public"."Proposed_Solution"("scopeChangeRequestId");

-- CreateIndex
CREATE INDEX "Receipt_reimbursementRequestId_idx" ON "public"."Receipt"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Refund_Source_reimbursementProductId_idx" ON "public"."Refund_Source"("reimbursementProductId");

-- CreateIndex
CREATE INDEX "Refund_Source_indexCodeId_idx" ON "public"."Refund_Source"("indexCodeId");

-- CreateIndex
CREATE INDEX "Reimbursement_organizationId_idx" ON "public"."Reimbursement"("organizationId");

-- CreateIndex
CREATE INDEX "Reimbursement_Product_reimbursementRequestId_idx" ON "public"."Reimbursement_Product"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Reimbursement_Product_reimbursementProductReasonId_idx" ON "public"."Reimbursement_Product"("reimbursementProductReasonId");

-- CreateIndex
CREATE INDEX "Reimbursement_Product_Other_Reason_indexCodeId_idx" ON "public"."Reimbursement_Product_Other_Reason"("indexCodeId");

-- CreateIndex
CREATE INDEX "Reimbursement_Product_Reason_wbsElementId_idx" ON "public"."Reimbursement_Product_Reason"("wbsElementId");

-- CreateIndex
CREATE INDEX "Reimbursement_Product_Reason_otherReasonId_idx" ON "public"."Reimbursement_Product_Reason"("otherReasonId");

-- CreateIndex
CREATE INDEX "Reimbursement_Request_organizationId_idx" ON "public"."Reimbursement_Request"("organizationId");

-- CreateIndex
CREATE INDEX "Reimbursement_Request_accountCodeId_idx" ON "public"."Reimbursement_Request"("accountCodeId");

-- CreateIndex
CREATE INDEX "Reimbursement_Request_indexCodeId_idx" ON "public"."Reimbursement_Request"("indexCodeId");

-- CreateIndex
CREATE INDEX "Reimbursement_Request_vendorId_idx" ON "public"."Reimbursement_Request"("vendorId");

-- CreateIndex
CREATE INDEX "Reimbursement_Request_Comment_reimbursementRequestId_idx" ON "public"."Reimbursement_Request_Comment"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Reimbursement_Status_reimbursementRequestId_idx" ON "public"."Reimbursement_Status"("reimbursementRequestId");

-- CreateIndex
CREATE INDEX "Role_organizationId_idx" ON "public"."Role"("organizationId");

-- CreateIndex
CREATE INDEX "Scope_CR_Why_scopeCrId_idx" ON "public"."Scope_CR_Why"("scopeCrId");

-- CreateIndex
CREATE INDEX "Sponsor_sponsorTierId_idx" ON "public"."Sponsor"("sponsorTierId");

-- CreateIndex
CREATE INDEX "Sponsor_organizationId_idx" ON "public"."Sponsor"("organizationId");

-- CreateIndex
CREATE INDEX "Sponsor_Task_sponsorId_idx" ON "public"."Sponsor_Task"("sponsorId");

-- CreateIndex
CREATE INDEX "Sponsor_Tier_organizationId_idx" ON "public"."Sponsor_Tier"("organizationId");

-- CreateIndex
CREATE INDEX "Stage_Gate_CR_changeRequestId_idx" ON "public"."Stage_Gate_CR"("changeRequestId");

-- CreateIndex
CREATE INDEX "Task_wbsElementId_idx" ON "public"."Task"("wbsElementId");

-- CreateIndex
CREATE INDEX "Team_headId_idx" ON "public"."Team"("headId");

-- CreateIndex
CREATE INDEX "Team_organizationId_idx" ON "public"."Team"("organizationId");

-- CreateIndex
CREATE INDEX "Team_Type_organizationId_idx" ON "public"."Team_Type"("organizationId");

-- CreateIndex
CREATE INDEX "Unit_organizationId_idx" ON "public"."Unit"("organizationId");

-- CreateIndex
CREATE INDEX "Vendor_organizationId_idx" ON "public"."Vendor"("organizationId");

-- CreateIndex
CREATE INDEX "WBS_Element_organizationId_idx" ON "public"."WBS_Element"("organizationId");

-- CreateIndex
CREATE INDEX "WBS_Element_Template_organizationId_idx" ON "public"."WBS_Element_Template"("organizationId");

-- CreateIndex
CREATE INDEX "Wbs_Proposed_Changes_scopeChangeRequestAsOriginalDataId_idx" ON "public"."Wbs_Proposed_Changes"("scopeChangeRequestAsOriginalDataId");

-- CreateIndex
CREATE INDEX "Wbs_Proposed_Changes_scopeChangeRequestId_idx" ON "public"."Wbs_Proposed_Changes"("scopeChangeRequestId");

-- CreateIndex
CREATE INDEX "Work_Package_projectId_idx" ON "public"."Work_Package"("projectId");

-- CreateIndex
CREATE INDEX "Work_Package_Proposed_Changes_wbsProposedChangesId_idx" ON "public"."Work_Package_Proposed_Changes"("wbsProposedChangesId");

-- CreateIndex
CREATE INDEX "Work_Package_Proposed_Changes_projectProposedChangesId_idx" ON "public"."Work_Package_Proposed_Changes"("projectProposedChangesId");

-- CreateIndex
CREATE INDEX "Work_Package_Template_projectTemplateId_idx" ON "public"."Work_Package_Template"("projectTemplateId");
