-- CreateTable
CREATE TABLE "_favoritedBy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_favoritedBy_AB_unique" ON "_favoritedBy"("A", "B");

-- CreateIndex
CREATE INDEX "_favoritedBy_B_index" ON "_favoritedBy"("B");

-- AddForeignKey
ALTER TABLE "_favoritedBy" ADD CONSTRAINT "_favoritedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_favoritedBy" ADD CONSTRAINT "_favoritedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
