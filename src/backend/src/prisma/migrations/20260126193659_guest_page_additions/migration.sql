-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "logoImageId" TEXT;

-- AlterTable
ALTER TABLE "Team_Type" ADD COLUMN     "definitionId" TEXT;

-- CreateTable
CREATE TABLE "Guest_Definition" (
    "definitionId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "icon" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" TEXT,
    "userCreatedId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Guest_Definition_pkey" PRIMARY KEY ("definitionId")
);

-- CreateIndex
CREATE INDEX "Guest_Definition_organizationId_idx" ON "Guest_Definition"("organizationId");

-- AddForeignKey
ALTER TABLE "Team_Type" ADD CONSTRAINT "Team_Type_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "Guest_Definition"("definitionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest_Definition" ADD CONSTRAINT "Guest_Definition_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest_Definition" ADD CONSTRAINT "Guest_Definition_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest_Definition" ADD CONSTRAINT "Guest_Definition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
