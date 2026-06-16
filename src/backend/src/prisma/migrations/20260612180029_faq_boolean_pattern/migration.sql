/*
  Warnings:

  - You are about to drop the column `dashboardTarget` on the `FrequentlyAskedQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `partReviewFaqOrgId` on the `FrequentlyAskedQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `regularFaqOrgId` on the `FrequentlyAskedQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `isOnOnboardingDashboard` on the `Link_Type` table. All the data in the column will be lost.
  - You are about to drop the column `dashboardTarget` on the `Milestone` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `FrequentlyAskedQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FrequentlyAskedQuestion" DROP CONSTRAINT "FrequentlyAskedQuestion_partReviewFaqOrgId_fkey";

-- DropForeignKey
ALTER TABLE "FrequentlyAskedQuestion" DROP CONSTRAINT "FrequentlyAskedQuestion_regularFaqOrgId_fkey";

-- AlterTable
-- First add new columns
ALTER TABLE "FrequentlyAskedQuestion"
ADD COLUMN     "isOnNewMemberDashboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnPartReviewPage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnRecruitingDashboard" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "organizationId" TEXT;

-- Populate orgId where available
UPDATE "FrequentlyAskedQuestion"
SET "organizationId" = "regularFaqOrgId"
WHERE "regularFaqOrgId" IS NOT NULL;

UPDATE "FrequentlyAskedQuestion"
SET "organizationId" = "partReviewFaqOrgId"
WHERE "organizationId" IS NULL AND "partReviewFaqOrgId" IS NOT NULL;

-- Populate booleans
UPDATE "FrequentlyAskedQuestion"
SET "isOnPartReviewPage" = true
WHERE "partReviewFaqOrgId" IS NOT NULL;

UPDATE "FrequentlyAskedQuestion"
SET "isOnRecruitingDashboard" = false
WHERE "regularFaqOrgId" IS NULL AND "partReviewFaqOrgId" IS NOT NULL;

ALTER TABLE "FrequentlyAskedQuestion"
ALTER COLUMN "organizationId" SET NOT NULL;

-- Drop old columns
ALTER TABLE "FrequentlyAskedQuestion"
DROP COLUMN "dashboardTarget",
DROP COLUMN "partReviewFaqOrgId",
DROP COLUMN "regularFaqOrgId";

-- AlterTable
ALTER TABLE "Link_Type" DROP COLUMN "isOnOnboardingDashboard",
ADD COLUMN     "isOnNewMemberDashboard" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Milestone"
DROP COLUMN "dashboardTarget",
ADD COLUMN     "isOnNewMemberDashboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnRecruitingDashboard" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "Dashboard_Target";

-- AddForeignKey
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
