

-- CreateTable
CREATE TABLE "_assignedBy" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_assignedBy_AB_unique" ON "_assignedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_assignedBy_B_index" ON "_assignedBy"("B");

-- AddForeignKey
ALTER TABLE "_assignedBy" ADD CONSTRAINT "_assignedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignedBy" ADD CONSTRAINT "_assignedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_assignedBy" ("A", "B") SELECT "projectId", "teamId" FROM "Project" WHERE "teamId" IS NOT NULL;

/*
  Warnings:

  - You are about to drop the column `teamId` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_teamId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "teamId";