-- CreateTable
CREATE TABLE "_requestedChangeRequestReviewers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_requestedChangeRequestReviewers_AB_unique" ON "_requestedChangeRequestReviewers"("A", "B");

-- CreateIndex
CREATE INDEX "_requestedChangeRequestReviewers_B_index" ON "_requestedChangeRequestReviewers"("B");

-- AddForeignKey
ALTER TABLE "_requestedChangeRequestReviewers" ADD CONSTRAINT "_requestedChangeRequestReviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Change_Request"("crId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requestedChangeRequestReviewers" ADD CONSTRAINT "_requestedChangeRequestReviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
