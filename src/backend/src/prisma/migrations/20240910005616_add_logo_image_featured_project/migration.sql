-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoImageId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "organizationId" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;
