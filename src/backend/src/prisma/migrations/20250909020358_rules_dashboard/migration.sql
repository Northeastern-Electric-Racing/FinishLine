-- CreateEnum
CREATE TYPE "Rule_Completion" AS ENUM ('REVIEW', 'INCOMPLETE', 'COMPLETED');

-- CreateTable
CREATE TABLE "Ruleset_Type" (
    "rulesetTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "deletedByUserId" TEXT,

    CONSTRAINT "Ruleset_Type_pkey" PRIMARY KEY ("rulesetTypeId")
);

-- CreateTable
CREATE TABLE "Ruleset" (
    "fileId" TEXT NOT NULL,
    "rulesetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL,
    "rulesetTypeId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "deletedByUserId" TEXT,

    CONSTRAINT "Ruleset_pkey" PRIMARY KEY ("rulesetId")
);

-- CreateTable
CREATE TABLE "Rule" (
    "ruleId" TEXT NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "ruleContent" TEXT NOT NULL,
    "imageFileIds" TEXT[],
    "rulesetId" TEXT NOT NULL,
    "parentRuleId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3),
    "dateDeleted" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "updatedByUserId" TEXT,
    "deletedByUserId" TEXT,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("ruleId")
);

-- CreateTable
CREATE TABLE "Rule_Status_Change" (
    "historyId" TEXT NOT NULL,
    "projectRuleId" TEXT NOT NULL,
    "userUpdatedId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newStatus" "Rule_Completion" NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "Rule_Status_Change_pkey" PRIMARY KEY ("historyId")
);

-- CreateTable
CREATE TABLE "Project_Rule" (
    "projectRuleId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "currentStatus" "Rule_Completion" NOT NULL,

    CONSTRAINT "Project_Rule_pkey" PRIMARY KEY ("projectRuleId")
);

-- CreateTable
CREATE TABLE "_ruleReferences" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ruleReferences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Rule_parentRuleId_rulesetId_ruleCode_idx" ON "Rule"("parentRuleId", "rulesetId", "ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_rulesetId_ruleCode_key" ON "Rule"("rulesetId", "ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX "Project_Rule_ruleId_projectId_key" ON "Project_Rule"("ruleId", "projectId");

-- CreateIndex
CREATE INDEX "_ruleReferences_B_index" ON "_ruleReferences"("B");

-- AddForeignKey
ALTER TABLE "Ruleset_Type" ADD CONSTRAINT "Ruleset_Type_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruleset_Type" ADD CONSTRAINT "Ruleset_Type_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruleset" ADD CONSTRAINT "Ruleset_rulesetTypeId_fkey" FOREIGN KEY ("rulesetTypeId") REFERENCES "Ruleset_Type"("rulesetTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruleset" ADD CONSTRAINT "Ruleset_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("carId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruleset" ADD CONSTRAINT "Ruleset_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruleset" ADD CONSTRAINT "Ruleset_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_rulesetId_fkey" FOREIGN KEY ("rulesetId") REFERENCES "Ruleset"("rulesetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_parentRuleId_fkey" FOREIGN KEY ("parentRuleId") REFERENCES "Rule"("ruleId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule_Status_Change" ADD CONSTRAINT "Rule_Status_Change_projectRuleId_fkey" FOREIGN KEY ("projectRuleId") REFERENCES "Project_Rule"("projectRuleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule_Status_Change" ADD CONSTRAINT "Rule_Status_Change_userUpdatedId_fkey" FOREIGN KEY ("userUpdatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Rule" ADD CONSTRAINT "Project_Rule_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("ruleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Rule" ADD CONSTRAINT "Project_Rule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ruleReferences" ADD CONSTRAINT "_ruleReferences_A_fkey" FOREIGN KEY ("A") REFERENCES "Rule"("ruleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ruleReferences" ADD CONSTRAINT "_ruleReferences_B_fkey" FOREIGN KEY ("B") REFERENCES "Rule"("ruleId") ON DELETE CASCADE ON UPDATE CASCADE;
