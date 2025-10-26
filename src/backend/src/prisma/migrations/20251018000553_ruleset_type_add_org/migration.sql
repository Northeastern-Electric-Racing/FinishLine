/*
  Warnings:

  - Added the required column `organizationId` to the `Ruleset_Type` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ruleset_Type" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Ruleset_Type_organizationId_idx" ON "Ruleset_Type"("organizationId");

-- AddForeignKey
ALTER TABLE "Ruleset_Type" ADD CONSTRAINT "Ruleset_Type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
