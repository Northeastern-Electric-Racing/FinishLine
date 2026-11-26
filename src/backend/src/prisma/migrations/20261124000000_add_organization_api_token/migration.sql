-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "apiTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_apiTokenHash_key" ON "Organization"("apiTokenHash");
