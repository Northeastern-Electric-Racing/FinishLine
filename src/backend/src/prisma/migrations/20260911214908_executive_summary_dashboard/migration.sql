-- CreateEnum
CREATE TYPE "Term" AS ENUM ('FALL', 'SPRING');

-- CreateEnum
CREATE TYPE "Data_Source" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "Competition" AS ENUM ('FSAE', 'FHE');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "operationsTeam" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Work_Package" ADD COLUMN     "actualEndDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Executive_Summary" (
    "executiveSummaryId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "seasonName" TEXT NOT NULL,
    "seasonStartDate" TIMESTAMP(3) NOT NULL,
    "seasonEndDate" TIMESTAMP(3) NOT NULL,
    "goals" TEXT NOT NULL DEFAULT '',
    "winsAndImprovements" TEXT NOT NULL DEFAULT '',
    "budgetNotes" TEXT NOT NULL DEFAULT '',
    "recruitmentNotes" TEXT NOT NULL DEFAULT '',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCreatedId" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "deletedByUserId" TEXT,

    CONSTRAINT "Executive_Summary_pkey" PRIMARY KEY ("executiveSummaryId")
);

-- CreateTable
CREATE TABLE "Competition_Performance" (
    "competitionPerformanceId" TEXT NOT NULL,
    "executiveSummaryId" TEXT NOT NULL,
    "competition" "Competition" NOT NULL,
    "finalPlace" INTEGER,
    "totalPointsEarned" INTEGER,
    "bestStaticEvent" TEXT,
    "worstStaticEvent" TEXT,
    "bestDynamicEvent" TEXT,
    "worstDynamicEvent" TEXT,
    "accelerationTopTimeSeconds" INTEGER,
    "autocrossTopTimeSeconds" INTEGER,
    "enduranceLapsCompleted" INTEGER,
    "enduranceAvgLapTimeSeconds" INTEGER,

    CONSTRAINT "Competition_Performance_pkey" PRIMARY KEY ("competitionPerformanceId")
);

-- CreateTable
CREATE TABLE "Competition_Documents_Summary" (
    "competitionDocumentsSummaryId" TEXT NOT NULL,
    "executiveSummaryId" TEXT NOT NULL,
    "submittedOnTimeCount" INTEGER NOT NULL,
    "firstSubmissionRejectedCount" INTEGER NOT NULL,
    "source" "Data_Source" NOT NULL DEFAULT 'MANUAL',
    "dateSynced" TIMESTAMP(3),

    CONSTRAINT "Competition_Documents_Summary_pkey" PRIMARY KEY ("competitionDocumentsSummaryId")
);

-- CreateTable
CREATE TABLE "Recruitment_Cycle" (
    "recruitmentCycleId" TEXT NOT NULL,
    "executiveSummaryId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "eventsHeld" INTEGER NOT NULL,
    "signUps" INTEGER NOT NULL,
    "onboarded" INTEGER NOT NULL,
    "activeMembers" INTEGER NOT NULL,

    CONSTRAINT "Recruitment_Cycle_pkey" PRIMARY KEY ("recruitmentCycleId")
);

-- CreateTable
CREATE TABLE "Recruitment_Division_Count" (
    "recruitmentDivisionCountId" TEXT NOT NULL,
    "recruitmentCycleId" TEXT NOT NULL,
    "teamTypeId" TEXT NOT NULL,
    "newMembers" INTEGER NOT NULL,
    "returningMembers" INTEGER NOT NULL,

    CONSTRAINT "Recruitment_Division_Count_pkey" PRIMARY KEY ("recruitmentDivisionCountId")
);

-- CreateIndex
CREATE INDEX "Executive_Summary_organizationId_idx" ON "Executive_Summary"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Executive_Summary_seasonName_organizationId_key" ON "Executive_Summary"("seasonName", "organizationId");

-- CreateIndex
CREATE INDEX "Competition_Performance_executiveSummaryId_idx" ON "Competition_Performance"("executiveSummaryId");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_Performance_executiveSummaryId_competition_key" ON "Competition_Performance"("executiveSummaryId", "competition");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_Documents_Summary_executiveSummaryId_key" ON "Competition_Documents_Summary"("executiveSummaryId");

-- CreateIndex
CREATE INDEX "Recruitment_Cycle_executiveSummaryId_idx" ON "Recruitment_Cycle"("executiveSummaryId");

-- CreateIndex
CREATE UNIQUE INDEX "Recruitment_Cycle_executiveSummaryId_term_key" ON "Recruitment_Cycle"("executiveSummaryId", "term");

-- CreateIndex
CREATE INDEX "Recruitment_Division_Count_recruitmentCycleId_idx" ON "Recruitment_Division_Count"("recruitmentCycleId");

-- CreateIndex
CREATE INDEX "Recruitment_Division_Count_teamTypeId_idx" ON "Recruitment_Division_Count"("teamTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Recruitment_Division_Count_recruitmentCycleId_teamTypeId_key" ON "Recruitment_Division_Count"("recruitmentCycleId", "teamTypeId");

-- AddForeignKey
ALTER TABLE "Executive_Summary" ADD CONSTRAINT "Executive_Summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Executive_Summary" ADD CONSTRAINT "Executive_Summary_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Executive_Summary" ADD CONSTRAINT "Executive_Summary_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition_Performance" ADD CONSTRAINT "Competition_Performance_executiveSummaryId_fkey" FOREIGN KEY ("executiveSummaryId") REFERENCES "Executive_Summary"("executiveSummaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition_Documents_Summary" ADD CONSTRAINT "Competition_Documents_Summary_executiveSummaryId_fkey" FOREIGN KEY ("executiveSummaryId") REFERENCES "Executive_Summary"("executiveSummaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Cycle" ADD CONSTRAINT "Recruitment_Cycle_executiveSummaryId_fkey" FOREIGN KEY ("executiveSummaryId") REFERENCES "Executive_Summary"("executiveSummaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Division_Count" ADD CONSTRAINT "Recruitment_Division_Count_recruitmentCycleId_fkey" FOREIGN KEY ("recruitmentCycleId") REFERENCES "Recruitment_Cycle"("recruitmentCycleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Division_Count" ADD CONSTRAINT "Recruitment_Division_Count_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "Team_Type"("teamTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;
