-- CreateEnum
CREATE TYPE "Team_Join_Request_Status" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "isNewMemberCalendar" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: FrequentlyAskedQuestion - add new columns (nullable first for data migration)
ALTER TABLE "FrequentlyAskedQuestion"
ADD COLUMN "isOnNewMemberDashboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isOnPartReviewPage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isOnRecruitingDashboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "organizationId" TEXT;

-- Populate organizationId from regularFaqOrgId where available
UPDATE "FrequentlyAskedQuestion"
SET "organizationId" = "regularFaqOrgId"
WHERE "regularFaqOrgId" IS NOT NULL;

-- Fill remaining rows from partReviewFaqOrgId
UPDATE "FrequentlyAskedQuestion"
SET "organizationId" = "partReviewFaqOrgId"
WHERE "organizationId" IS NULL AND "partReviewFaqOrgId" IS NOT NULL;

-- Populate booleans from old fields
UPDATE "FrequentlyAskedQuestion"
SET "isOnPartReviewPage" = true
WHERE "partReviewFaqOrgId" IS NOT NULL;

UPDATE "FrequentlyAskedQuestion"
SET "isOnRecruitingDashboard" = true
WHERE "regularFaqOrgId" IS NOT NULL;

-- Now make organizationId non-nullable
ALTER TABLE "FrequentlyAskedQuestion"
ALTER COLUMN "organizationId" SET NOT NULL;

-- Drop old FK constraints
ALTER TABLE "FrequentlyAskedQuestion" DROP CONSTRAINT "FrequentlyAskedQuestion_partReviewFaqOrgId_fkey";
ALTER TABLE "FrequentlyAskedQuestion" DROP CONSTRAINT "FrequentlyAskedQuestion_regularFaqOrgId_fkey";

-- Drop old columns
ALTER TABLE "FrequentlyAskedQuestion"
DROP COLUMN "partReviewFaqOrgId",
DROP COLUMN "regularFaqOrgId";

-- AddForeignKey
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Link_Type
ALTER TABLE "Link_Type" ADD COLUMN "isOnNewMemberDashboard" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Milestone
ALTER TABLE "Milestone"
ADD COLUMN "isOnNewMemberDashboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isOnRecruitingDashboard" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Team_Join_Request" (
    "teamJoinRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" "Team_Join_Request_Status" NOT NULL DEFAULT 'PENDING',
    "dateRequested" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "denialReason" TEXT,
    "reviewedByUserId" TEXT,
    "dateReviewed" TIMESTAMP(3),
    CONSTRAINT "Team_Join_Request_pkey" PRIMARY KEY ("teamJoinRequestId")
);

-- CreateIndex
CREATE INDEX "Team_Join_Request_userId_idx" ON "Team_Join_Request"("userId");

-- CreateIndex
CREATE INDEX "Team_Join_Request_teamId_idx" ON "Team_Join_Request"("teamId");

-- AddForeignKey for user id
ALTER TABLE "Team_Join_Request" ADD CONSTRAINT "Team_Join_Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey for team id
ALTER TABLE "Team_Join_Request" ADD CONSTRAINT "Team_Join_Request_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("teamId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey for reviewed by user id
ALTER TABLE "Team_Join_Request" ADD CONSTRAINT "Team_Join_Request_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;