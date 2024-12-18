/*
  Warnings:

  - You are about to drop the column `contacts` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "contacts";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "completedOnboarding" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Checklist" (
    "checklistId" TEXT NOT NULL,
    "teamTypeId" TEXT,
    "teamId" TEXT,
    "name" TEXT NOT NULL,
    "descriptions" TEXT[],
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "parentChecklistId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("checklistId")
);

-- CreateTable
CREATE TABLE "Contact" (
    "contactId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "_checkedChecklists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_organizationId_userId_title_key" ON "Contact"("organizationId", "userId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "_checkedChecklists_AB_unique" ON "_checkedChecklists"("A", "B");

-- CreateIndex
CREATE INDEX "_checkedChecklists_B_index" ON "_checkedChecklists"("B");

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_teamTypeId_fkey" FOREIGN KEY ("teamTypeId") REFERENCES "Team_Type"("teamTypeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("teamId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_parentChecklistId_fkey" FOREIGN KEY ("parentChecklistId") REFERENCES "Checklist"("checklistId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_checkedChecklists" ADD CONSTRAINT "_checkedChecklists_A_fkey" FOREIGN KEY ("A") REFERENCES "Checklist"("checklistId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_checkedChecklists" ADD CONSTRAINT "_checkedChecklists_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
