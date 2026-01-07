-- CreateEnum
CREATE TYPE "Checklist_Item_Type" AS ENUM ('TASK', 'INFO');

-- AlterTable
ALTER TABLE "Checklist" ADD COLUMN "displayOrder" INTEGER,
ADD COLUMN "itemType" "Checklist_Item_Type" NOT NULL DEFAULT 'TASK';

-- Backfill displayOrder based on dateCreated for existing records
-- For top-level checklists (parentChecklistId IS NULL)
WITH ranked_parent AS (
  SELECT "checklistId", ROW_NUMBER() OVER (ORDER BY "dateCreated", "checklistId") as rn
  FROM "Checklist"
  WHERE "parentChecklistId" IS NULL AND "displayOrder" IS NULL
)
UPDATE "Checklist"
SET "displayOrder" = ranked_parent.rn
FROM ranked_parent
WHERE "Checklist"."checklistId" = ranked_parent."checklistId";

-- For child checklists (parentChecklistId IS NOT NULL)
WITH ranked_children AS (
  SELECT "checklistId", ROW_NUMBER() OVER (PARTITION BY "parentChecklistId" ORDER BY "dateCreated", "checklistId") as rn
  FROM "Checklist"
  WHERE "parentChecklistId" IS NOT NULL AND "displayOrder" IS NULL
)
UPDATE "Checklist"
SET "displayOrder" = ranked_children.rn
FROM ranked_children
WHERE "Checklist"."checklistId" = ranked_children."checklistId";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "newMemberImageId" TEXT;