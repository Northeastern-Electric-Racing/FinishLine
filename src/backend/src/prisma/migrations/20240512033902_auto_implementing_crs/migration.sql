-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_wbsElementId_fkey";

-- AlterTable
ALTER TABLE "Description_Bullet" ADD COLUMN     "projectProposedChangesFeaturesId" TEXT,
ADD COLUMN     "projectProposedChangesGoalsId" TEXT,
ADD COLUMN     "projectProposedChangesOtherConstraintsId" TEXT,
ADD COLUMN     "wpProposedChangesDeliverablesId" TEXT,
ADD COLUMN     "wpProposedChangesExpectedActivitiesId" TEXT;

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "wbs_Proposed_ChangesWbsProposedChangesId" TEXT,
ALTER COLUMN "wbsElementId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Scope_CR" ADD COLUMN     "wbsProposedChangesId" TEXT;

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
    "carNumber" INTEGER,

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
CREATE TABLE "_proposedBlockedBy" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_proposedProjectTeams" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Wbs_Proposed_Changes_changeRequestId_key" ON "Wbs_Proposed_Changes"("changeRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_Proposed_Changes_wbsProposedChangesId_key" ON "Project_Proposed_Changes"("wbsProposedChangesId");

-- CreateIndex
CREATE UNIQUE INDEX "Work_Package_Proposed_Changes_wbsProposedChangesId_key" ON "Work_Package_Proposed_Changes"("wbsProposedChangesId");

-- CreateIndex
CREATE UNIQUE INDEX "_proposedBlockedBy_AB_unique" ON "_proposedBlockedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_proposedBlockedBy_B_index" ON "_proposedBlockedBy"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_proposedProjectTeams_AB_unique" ON "_proposedProjectTeams"("A", "B");

-- CreateIndex
CREATE INDEX "_proposedProjectTeams_B_index" ON "_proposedProjectTeams"("B");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_wbs_Proposed_ChangesWbsProposedChangesId_fkey" FOREIGN KEY ("wbs_Proposed_ChangesWbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_projectProposedChangesGoalsId_fkey" FOREIGN KEY ("projectProposedChangesGoalsId") REFERENCES "Project_Proposed_Changes"("projectProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_projectProposedChangesFeaturesId_fkey" FOREIGN KEY ("projectProposedChangesFeaturesId") REFERENCES "Project_Proposed_Changes"("projectProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_projectProposedChangesOtherConstraintsI_fkey" FOREIGN KEY ("projectProposedChangesOtherConstraintsId") REFERENCES "Project_Proposed_Changes"("projectProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_wpProposedChangesExpectedActivitiesId_fkey" FOREIGN KEY ("wpProposedChangesExpectedActivitiesId") REFERENCES "Work_Package_Proposed_Changes"("workPackageProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_wpProposedChangesDeliverablesId_fkey" FOREIGN KEY ("wpProposedChangesDeliverablesId") REFERENCES "Work_Package_Proposed_Changes"("workPackageProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Scope_CR"("scopeCrId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Proposed_Changes" ADD CONSTRAINT "Project_Proposed_Changes_wbsProposedChangesId_fkey" FOREIGN KEY ("wbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Proposed_Changes" ADD CONSTRAINT "Work_Package_Proposed_Changes_wbsProposedChangesId_fkey" FOREIGN KEY ("wbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedBlockedBy" ADD CONSTRAINT "_proposedBlockedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "WBS_Element"("wbsElementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedBlockedBy" ADD CONSTRAINT "_proposedBlockedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package_Proposed_Changes"("workPackageProposedChangesId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedProjectTeams" ADD CONSTRAINT "_proposedProjectTeams_A_fkey" FOREIGN KEY ("A") REFERENCES "Project_Proposed_Changes"("projectProposedChangesId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedProjectTeams" ADD CONSTRAINT "_proposedProjectTeams_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;
