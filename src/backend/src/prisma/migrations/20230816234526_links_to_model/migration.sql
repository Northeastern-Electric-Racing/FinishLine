
-- CreateTable
CREATE TABLE "LinkType" (
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "iconName" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,

    CONSTRAINT "LinkType_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Link" (
    "linkId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "linkTypeName" TEXT NOT NULL,
    "wbsElementId" INTEGER NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("linkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkType_name_key" ON "LinkType"("name");

-- AddForeignKey
ALTER TABLE "LinkType" ADD CONSTRAINT "LinkType_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_linkTypeName_fkey" FOREIGN KEY ("linkTypeName") REFERENCES "LinkType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Adds a no-op user to the database
*/
-- Insert 
INSERT INTO "User" ("userId", "firstName", "lastName", "googleAuthId", "email") VALUES (0, 'Admin', 'User', 'admin', 'admin@gmail.com');

/*
  Adds Confluence, Google Drive and BOM Link Types to the database
*/
-- Insert
INSERT INTO "LinkType" ("name", "creatorId", "required", "iconName") VALUES ('Confluence', 0, 'true', 'description');
INSERT INTO "LinkType" ("name", "creatorId", "required", "iconName") VALUES ('Google Drive', 0, 'true', 'folder');
INSERT INTO "LinkType" ("name", "creatorId", "required", "iconName") VALUES ('Bill of Materials', 0, 'true', 'attach_money');

/*
  Transfer over all the slide deck links to conflunce links
*/
-- Insert
INSERT INTO "Link" ("linkId", "url", "creatorId", "linkTypeName", "wbsElementId") SELECT gen_random_uuid(), "slideDeckLink", 0, 'Confluence', "wbsElementId" FROM "Project" WHERE "slideDeckLink" IS NOT NULL;
/*
  Transfer over all the Google Drive Folder links to Google Drive links
*/
-- Insert
INSERT INTO "Link" ("linkId", "url", "creatorId", "linkTypeName", "wbsElementId") SELECT gen_random_uuid(),"googleDriveFolderLink", 0, 'Google Drive', "wbsElementId" FROM "Project" WHERE "googleDriveFolderLink" IS NOT NULL;
/*
  Transfer over all the BOM links to BOM links
*/
-- Insert
INSERT INTO "Link" ("linkId", "url", "creatorId", "linkTypeName", "wbsElementId") SELECT gen_random_uuid(), "bomLink", 0, 'Bill of Materials', "wbsElementId" FROM "Project" WHERE "bomLink" IS NOT NULL;

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