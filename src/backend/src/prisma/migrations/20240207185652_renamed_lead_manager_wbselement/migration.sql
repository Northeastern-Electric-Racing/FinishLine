-- Rename the columns
ALTER TABLE "WBS_Element"
  RENAME COLUMN "projectLeadId" TO "leadId",
  RENAME COLUMN "projectManagerId" TO "managerId";

-- Drop existing foreign key constraints
ALTER TABLE "WBS_Element" DROP CONSTRAINT "WBS_Element_projectLeadId_fkey";
ALTER TABLE "WBS_Element" DROP CONSTRAINT "WBS_Element_projectManagerId_fkey";

-- Add new foreign key constraints
ALTER TABLE "WBS_Element"
  ADD CONSTRAINT "WBS_Element_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "WBS_Element_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;