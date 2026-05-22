-- CreateEnum
CREATE TYPE "Dashboard_Target" AS ENUM ('RECRUITING', 'ONBOARDING', 'BOTH');

-- CreateEnum
CREATE TYPE "Team_Join_Request_Status" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- AlterTable
ALTER TABLE "FrequentlyAskedQuestion" ADD COLUMN     "dashboardTarget" "Dashboard_Target" NOT NULL DEFAULT 'RECRUITING';

-- AlterTable
ALTER TABLE "Link_Type" ADD COLUMN     "isOnOnboardingDashboard" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "dashboardTarget" "Dashboard_Target" NOT NULL DEFAULT 'RECRUITING';

-- CreateTable
CREATE TABLE "Team_Join_Request" (
    "teamJoinRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" "Team_Join_Request_Status" NOT NULL DEFAULT 'PENDING',
    "dateRequested" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "denialReason" TEXT,

    CONSTRAINT "Team_Join_Request_pkey" PRIMARY KEY ("teamJoinRequestId")
);

-- CreateIndex
CREATE INDEX "Team_Join_Request_userId_idx" ON "Team_Join_Request"("userId");

-- CreateIndex
CREATE INDEX "Team_Join_Request_teamId_idx" ON "Team_Join_Request"("teamId");

-- AddForeignKey
ALTER TABLE "Team_Join_Request" ADD CONSTRAINT "Team_Join_Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team_Join_Request" ADD CONSTRAINT "Team_Join_Request_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("teamId") ON DELETE RESTRICT ON UPDATE CASCADE;
