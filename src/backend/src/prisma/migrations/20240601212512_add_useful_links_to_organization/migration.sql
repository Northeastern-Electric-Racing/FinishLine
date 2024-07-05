-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "organizationId" TEXT;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;
