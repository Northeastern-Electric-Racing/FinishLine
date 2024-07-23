-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "description" TEXT DEFAULT 'Default description';

ALTER TABLE "Organization" ALTER COLUMN "description" DROP DEFAULT;

ALTER TABLE "Organization" ALTER COLUMN "description" SET NOT NULL;
