-- CreateEnum
CREATE TYPE "public"."Rule_Completion" AS ENUM ('REVIEW', 'INCOMPLETE', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."Ruleset_Type" (
    "rulesetTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "deletedByUserId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Ruleset_Type_pkey" PRIMARY KEY ("rulesetTypeId")
);

-- CreateTable
CREATE TABLE "public"."Ruleset" (
    "rulesetId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "rulesetTypeId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "deletedByUserId" TEXT,

    CONSTRAINT "Ruleset_pkey" PRIMARY KEY ("rulesetId")
);

-- CreateTable
CREATE TABLE "public"."Rule" (
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
CREATE TABLE "public"."Rule_Status_Change" (
    "historyId" TEXT NOT NULL,
    "projectRuleId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "deletedByUserId" TEXT,
    "newStatus" "public"."Rule_Completion" NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "Rule_Status_Change_pkey" PRIMARY KEY ("historyId")
);

-- CreateTable
CREATE TABLE "public"."Project_Rule" (
    "projectRuleId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "currentStatus" "public"."Rule_Completion" NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "deletedByUserId" TEXT,

    CONSTRAINT "Project_Rule_pkey" PRIMARY KEY ("projectRuleId")
);

-- CreateTable
CREATE TABLE "public"."_ruleReferences" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ruleReferences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_teamRules" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_teamRules_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Ruleset_Type_organizationId_idx" ON "public"."Ruleset_Type"("organizationId");

-- CreateIndex
CREATE INDEX "Rule_parentRuleId_rulesetId_ruleCode_idx" ON "public"."Rule"("parentRuleId", "rulesetId", "ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_rulesetId_ruleCode_key" ON "public"."Rule"("rulesetId", "ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX "Project_Rule_ruleId_projectId_key" ON "public"."Project_Rule"("ruleId", "projectId");

-- CreateIndex
CREATE INDEX "_ruleReferences_B_index" ON "public"."_ruleReferences"("B");

-- CreateIndex
CREATE INDEX "_teamRules_B_index" ON "public"."_teamRules"("B");

-- AddForeignKey
ALTER TABLE "public"."Ruleset_Type" ADD CONSTRAINT "Ruleset_Type_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ruleset_Type" ADD CONSTRAINT "Ruleset_Type_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ruleset_Type" ADD CONSTRAINT "Ruleset_Type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ruleset" ADD CONSTRAINT "Ruleset_rulesetTypeId_fkey" FOREIGN KEY ("rulesetTypeId") REFERENCES "public"."Ruleset_Type"("rulesetTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ruleset" ADD CONSTRAINT "Ruleset_carId_fkey" FOREIGN KEY ("carId") REFERENCES "public"."Car"("carId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ruleset" ADD CONSTRAINT "Ruleset_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ruleset" ADD CONSTRAINT "Ruleset_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rule" ADD CONSTRAINT "Rule_rulesetId_fkey" FOREIGN KEY ("rulesetId") REFERENCES "public"."Ruleset"("rulesetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rule" ADD CONSTRAINT "Rule_parentRuleId_fkey" FOREIGN KEY ("parentRuleId") REFERENCES "public"."Rule"("ruleId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rule" ADD CONSTRAINT "Rule_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rule" ADD CONSTRAINT "Rule_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rule" ADD CONSTRAINT "Rule_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rule_Status_Change" ADD CONSTRAINT "Rule_Status_Change_projectRuleId_fkey" FOREIGN KEY ("projectRuleId") REFERENCES "public"."Project_Rule"("projectRuleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rule_Status_Change" ADD CONSTRAINT "Rule_Status_Change_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rule_Status_Change" ADD CONSTRAINT "Rule_Status_Change_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project_Rule" ADD CONSTRAINT "Project_Rule_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."Rule"("ruleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project_Rule" ADD CONSTRAINT "Project_Rule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project_Rule" ADD CONSTRAINT "Project_Rule_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project_Rule" ADD CONSTRAINT "Project_Rule_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ruleReferences" ADD CONSTRAINT "_ruleReferences_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Rule"("ruleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ruleReferences" ADD CONSTRAINT "_ruleReferences_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Rule"("ruleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_teamRules" ADD CONSTRAINT "_teamRules_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Rule"("ruleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_teamRules" ADD CONSTRAINT "_teamRules_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;
