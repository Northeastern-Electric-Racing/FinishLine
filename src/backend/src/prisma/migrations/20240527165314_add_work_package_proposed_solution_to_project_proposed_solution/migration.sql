-- AlterTable
ALTER TABLE "Work_Package_Proposed_Changes" ADD COLUMN     "projectProposedChangesId" TEXT;

-- AddForeignKey
ALTER TABLE "Work_Package_Proposed_Changes" ADD CONSTRAINT "Work_Package_Proposed_Changes_projectProposedChangesId_fkey" FOREIGN KEY ("projectProposedChangesId") REFERENCES "Project_Proposed_Changes"("projectProposedChangesId") ON DELETE SET NULL ON UPDATE CASCADE;
