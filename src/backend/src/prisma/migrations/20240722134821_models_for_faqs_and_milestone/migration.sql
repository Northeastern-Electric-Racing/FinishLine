-- CreateTable
CREATE TABLE "FrequentlyAskedQuestion" (
    "faqId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "FrequentlyAskedQuestion_pkey" PRIMARY KEY ("faqId")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "milestoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfEvent" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("milestoneId")
);

-- AddForeignKey
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
