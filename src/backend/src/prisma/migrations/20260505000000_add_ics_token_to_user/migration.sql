-- AlterTable
ALTER TABLE "User" ADD COLUMN "icsToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_icsToken_key" ON "User"("icsToken");
