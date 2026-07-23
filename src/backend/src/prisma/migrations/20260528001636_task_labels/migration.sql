-- CreateTable
CREATE TABLE "Task_Label" (
    "taskLabelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHexCode" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Task_Label_pkey" PRIMARY KEY ("taskLabelId")
);

-- CreateTable
CREATE TABLE "_TaskToTask_Label" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskToTask_Label_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Task_Label_organizationId_idx" ON "Task_Label"("organizationId");

-- CreateIndex
CREATE INDEX "_TaskToTask_Label_B_index" ON "_TaskToTask_Label"("B");

-- AddForeignKey
ALTER TABLE "Task_Label" ADD CONSTRAINT "Task_Label_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task_Label" ADD CONSTRAINT "Task_Label_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task_Label" ADD CONSTRAINT "Task_Label_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToTask_Label" ADD CONSTRAINT "_TaskToTask_Label_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskToTask_Label" ADD CONSTRAINT "_TaskToTask_Label_B_fkey" FOREIGN KEY ("B") REFERENCES "Task_Label"("taskLabelId") ON DELETE CASCADE ON UPDATE CASCADE;
