-- AlterEnum
ALTER TYPE "CR_Type" ADD VALUE 'LEADERSHIP';

-- CreateTable
CREATE TABLE "Leadership_CR" (
    "leadershipCrId" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "leadId" TEXT,
    "managerId" TEXT,

    CONSTRAINT "Leadership_CR_pkey" PRIMARY KEY ("leadershipCrId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Leadership_CR_changeRequestId_key" ON "Leadership_CR"("changeRequestId");

-- CreateIndex
CREATE INDEX "Leadership_CR_changeRequestId_idx" ON "Leadership_CR"("changeRequestId");

-- AddForeignKey
ALTER TABLE "Leadership_CR" ADD CONSTRAINT "Leadership_CR_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "Change_Request"("crId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leadership_CR" ADD CONSTRAINT "Leadership_CR_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leadership_CR" ADD CONSTRAINT "Leadership_CR_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
