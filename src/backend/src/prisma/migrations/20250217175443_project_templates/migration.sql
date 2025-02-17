/*
  Warnings:

  - You are about to drop the column `workPackageTemplateId` on the `Description_Bullet` table. All the data in the column will be lost.
  - The primary key for the `Work_Package_Template` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateCreated` on the `Work_Package_Template` table. All the data in the column will be lost.
  - You are about to drop the column `dateDeleted` on the `Work_Package_Template` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Work_Package_Template` table. All the data in the column will be lost.
  - You are about to drop the column `templateName` on the `Work_Package_Template` table. All the data in the column will be lost.
  - You are about to drop the column `templateNotes` on the `Work_Package_Template` table. All the data in the column will be lost.
  - You are about to drop the column `userCreatedId` on the `Work_Package_Template` table. All the data in the column will be lost.
  - You are about to drop the column `userDeletedId` on the `Work_Package_Template` table. All the data in the column will be lost.
  - You are about to drop the column `workPackageName` on the `Work_Package_Template` table. All the data in the column will be lost.
  - You are about to drop the column `workPackageTemplateId` on the `Work_Package_Template` table. All the data in the column will be lost.
  - Added the required column `wbsElementTemplateId` to the `Work_Package_Template` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Description_Bullet" DROP CONSTRAINT "Description_Bullet_workPackageTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Work_Package_Template" DROP CONSTRAINT "Work_Package_Template_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Work_Package_Template" DROP CONSTRAINT "Work_Package_Template_userCreatedId_fkey";

-- DropForeignKey
ALTER TABLE "Work_Package_Template" DROP CONSTRAINT "Work_Package_Template_userDeletedId_fkey";

-- DropForeignKey
ALTER TABLE "_blocking" DROP CONSTRAINT "_blocking_A_fkey";

-- DropForeignKey
ALTER TABLE "_blocking" DROP CONSTRAINT "_blocking_B_fkey";

-- AlterTable
ALTER TABLE "Description_Bullet" DROP COLUMN "workPackageTemplateId",
ADD COLUMN     "wbsElementTemplateId" TEXT;

-- AlterTable
ALTER TABLE "Work_Package_Template" DROP CONSTRAINT "Work_Package_Template_pkey",
DROP COLUMN "dateCreated",
DROP COLUMN "dateDeleted",
DROP COLUMN "organizationId",
DROP COLUMN "templateName",
DROP COLUMN "templateNotes",
DROP COLUMN "userCreatedId",
DROP COLUMN "userDeletedId",
DROP COLUMN "workPackageName",
DROP COLUMN "workPackageTemplateId",
ADD COLUMN     "projectTemplateId" TEXT,
ADD COLUMN     "wbsElementTemplateId" TEXT NOT NULL,
ADD CONSTRAINT "Work_Package_Template_pkey" PRIMARY KEY ("wbsElementTemplateId");

-- CreateTable
CREATE TABLE "WBS_Element_Template" (
    "wbsElementTemplateId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateNotes" TEXT NOT NULL,
    "wbsElementName" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCreatedId" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "WBS_Element_Template_pkey" PRIMARY KEY ("wbsElementTemplateId")
);

-- CreateTable
CREATE TABLE "Project_Template" (
    "wbsElementTemplateId" TEXT NOT NULL,
    "budget" INTEGER,
    "summary" TEXT,

    CONSTRAINT "Project_Template_pkey" PRIMARY KEY ("wbsElementTemplateId")
);

-- CreateTable
CREATE TABLE "_Project_TemplateToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Project_TemplateToTeam_AB_unique" ON "_Project_TemplateToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_Project_TemplateToTeam_B_index" ON "_Project_TemplateToTeam"("B");

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_wbsElementTemplateId_fkey" FOREIGN KEY ("wbsElementTemplateId") REFERENCES "WBS_Element_Template"("wbsElementTemplateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element_Template" ADD CONSTRAINT "WBS_Element_Template_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element_Template" ADD CONSTRAINT "WBS_Element_Template_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element_Template" ADD CONSTRAINT "WBS_Element_Template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_Template" ADD CONSTRAINT "Project_Template_wbsElementTemplateId_fkey" FOREIGN KEY ("wbsElementTemplateId") REFERENCES "WBS_Element_Template"("wbsElementTemplateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_wbsElementTemplateId_fkey" FOREIGN KEY ("wbsElementTemplateId") REFERENCES "WBS_Element_Template"("wbsElementTemplateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_Package_Template" ADD CONSTRAINT "Work_Package_Template_projectTemplateId_fkey" FOREIGN KEY ("projectTemplateId") REFERENCES "Project_Template"("wbsElementTemplateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Project_TemplateToTeam" ADD CONSTRAINT "_Project_TemplateToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Project_Template"("wbsElementTemplateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Project_TemplateToTeam" ADD CONSTRAINT "_Project_TemplateToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocking" ADD CONSTRAINT "_blocking_A_fkey" FOREIGN KEY ("A") REFERENCES "Work_Package_Template"("wbsElementTemplateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocking" ADD CONSTRAINT "_blocking_B_fkey" FOREIGN KEY ("B") REFERENCES "Work_Package_Template"("wbsElementTemplateId") ON DELETE CASCADE ON UPDATE CASCADE;
