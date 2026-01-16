-- CreateTable
CREATE TABLE "Term_Definition" (
    "definitionId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" TEXT,
    "userCreatedId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Term_Definition_pkey" PRIMARY KEY ("definitionId")
);

-- CreateIndex
CREATE INDEX "Term_Definition_organizationId_idx" ON "Term_Definition"("organizationId");

-- AddForeignKey
ALTER TABLE "Term_Definition" ADD CONSTRAINT "Term_Definition_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term_Definition" ADD CONSTRAINT "Term_Definition_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term_Definition" ADD CONSTRAINT "Term_Definition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
