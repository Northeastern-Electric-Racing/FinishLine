-- CreateTable
CREATE TABLE "Work_Package_Template" (
    "workPackageTemplateId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateNotes" TEXT NOT NULL,
    "workPackageName" TEXT,
    "stage" "Work_Package_Stage",
    "duration" INTEGER,
    "expectedActivities" TEXT[],
    "deliverables" TEXT[],
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCreatedId" INTEGER NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,

    CONSTRAINT "Work_Package_Template_pkey" PRIMARY KEY ("workPackageTemplateId")
);

-- CreateTable
CREATE TABLE "_blockedByRelation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_blockedByRelation_AB_unique" ON "_blockedByRelation"("A", "B");

-- CreateIndex
CREATE INDEX "_blockedByRelation_B_index" ON "_blockedByRelation"("B");

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockedByRelation" ADD CONSTRAINT "_blockedByRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "Work_Package_Template"("workPackageTemplateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockedByRelation" ADD CONSTRAINT "_blockedByRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package_Template"("workPackageTemplateId") ON DELETE CASCADE ON UPDATE CASCADE;
