/*
  Warnings:

  - You are about to drop the column `bomLink` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `googleDriveFolderLink` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `slideDeckLink` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `taskListLink` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "bomLink",
DROP COLUMN "googleDriveFolderLink",
DROP COLUMN "slideDeckLink",
DROP COLUMN "taskListLink";

-- CreateTable
CREATE TABLE "LinkType" (
    "linkTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "iconName" TEXT NOT NULL,

    CONSTRAINT "LinkType_pkey" PRIMARY KEY ("linkTypeId")
);

-- CreateTable
CREATE TABLE "Link" (
    "linkId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkTypeId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("linkId")
);

-- AddForeignKey
ALTER TABLE "LinkType" ADD CONSTRAINT "LinkType_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_linkTypeId_fkey" FOREIGN KEY ("linkTypeId") REFERENCES "LinkType"("linkTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
