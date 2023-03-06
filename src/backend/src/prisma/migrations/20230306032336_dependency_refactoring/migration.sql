/*
  Warnings:

  - You are about to drop the `_dependencies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_dependencies" DROP CONSTRAINT "_dependencies_A_fkey";

-- DropForeignKey
ALTER TABLE "_dependencies" DROP CONSTRAINT "_dependencies_B_fkey";

-- DropTable
DROP TABLE "_dependencies";

-- CreateTable
CREATE TABLE "_blockedBy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_blockedBy_AB_unique" ON "_blockedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_blockedBy_B_index" ON "_blockedBy"("B");

-- AddForeignKey
ALTER TABLE "_blockedBy" ADD CONSTRAINT "_blockedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "WBS_Element"("wbsElementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blockedBy" ADD CONSTRAINT "_blockedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package"("workPackageId") ON DELETE CASCADE ON UPDATE CASCADE;
