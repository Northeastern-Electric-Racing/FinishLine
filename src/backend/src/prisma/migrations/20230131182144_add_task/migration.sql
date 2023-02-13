-- CreateEnum
CREATE TYPE "Task_Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Task_Status" AS ENUM ('IN_BACKLOG', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "Task" (
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "priority" "Task_Priority" NOT NULL,
    "status" "Task_Status" NOT NULL,
    "deletedByUserId" INTEGER,
    "dateDeleted" TIMESTAMP(3),
    "createdByUserId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wbsElementId" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("taskId")
);

-- CreateTable
CREATE TABLE "_assignedTo" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_assignedTo_AB_unique" ON "_assignedTo"("A", "B");

-- CreateIndex
CREATE INDEX "_assignedTo_B_index" ON "_assignedTo"("B");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignedTo" ADD CONSTRAINT "_assignedTo_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_assignedTo" ADD CONSTRAINT "_assignedTo_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
