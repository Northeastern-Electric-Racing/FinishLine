-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "Team" (
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "leaderId" INTEGER NOT NULL,
    "slackId" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT E'',

    PRIMARY KEY ("teamId")
);

-- CreateTable
CREATE TABLE "_teamsAsMember" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Team.leaderId_unique" ON "Team"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "_teamsAsMember_AB_unique" ON "_teamsAsMember"("A", "B");

-- CreateIndex
CREATE INDEX "_teamsAsMember_B_index" ON "_teamsAsMember"("B");

-- AddForeignKey
ALTER TABLE "Team" ADD FOREIGN KEY ("leaderId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamsAsMember" ADD FOREIGN KEY ("A") REFERENCES "Team"("teamId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamsAsMember" ADD FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD FOREIGN KEY ("teamId") REFERENCES "Team"("teamId") ON DELETE SET NULL ON UPDATE CASCADE;
