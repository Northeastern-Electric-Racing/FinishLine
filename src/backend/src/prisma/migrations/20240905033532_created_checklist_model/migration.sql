-- CreateTable
CREATE TABLE "Checklist" (
    "checklistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtasks" TEXT[],
    "description" TEXT NOT NULL,
    "teamTypeId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("checklistId")
);

-- CreateTable
CREATE TABLE "_checklistUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_checklistUsers_AB_unique" ON "_checklistUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_checklistUsers_B_index" ON "_checklistUsers"("B");

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "Team_Type"("teamTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_checklistUsers" ADD CONSTRAINT "_checklistUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Checklist"("checklistId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_checklistUsers" ADD CONSTRAINT "_checklistUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
