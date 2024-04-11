-- DropForeignKey
ALTER TABLE "_blockedBy" DROP CONSTRAINT "_blockedBy_B_fkey";

-- AlterTable
ALTER TABLE "Change_Request" ADD COLUMN     "wbsProposedChangesId" TEXT;

-- AlterTable
ALTER TABLE "Description_Bullet" ADD COLUMN     "projectProposedChangesFeaturesId" TEXT,
ADD COLUMN     "projectProposedChangesGoalsId" TEXT,
ADD COLUMN     "projectProposedChangesOtherConstraintsId" TEXT,
ADD COLUMN     "wpProposedChangesDeliverablesId" TEXT,
ADD COLUMN     "wpProposedChangesExpectedActivitiesId" TEXT;

-- AlterTable
ALTER TABLE "_blockedBy" ALTER COLUMN "B" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "LinkInfo" (
    "linkInfoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "linkTypeName" TEXT NOT NULL,
    "proposedWbsChangeId" TEXT,

    CONSTRAINT "LinkInfo_pkey" PRIMARY KEY ("linkInfoId")
);

-- CreateTable
CREATE TABLE "Wbs_Proposed_Changes" (
    "wbsProposedChangesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "WBS_Element_Status" NOT NULL,
    "projectLeadId" INTEGER,
    "projectManagerId" INTEGER,
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
    "newProject" BOOLEAN NOT NULL,

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
CREATE UNIQUE INDEX "_proposedProjectTeams_AB_unique" ON "_proposedProjectTeams"("A", "B");

-- CreateIndex
CREATE INDEX "_proposedProjectTeams_B_index" ON "_proposedProjectTeams"("B");

-- AddForeignKey
ALTER TABLE "LinkInfo" ADD CONSTRAINT "LinkInfo_linkTypeName_fkey" FOREIGN KEY ("linkTypeName") REFERENCES "LinkType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkInfo" ADD CONSTRAINT "LinkInfo_proposedWbsChangeId_fkey" FOREIGN KEY ("proposedWbsChangeId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wbs_Proposed_Changes" ADD CONSTRAINT "Wbs_Proposed_Changes_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Proposed_Changes" ADD CONSTRAINT "Project_Proposed_Changes_wbsProposedChangesId_fkey" FOREIGN KEY ("wbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Proposed_Changes" ADD CONSTRAINT "Work_Package_Proposed_Changes_wbsProposedChangesId_fkey" FOREIGN KEY ("wbsProposedChangesId") REFERENCES "Wbs_Proposed_Changes"("wbsProposedChangesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockedBy" ADD CONSTRAINT "_blockedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package_Proposed_Changes"("workPackageProposedChangesId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedProjectTeams" ADD CONSTRAINT "_proposedProjectTeams_A_fkey" FOREIGN KEY ("A") REFERENCES "Project_Proposed_Changes"("projectProposedChangesId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_proposedProjectTeams" ADD CONSTRAINT "_proposedProjectTeams_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;
