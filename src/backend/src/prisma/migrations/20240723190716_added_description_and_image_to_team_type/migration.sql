ALTER TABLE "Team_Type" 
ADD COLUMN "description" TEXT NOT NULL DEFAULT 'Default description',
ADD COLUMN "imageFileId" TEXT;

ALTER TABLE "Team_Type" 
ALTER COLUMN "description" DROP DEFAULT;
