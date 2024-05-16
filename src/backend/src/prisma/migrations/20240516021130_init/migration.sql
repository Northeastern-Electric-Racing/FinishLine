-- CreateEnum
CREATE TYPE "CR_Type" AS ENUM ('ISSUE', 'DEFINITION_CHANGE', 'OTHER', 'STAGE_GATE', 'ACTIVATION');

-- CreateEnum
CREATE TYPE "Task_Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Task_Status" AS ENUM ('IN_BACKLOG', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "WBS_Element_Status" AS ENUM ('INACTIVE', 'ACTIVE', 'COMPLETE');

-- CreateEnum
CREATE TYPE "Role_Type" AS ENUM ('APP_ADMIN', 'ADMIN', 'HEAD', 'LEADERSHIP', 'MEMBER', 'GUEST');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "Scope_CR_Why_Type" AS ENUM ('ESTIMATION', 'SCHOOL', 'DESIGN', 'MANUFACTURING', 'RULES', 'INITIALIZATION', 'COMPETITION', 'MAINTENANCE', 'OTHER_PROJECT', 'OTHER');

-- CreateEnum
CREATE TYPE "Work_Package_Stage" AS ENUM ('RESEARCH', 'DESIGN', 'MANUFACTURING', 'INSTALL', 'TESTING');

-- CreateEnum
CREATE TYPE "Club_Accounts" AS ENUM ('CASH', 'BUDGET');

-- CreateEnum
CREATE TYPE "Reimbursement_Status_Type" AS ENUM ('PENDING_FINANCE', 'SABO_SUBMITTED', 'ADVISOR_APPROVED', 'REIMBURSED', 'DENIED');

-- CreateEnum
CREATE TYPE "Other_Reimbursement_Product_Reason" AS ENUM ('TOOLS_AND_EQUIPMENT', 'COMPETITION', 'CONSUMABLES', 'GENERAL_STOCK', 'SUBSCRIPTIONS_AND_MEMBERSHIPS');

-- CreateEnum
CREATE TYPE "Material_Status" AS ENUM ('RECEIVED', 'ORDERED', 'SHIPPED', 'NOT_READY_TO_ORDER', 'READY_TO_ORDER');

-- CreateEnum
CREATE TYPE "Design_Review_Status" AS ENUM ('UNCONFIRMED', 'CONFIRMED', 'SCHEDULED', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "googleAuthId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Role" (
    "roleId" SERIAL NOT NULL,
    "roleType" "Role_Type" NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "Team" (
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "slackId" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "financeTeam" BOOLEAN NOT NULL DEFAULT false,
    "headId" INTEGER NOT NULL,
    "dateArchived" TIMESTAMP(3),
    "userArchivedId" INTEGER,
    "teamTypeId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("teamId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceInfo" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "User_Settings" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "defaultTheme" "Theme" NOT NULL DEFAULT 'DARK',
    "slackId" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "User_Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Change_Request" (
    "crId" SERIAL NOT NULL,
    "submitterId" INTEGER NOT NULL,
    "dateSubmitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "wbsElementId" INTEGER NOT NULL,
    "type" "CR_Type" NOT NULL,
    "reviewerId" INTEGER,
    "deletedByUserId" INTEGER,
    "dateReviewed" TIMESTAMP(3),
    "accepted" BOOLEAN,
    "reviewNotes" TEXT,

    CONSTRAINT "Change_Request_pkey" PRIMARY KEY ("crId")
);

-- CreateTable
CREATE TABLE "Message_Info" (
    "messageInfoId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "changeRequestId" INTEGER,
    "designReviewId" TEXT,

    CONSTRAINT "Message_Info_pkey" PRIMARY KEY ("messageInfoId")
);

-- CreateTable
CREATE TABLE "Scope_CR" (
    "scopeCrId" SERIAL NOT NULL,
    "changeRequestId" INTEGER NOT NULL,
    "what" TEXT NOT NULL,
    "scopeImpact" TEXT NOT NULL,
    "timelineImpact" INTEGER NOT NULL,
    "budgetImpact" INTEGER NOT NULL,
    "wbsProposedChangesId" TEXT,

    CONSTRAINT "Scope_CR_pkey" PRIMARY KEY ("scopeCrId")
);

-- CreateTable
CREATE TABLE "Proposed_Solution" (
    "proposedSolutionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timelineImpact" INTEGER NOT NULL,
    "budgetImpact" INTEGER NOT NULL,
    "scopeImpact" TEXT NOT NULL,
    "changeRequestId" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Proposed_Solution_pkey" PRIMARY KEY ("proposedSolutionId")
);

-- CreateTable
CREATE TABLE "Scope_CR_Why" (
    "scopeCrWhyId" SERIAL NOT NULL,
    "scopeCrId" INTEGER NOT NULL,
    "type" "Scope_CR_Why_Type" NOT NULL,
    "explain" TEXT NOT NULL,

    CONSTRAINT "Scope_CR_Why_pkey" PRIMARY KEY ("scopeCrWhyId")
);

-- CreateTable
CREATE TABLE "Stage_Gate_CR" (
    "stageGateCrId" SERIAL NOT NULL,
    "changeRequestId" INTEGER NOT NULL,
    "leftoverBudget" INTEGER NOT NULL,
    "confirmDone" BOOLEAN NOT NULL,

    CONSTRAINT "Stage_Gate_CR_pkey" PRIMARY KEY ("stageGateCrId")
);

-- CreateTable
CREATE TABLE "Activation_CR" (
    "activationCrId" SERIAL NOT NULL,
    "changeRequestId" INTEGER NOT NULL,
    "leadId" INTEGER NOT NULL,
    "managerId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "confirmDetails" BOOLEAN NOT NULL,

    CONSTRAINT "Activation_CR_pkey" PRIMARY KEY ("activationCrId")
);

-- CreateTable
CREATE TABLE "Change" (
    "changeId" SERIAL NOT NULL,
    "changeRequestId" INTEGER NOT NULL,
    "dateImplemented" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "implementerId" INTEGER NOT NULL,
    "wbsElementId" INTEGER NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "Change_pkey" PRIMARY KEY ("changeId")
);

-- CreateTable
CREATE TABLE "WBS_Element" (
    "wbsElementId" SERIAL NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "carNumber" INTEGER NOT NULL,
    "projectNumber" INTEGER NOT NULL,
    "workPackageNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "WBS_Element_Status" NOT NULL DEFAULT 'INACTIVE',
    "leadId" INTEGER,
    "managerId" INTEGER,
    "deletedByUserId" INTEGER,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "WBS_Element_pkey" PRIMARY KEY ("wbsElementId")
);

-- CreateTable
CREATE TABLE "Project" (
    "projectId" SERIAL NOT NULL,
    "wbsElementId" INTEGER NOT NULL,
    "budget" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "carId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "Work_Package" (
    "workPackageId" SERIAL NOT NULL,
    "wbsElementId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "orderInProject" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "stage" "Work_Package_Stage",

    CONSTRAINT "Work_Package_pkey" PRIMARY KEY ("workPackageId")
);

-- CreateTable
CREATE TABLE "Link_Type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "iconName" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Link_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "linkId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "linkTypeId" TEXT NOT NULL,
    "wbsElementId" INTEGER,
    "wbsProposedChangesId" TEXT,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("linkId")
);

-- CreateTable
CREATE TABLE "Description_Bullet_Type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "required" BOOLEAN NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "userDeletedId" INTEGER,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Description_Bullet_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Description_Bullet" (
    "descriptionId" SERIAL NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCheckedId" INTEGER,
    "dateTimeChecked" TIMESTAMP(3),
    "dateDeleted" TIMESTAMP(3),
    "detail" TEXT NOT NULL,
    "descriptionBulletTypeId" TEXT NOT NULL,
    "wbsElementId" INTEGER,
    "proposedChangeId" TEXT,
    "workPackageTemplateId" TEXT,

    CONSTRAINT "Description_Bullet_pkey" PRIMARY KEY ("descriptionId")
);

-- CreateTable
CREATE TABLE "Task" (
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "priority" "Task_Priority" NOT NULL,
    "status" "Task_Status" NOT NULL,
    "deletedByUserId" INTEGER,
    "dateDeleted" TIMESTAMP(3),
    "createdByUserId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wbsElementId" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("taskId")
);

-- CreateTable
CREATE TABLE "Reimbursement_Status" (
    "reimbursementStatusId" SERIAL NOT NULL,
    "type" "Reimbursement_Status_Type" NOT NULL,
    "userId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reimbursementRequestId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Status_pkey" PRIMARY KEY ("reimbursementStatusId")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "receiptId" TEXT NOT NULL,
    "googleFileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deletedByUserId" INTEGER,
    "dateDeleted" TIMESTAMP(3),
    "createdByUserId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reimbursementRequestId" TEXT NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("receiptId")
);

-- CreateTable
CREATE TABLE "Reimbursement_Request" (
    "reimbursementRequestId" TEXT NOT NULL,
    "identifier" SERIAL NOT NULL,
    "saboId" INTEGER,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "dateOfExpense" TIMESTAMP(3) NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "vendorId" TEXT NOT NULL,
    "account" "Club_Accounts" NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "dateDelivered" TIMESTAMP(3),
    "accountCodeId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Request_pkey" PRIMARY KEY ("reimbursementRequestId")
);

-- CreateTable
CREATE TABLE "Reimbursement_Product_Reason" (
    "reimbursementProductReasonId" TEXT NOT NULL,
    "wbsElementId" INTEGER,
    "otherReason" "Other_Reimbursement_Product_Reason",

    CONSTRAINT "Reimbursement_Product_Reason_pkey" PRIMARY KEY ("reimbursementProductReasonId")
);

-- CreateTable
CREATE TABLE "Reimbursement_Product" (
    "reimbursementProductId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "cost" INTEGER NOT NULL,
    "reimbursementProductReasonId" TEXT NOT NULL,
    "reimbursementRequestId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_Product_pkey" PRIMARY KEY ("reimbursementProductId")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "vendorId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("vendorId")
);

-- CreateTable
CREATE TABLE "Account_Code" (
    "accountCodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "allowed" BOOLEAN NOT NULL,
    "allowedRefundSources" "Club_Accounts"[],
    "dateDeleted" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Account_Code_pkey" PRIMARY KEY ("accountCodeId")
);

-- CreateTable
CREATE TABLE "Reimbursement" (
    "reimbursementId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "userSubmittedId" INTEGER NOT NULL,
    "purchaserId" INTEGER NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Reimbursement_pkey" PRIMARY KEY ("reimbursementId")
);

-- CreateTable
CREATE TABLE "User_Secure_Settings" (
    "userSecureSettingsId" TEXT NOT NULL,
    "nuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "User_Secure_Settings_pkey" PRIMARY KEY ("userSecureSettingsId")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assembly" (
    "assemblyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pdmFileName" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "wbsElementId" INTEGER NOT NULL,

    CONSTRAINT "Assembly_pkey" PRIMARY KEY ("assemblyId")
);

-- CreateTable
CREATE TABLE "Material" (
    "materialId" TEXT NOT NULL,
    "assemblyId" TEXT,
    "name" TEXT NOT NULL,
    "wbsElementId" INTEGER NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "status" "Material_Status" NOT NULL,
    "materialTypeId" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "manufacturerPartNumber" TEXT NOT NULL,
    "pdmFileName" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitId" TEXT,
    "price" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("materialId")
);

-- CreateTable
CREATE TABLE "Material_Type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" INTEGER NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Material_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" INTEGER NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team_Type" (
    "teamTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Team_Type_pkey" PRIMARY KEY ("teamTypeId")
);

-- CreateTable
CREATE TABLE "Design_Review" (
    "designReviewId" TEXT NOT NULL,
    "dateScheduled" DATE NOT NULL,
    "meetingTimes" INTEGER[],
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCreatedId" INTEGER NOT NULL,
    "status" "Design_Review_Status" NOT NULL,
    "teamTypeId" TEXT NOT NULL,
    "location" TEXT,
    "isOnline" BOOLEAN NOT NULL,
    "isInPerson" BOOLEAN NOT NULL,
    "zoomLink" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,
    "docTemplateLink" TEXT,
    "wbsElementId" INTEGER NOT NULL,

    CONSTRAINT "Design_Review_pkey" PRIMARY KEY ("designReviewId")
);

-- CreateTable
CREATE TABLE "Schedule_Settings" (
    "drScheduleSettingsId" TEXT NOT NULL,
    "personalGmail" TEXT NOT NULL,
    "personalZoomLink" TEXT NOT NULL,
    "availability" INTEGER[],
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Schedule_Settings_pkey" PRIMARY KEY ("drScheduleSettingsId")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meetingTimes" INTEGER[],
    "teamId" TEXT NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("meetingId")
);

-- CreateTable
CREATE TABLE "Wbs_Proposed_Changes" (
    "wbsProposedChangesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "WBS_Element_Status" NOT NULL,
    "leadId" INTEGER,
    "managerId" INTEGER,
    "changeRequestId" INTEGER NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Wbs_Proposed_Changes_pkey" PRIMARY KEY ("wbsProposedChangesId")
);

-- CreateTable
CREATE TABLE "Project_Proposed_Changes" (
    "projectProposedChangesId" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "rules" TEXT[],
    "wbsProposedChangesId" TEXT NOT NULL,
    "carId" TEXT,

    CONSTRAINT "Project_Proposed_Changes_pkey" PRIMARY KEY ("projectProposedChangesId")
);

-- CreateTable
CREATE TABLE "Work_Package_Proposed_Changes" (
    "workPackageProposedChangesId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "duration" INTEGER NOT NULL,
    "stage" "Work_Package_Stage",
    "wbsProposedChangesId" TEXT NOT NULL,

    CONSTRAINT "Work_Package_Proposed_Changes_pkey" PRIMARY KEY ("workPackageProposedChangesId")
);

-- CreateTable
CREATE TABLE "Work_Package_Template" (
    "workPackageTemplateId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateNotes" TEXT NOT NULL,
    "workPackageName" TEXT,
    "stage" "Work_Package_Stage",
    "duration" INTEGER,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Work_Package_Template_pkey" PRIMARY KEY ("workPackageTemplateId")
);

-- CreateTable
CREATE TABLE "Car" (
    "carId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wbsElementId" INTEGER NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("carId")
);

-- CreateTable
CREATE TABLE "Organization" (
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCreatedId" INTEGER NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "_teamsAsMember" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_teamsAsLead" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_requestedChangeRequestReviewers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_blockedBy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_proposedBlockedBy" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_assignedBy" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_favoritedBy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_assignedTo" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_requiredAttendee" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_optionalAttendee" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_confirmedAttendee" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_deniedAttendee" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_userAttended" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_proposedProjectTeams" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_blocking" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_organizationMembers" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleAuthId_key" ON "User"("googleAuthId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailId_key" ON "User"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_userId_organizationId_key" ON "Role"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_Settings_userId_key" ON "User_Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope_CR_changeRequestId_key" ON "Scope_CR"("changeRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_Gate_CR_changeRequestId_key" ON "Stage_Gate_CR"("changeRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Activation_CR_changeRequestId_key" ON "Activation_CR"("changeRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "WBS_Element_carNumber_projectNumber_workPackageNumber_organ_key" ON "WBS_Element"("carNumber", "projectNumber", "workPackageNumber", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_wbsElementId_key" ON "Project"("wbsElementId");

-- CreateIndex
CREATE UNIQUE INDEX "Work_Package_wbsElementId_key" ON "Work_Package"("wbsElementId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_Type_name_organizationId_key" ON "Link_Type"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Description_Bullet_Type_name_organizationId_key" ON "Description_Bullet_Type"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_googleFileId_key" ON "Receipt"("googleFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Request_identifier_key" ON "Reimbursement_Request"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Request_saboId_key" ON "Reimbursement_Request"("saboId");

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Product_reimbursementProductReasonId_key" ON "Reimbursement_Product"("reimbursementProductReasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_organizationId_key" ON "Vendor"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_Code_name_organizationId_key" ON "Account_Code"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_Secure_Settings_nuid_key" ON "User_Secure_Settings"("nuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_Secure_Settings_userId_key" ON "User_Secure_Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_Secure_Settings_phoneNumber_key" ON "User_Secure_Settings"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_organizationId_key" ON "Unit"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Material_Type_name_organizationId_key" ON "Material_Type"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_organizationId_key" ON "Manufacturer"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_Type_name_organizationId_key" ON "Team_Type"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_Settings_userId_key" ON "Schedule_Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wbs_Proposed_Changes_changeRequestId_key" ON "Wbs_Proposed_Changes"("changeRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_Proposed_Changes_wbsProposedChangesId_key" ON "Project_Proposed_Changes"("wbsProposedChangesId");

-- CreateIndex
CREATE UNIQUE INDEX "Work_Package_Proposed_Changes_wbsProposedChangesId_key" ON "Work_Package_Proposed_Changes"("wbsProposedChangesId");

-- CreateIndex
CREATE UNIQUE INDEX "Car_wbsElementId_key" ON "Car"("wbsElementId");

-- CreateIndex
CREATE UNIQUE INDEX "_teamsAsMember_AB_unique" ON "_teamsAsMember"("A", "B");

-- CreateIndex
CREATE INDEX "_teamsAsMember_B_index" ON "_teamsAsMember"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_teamsAsLead_AB_unique" ON "_teamsAsLead"("A", "B");

-- CreateIndex
CREATE INDEX "_teamsAsLead_B_index" ON "_teamsAsLead"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_requestedChangeRequestReviewers_AB_unique" ON "_requestedChangeRequestReviewers"("A", "B");

-- CreateIndex
CREATE INDEX "_requestedChangeRequestReviewers_B_index" ON "_requestedChangeRequestReviewers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_blockedBy_AB_unique" ON "_blockedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_blockedBy_B_index" ON "_blockedBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposedBlockedBy_AB_unique" ON "_proposedBlockedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_proposedBlockedBy_B_index" ON "_proposedBlockedBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_assignedBy_AB_unique" ON "_assignedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_assignedBy_B_index" ON "_assignedBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_favoritedBy_AB_unique" ON "_favoritedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_favoritedBy_B_index" ON "_favoritedBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_assignedTo_AB_unique" ON "_assignedTo"("A", "B");

-- CreateIndex
CREATE INDEX "_assignedTo_B_index" ON "_assignedTo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_requiredAttendee_AB_unique" ON "_requiredAttendee"("A", "B");

-- CreateIndex
CREATE INDEX "_requiredAttendee_B_index" ON "_requiredAttendee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_optionalAttendee_AB_unique" ON "_optionalAttendee"("A", "B");

-- CreateIndex
CREATE INDEX "_optionalAttendee_B_index" ON "_optionalAttendee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_confirmedAttendee_AB_unique" ON "_confirmedAttendee"("A", "B");

-- CreateIndex
CREATE INDEX "_confirmedAttendee_B_index" ON "_confirmedAttendee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_deniedAttendee_AB_unique" ON "_deniedAttendee"("A", "B");

-- CreateIndex
CREATE INDEX "_deniedAttendee_B_index" ON "_deniedAttendee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_userAttended_AB_unique" ON "_userAttended"("A", "B");

-- CreateIndex
CREATE INDEX "_userAttended_B_index" ON "_userAttended"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposedProjectTeams_AB_unique" ON "_proposedProjectTeams"("A", "B");

-- CreateIndex
CREATE INDEX "_proposedProjectTeams_B_index" ON "_proposedProjectTeams"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_blocking_AB_unique" ON "_blocking"("A", "B");

-- CreateIndex
CREATE INDEX "_blocking_B_index" ON "_blocking"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_organizationMembers_AB_unique" ON "_organizationMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_organizationMembers_B_index" ON "_organizationMembers"("B");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_userArchivedId_fkey" FOREIGN KEY ("userArchivedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "Team_Type"("teamTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Settings" ADD CONSTRAINT "User_Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change_Request" ADD CONSTRAINT "Change_Request_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change_Request" ADD CONSTRAINT "Change_Request_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change_Request" ADD CONSTRAINT "Change_Request_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change_Request" ADD CONSTRAINT "Change_Request_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message_Info" ADD CONSTRAINT "Message_Info_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message_Info" ADD CONSTRAINT "Message_Info_designReviewId_fkey" FOREIGN KEY ("designReviewId") REFERENCES "Design_Review"("designReviewId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope_CR" ADD CONSTRAINT "Scope_CR_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposed_Solution" ADD CONSTRAINT "Proposed_Solution_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Scope_CR"("scopeCrId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposed_Solution" ADD CONSTRAINT "Proposed_Solution_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope_CR_Why" ADD CONSTRAINT "Scope_CR_Why_scopeCrId_fkey" FOREIGN KEY ("scopeCrId") REFERENCES "Scope_CR"("scopeCrId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage_Gate_CR" ADD CONSTRAINT "Stage_Gate_CR_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation_CR" ADD CONSTRAINT "Activation_CR_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation_CR" ADD CONSTRAINT "Activation_CR_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation_CR" ADD CONSTRAINT "Activation_CR_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_implementerId_fkey" FOREIGN KEY ("implementerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element" ADD CONSTRAINT "WBS_Element_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element" ADD CONSTRAINT "WBS_Element_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element" ADD CONSTRAINT "WBS_Element_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element" ADD CONSTRAINT "WBS_Element_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("carId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package" ADD CONSTRAINT "Work_Package_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package" ADD CONSTRAINT "Work_Package_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link_Type" ADD CONSTRAINT "Link_Type_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link_Type" ADD CONSTRAINT "Link_Type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_linkTypeId_fkey" FOREIGN KEY ("linkTypeId") REFERENCES "Link_Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_wbsProposedChangesId_fkey" FOREIGN KEY ("wbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet_Type" ADD CONSTRAINT "Description_Bullet_Type_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet_Type" ADD CONSTRAINT "Description_Bullet_Type_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet_Type" ADD CONSTRAINT "Description_Bullet_Type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_userCheckedId_fkey" FOREIGN KEY ("userCheckedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_descriptionBulletTypeId_fkey" FOREIGN KEY ("descriptionBulletTypeId") REFERENCES "Description_Bullet_Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_proposedChangeId_fkey" FOREIGN KEY ("proposedChangeId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_workPackageTemplateId_fkey" FOREIGN KEY ("workPackageTemplateId") REFERENCES "Work_Package_Template"("workPackageTemplateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Status" ADD CONSTRAINT "Reimbursement_Status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Status" ADD CONSTRAINT "Reimbursement_Status_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("vendorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Request" ADD CONSTRAINT "Reimbursement_Request_accountCodeId_fkey" FOREIGN KEY ("accountCodeId") REFERENCES "Account_Code"("accountCodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product_Reason" ADD CONSTRAINT "Reimbursement_Product_Reason_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product" ADD CONSTRAINT "Reimbursement_Product_reimbursementProductReasonId_fkey" FOREIGN KEY ("reimbursementProductReasonId") REFERENCES "Reimbursement_Product_Reason"("reimbursementProductReasonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement_Product" ADD CONSTRAINT "Reimbursement_Product_reimbursementRequestId_fkey" FOREIGN KEY ("reimbursementRequestId") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account_Code" ADD CONSTRAINT "Account_Code_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_userSubmittedId_fkey" FOREIGN KEY ("userSubmittedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Secure_Settings" ADD CONSTRAINT "User_Secure_Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assembly" ADD CONSTRAINT "Assembly_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assembly" ADD CONSTRAINT "Assembly_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assembly" ADD CONSTRAINT "Assembly_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "Assembly"("assemblyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_materialTypeId_fkey" FOREIGN KEY ("materialTypeId") REFERENCES "Material_Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material_Type" ADD CONSTRAINT "Material_Type_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material_Type" ADD CONSTRAINT "Material_Type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team_Type" ADD CONSTRAINT "Team_Type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "Team_Type"("teamTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design_Review" ADD CONSTRAINT "Design_Review_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Settings" ADD CONSTRAINT "Schedule_Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("teamId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Scope_CR"("scopeCrId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Proposed_Changes" ADD CONSTRAINT "Project_Proposed_Changes_wbsProposedChangesId_fkey" FOREIGN KEY ("wbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Proposed_Changes" ADD CONSTRAINT "Project_Proposed_Changes_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("carId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Proposed_Changes" ADD CONSTRAINT "Work_Package_Proposed_Changes_wbsProposedChangesId_fkey" FOREIGN KEY ("wbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamsAsMember" ADD CONSTRAINT "_teamsAsMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamsAsMember" ADD CONSTRAINT "_teamsAsMember_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamsAsLead" ADD CONSTRAINT "_teamsAsLead_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamsAsLead" ADD CONSTRAINT "_teamsAsLead_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requestedChangeRequestReviewers" ADD CONSTRAINT "_requestedChangeRequestReviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Change_Request"("crId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requestedChangeRequestReviewers" ADD CONSTRAINT "_requestedChangeRequestReviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockedBy" ADD CONSTRAINT "_blockedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "WBS_Element"("wbsElementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockedBy" ADD CONSTRAINT "_blockedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package"("workPackageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedBlockedBy" ADD CONSTRAINT "_proposedBlockedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "WBS_Element"("wbsElementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedBlockedBy" ADD CONSTRAINT "_proposedBlockedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package_Proposed_Changes"("workPackageProposedChangesId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignedBy" ADD CONSTRAINT "_assignedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignedBy" ADD CONSTRAINT "_assignedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favoritedBy" ADD CONSTRAINT "_favoritedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favoritedBy" ADD CONSTRAINT "_favoritedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignedTo" ADD CONSTRAINT "_assignedTo_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignedTo" ADD CONSTRAINT "_assignedTo_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiredAttendee" ADD CONSTRAINT "_requiredAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requiredAttendee" ADD CONSTRAINT "_requiredAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionalAttendee" ADD CONSTRAINT "_optionalAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_optionalAttendee" ADD CONSTRAINT "_optionalAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_confirmedAttendee" ADD CONSTRAINT "_confirmedAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_confirmedAttendee" ADD CONSTRAINT "_confirmedAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deniedAttendee" ADD CONSTRAINT "_deniedAttendee_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deniedAttendee" ADD CONSTRAINT "_deniedAttendee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userAttended" ADD CONSTRAINT "_userAttended_A_fkey" FOREIGN KEY ("A") REFERENCES "Design_Review"("designReviewId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userAttended" ADD CONSTRAINT "_userAttended_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedProjectTeams" ADD CONSTRAINT "_proposedProjectTeams_A_fkey" FOREIGN KEY ("A") REFERENCES "Project_Proposed_Changes"("projectProposedChangesId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedProjectTeams" ADD CONSTRAINT "_proposedProjectTeams_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocking" ADD CONSTRAINT "_blocking_A_fkey" FOREIGN KEY ("A") REFERENCES "Work_Package_Template"("workPackageTemplateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocking" ADD CONSTRAINT "_blocking_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package_Template"("workPackageTemplateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organizationMembers" ADD CONSTRAINT "_organizationMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("organizationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organizationMembers" ADD CONSTRAINT "_organizationMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
