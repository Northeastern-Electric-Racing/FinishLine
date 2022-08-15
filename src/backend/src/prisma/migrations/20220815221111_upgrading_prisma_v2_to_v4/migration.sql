-- DropForeignKey
ALTER TABLE "Activation_CR" DROP CONSTRAINT "Activation_CR_changeRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Activation_CR" DROP CONSTRAINT "Activation_CR_projectLeadId_fkey";

-- DropForeignKey
ALTER TABLE "Activation_CR" DROP CONSTRAINT "Activation_CR_projectManagerId_fkey";

-- DropForeignKey
ALTER TABLE "Change" DROP CONSTRAINT "Change_changeRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Change" DROP CONSTRAINT "Change_implementerId_fkey";

-- DropForeignKey
ALTER TABLE "Change" DROP CONSTRAINT "Change_wbsElementId_fkey";

-- DropForeignKey
ALTER TABLE "Change_Request" DROP CONSTRAINT "Change_Request_submitterId_fkey";

-- DropForeignKey
ALTER TABLE "Change_Request" DROP CONSTRAINT "Change_Request_wbsElementId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_wbsElementId_fkey";

-- DropForeignKey
ALTER TABLE "Risk" DROP CONSTRAINT "Risk_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Risk" DROP CONSTRAINT "Risk_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Scope_CR" DROP CONSTRAINT "Scope_CR_changeRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Scope_CR_Why" DROP CONSTRAINT "Scope_CR_Why_scopeCrId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Stage_Gate_CR" DROP CONSTRAINT "Stage_Gate_CR_changeRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "User_Settings" DROP CONSTRAINT "User_Settings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Work_Package" DROP CONSTRAINT "Work_Package_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Work_Package" DROP CONSTRAINT "Work_Package_wbsElementId_fkey";

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Settings" ADD CONSTRAINT "User_Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change_Request" ADD CONSTRAINT "Change_Request_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change_Request" ADD CONSTRAINT "Change_Request_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope_CR" ADD CONSTRAINT "Scope_CR_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope_CR_Why" ADD CONSTRAINT "Scope_CR_Why_scopeCrId_fkey" FOREIGN KEY ("scopeCrId") REFERENCES "Scope_CR"("scopeCrId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage_Gate_CR" ADD CONSTRAINT "Stage_Gate_CR_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation_CR" ADD CONSTRAINT "Activation_CR_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation_CR" ADD CONSTRAINT "Activation_CR_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activation_CR" ADD CONSTRAINT "Activation_CR_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_implementerId_fkey" FOREIGN KEY ("implementerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package" ADD CONSTRAINT "Work_Package_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package" ADD CONSTRAINT "Work_Package_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Activation_CR.changeRequestId_unique" RENAME TO "Activation_CR_changeRequestId_key";

-- RenameIndex
ALTER INDEX "Project.wbsElementId_unique" RENAME TO "Project_wbsElementId_key";

-- RenameIndex
ALTER INDEX "Scope_CR.changeRequestId_unique" RENAME TO "Scope_CR_changeRequestId_key";

-- RenameIndex
ALTER INDEX "Stage_Gate_CR.changeRequestId_unique" RENAME TO "Stage_Gate_CR_changeRequestId_key";

-- RenameIndex
ALTER INDEX "Team.leaderId_unique" RENAME TO "Team_leaderId_key";

-- RenameIndex
ALTER INDEX "User.emailId_unique" RENAME TO "User_emailId_key";

-- RenameIndex
ALTER INDEX "User.email_unique" RENAME TO "User_email_key";

-- RenameIndex
ALTER INDEX "User.googleAuthId_unique" RENAME TO "User_googleAuthId_key";

-- RenameIndex
ALTER INDEX "User_Settings.userId_unique" RENAME TO "User_Settings_userId_key";

-- RenameIndex
ALTER INDEX "wbsNumber" RENAME TO "WBS_Element_carNumber_projectNumber_workPackageNumber_key";

-- RenameIndex
ALTER INDEX "Work_Package.wbsElementId_unique" RENAME TO "Work_Package_wbsElementId_key";
