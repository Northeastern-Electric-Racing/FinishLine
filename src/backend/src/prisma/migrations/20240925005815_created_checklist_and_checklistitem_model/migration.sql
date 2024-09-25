-- CreateTable
CREATE TABLE "Checklist" (
    "checklistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teamTypeId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("checklistId")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "checklistItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentChecklistItemId" TEXT,
    "checklistId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("checklistItemId")
);

-- CreateTable
CREATE TABLE "_onboardingChecklists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_checkedChecklistItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_onboardingChecklists_AB_unique" ON "_onboardingChecklists"("A", "B");

-- CreateIndex
CREATE INDEX "_onboardingChecklists_B_index" ON "_onboardingChecklists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_checkedChecklistItems_AB_unique" ON "_checkedChecklistItems"("A", "B");

-- CreateIndex
CREATE INDEX "_checkedChecklistItems_B_index" ON "_checkedChecklistItems"("B");

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "Team_Type"("teamTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_parentChecklistItemId_fkey" FOREIGN KEY ("parentChecklistItemId") REFERENCES "ChecklistItem"("checklistItemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("checklistId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_onboardingChecklists" ADD CONSTRAINT "_onboardingChecklists_A_fkey" FOREIGN KEY ("A") REFERENCES "Checklist"("checklistId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_onboardingChecklists" ADD CONSTRAINT "_onboardingChecklists_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_checkedChecklistItems" ADD CONSTRAINT "_checkedChecklistItems_A_fkey" FOREIGN KEY ("A") REFERENCES "ChecklistItem"("checklistItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_checkedChecklistItems" ADD CONSTRAINT "_checkedChecklistItems_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
