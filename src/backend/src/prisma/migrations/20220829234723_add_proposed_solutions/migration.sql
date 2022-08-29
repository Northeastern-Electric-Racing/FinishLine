-- CreateTable
CREATE TABLE "ProposedSolution" (
    "proposedSolutionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timelineImpact" INTEGER NOT NULL,
    "budgetImpact" INTEGER NOT NULL,
    "scopeImpact" TEXT NOT NULL,
    "changeRequestId" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProposedSolution_pkey" PRIMARY KEY ("proposedSolutionId")
);

-- AddForeignKey
ALTER TABLE "ProposedSolution" ADD CONSTRAINT "ProposedSolution_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Scope_CR"("scopeCrId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposedSolution" ADD CONSTRAINT "ProposedSolution_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
