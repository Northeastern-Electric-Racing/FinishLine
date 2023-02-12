-- CreateEnum
CREATE TYPE "WP_Stage" AS ENUM ('RESEARCH', 'DESIGN', 'MANUFACTURING', 'INTEGRATION');

-- AlterTable
ALTER TABLE "Work_Package" ADD COLUMN     "stage" "WP_Stage";
