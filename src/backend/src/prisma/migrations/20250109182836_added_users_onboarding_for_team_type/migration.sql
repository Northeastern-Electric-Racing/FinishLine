-- CreateTable
CREATE TABLE "_onboardingTeamTypes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_onboardingTeamTypes_AB_unique" ON "_onboardingTeamTypes"("A", "B");

-- CreateIndex
CREATE INDEX "_onboardingTeamTypes_B_index" ON "_onboardingTeamTypes"("B");

-- AddForeignKey
ALTER TABLE "_onboardingTeamTypes" ADD CONSTRAINT "_onboardingTeamTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "Team_Type"("teamTypeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_onboardingTeamTypes" ADD CONSTRAINT "_onboardingTeamTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
