-- CreateTable
CREATE TABLE "_onboardedTeamTypes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_onboardedTeamTypes_AB_unique" ON "_onboardedTeamTypes"("A", "B");

-- CreateIndex
CREATE INDEX "_onboardedTeamTypes_B_index" ON "_onboardedTeamTypes"("B");

-- AddForeignKey
ALTER TABLE "_onboardedTeamTypes" ADD CONSTRAINT "_onboardedTeamTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "Team_Type"("teamTypeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_onboardedTeamTypes" ADD CONSTRAINT "_onboardedTeamTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
