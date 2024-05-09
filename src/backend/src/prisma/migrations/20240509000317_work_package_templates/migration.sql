-- CreateTable
CREATE TABLE "Blocked_By_Info" (
    "blockedByInfoId" TEXT NOT NULL,
    "stage" "Work_Package_Stage",
    "name" TEXT NOT NULL,
    "workPackageTemplateId" TEXT NOT NULL,

    CONSTRAINT "Blocked_By_Info_pkey" PRIMARY KEY ("blockedByInfoId")
);

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

-- AddForeignKey
ALTER TABLE "Blocked_By_Info" ADD CONSTRAINT "Blocked_By_Info_workPackageTemplateId_fkey" FOREIGN KEY ("workPackageTemplateId") REFERENCES "Work_Package_Template"("workPackageTemplateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
