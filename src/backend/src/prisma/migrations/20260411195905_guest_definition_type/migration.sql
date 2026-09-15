-- CreateEnum
CREATE TYPE "Guest_Definition_Type" AS ENUM ('PROJECT_MANAGEMENT', 'INFO_PAGE');

-- AlterTable
ALTER TABLE "Guest_Definition" ADD COLUMN     "type" "Guest_Definition_Type" NOT NULL DEFAULT 'INFO_PAGE';
