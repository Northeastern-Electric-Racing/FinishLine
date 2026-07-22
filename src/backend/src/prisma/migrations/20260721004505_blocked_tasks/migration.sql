-- CreateTable
CREATE TABLE "_taskBlocking" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_taskBlocking_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_taskBlocking_B_index" ON "_taskBlocking"("B");

-- AddForeignKey
ALTER TABLE "_taskBlocking" ADD CONSTRAINT "_taskBlocking_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_taskBlocking" ADD CONSTRAINT "_taskBlocking_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;
