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

-- Migrate descriptions array to INFO checklist items
-- For each checklist with non-empty descriptions, create INFO subtasks
DO $$
DECLARE
  checklist_record RECORD;
  description_text TEXT;
  max_order INTEGER;
  current_order INTEGER;
  array_index INTEGER;
BEGIN
  -- Loop through all checklists that have descriptions
  FOR checklist_record IN 
    SELECT "checklistId", "descriptions", "organizationId", "userCreatedId", "teamId", "teamTypeId", "dateCreated"
    FROM "Checklist"
    WHERE "descriptions" IS NOT NULL 
      AND array_length("descriptions", 1) > 0
      AND "dateDeleted" IS NULL
  LOOP
    -- Get the maximum displayOrder for existing subtasks of this checklist
    SELECT COALESCE(MAX("displayOrder"), 0) INTO max_order
    FROM "Checklist"
    WHERE "parentChecklistId" = checklist_record."checklistId"
      AND "dateDeleted" IS NULL;
    
    current_order := max_order;
    
    -- Loop through each description in the array
    FOR array_index IN 1..array_length(checklist_record."descriptions", 1)
    LOOP
      description_text := checklist_record."descriptions"[array_index];
      current_order := current_order + 1;
      
      -- Create an INFO checklist item for this description
      INSERT INTO "Checklist" (
        "checklistId",
        "name",
        "descriptions",
        "isOptional",
        "displayOrder",
        "itemType",
        "parentChecklistId",
        "organizationId",
        "userCreatedId",
        "teamId",
        "teamTypeId",
        "dateCreated"
      ) VALUES (
        gen_random_uuid(),
        description_text,
        ARRAY[]::TEXT[],
        true,
        current_order,
        'INFO',
        checklist_record."checklistId",
        checklist_record."organizationId",
        checklist_record."userCreatedId",
        checklist_record."teamId",
        checklist_record."teamTypeId",
        checklist_record."dateCreated"
      );
    END LOOP;
  END LOOP;
END $$;

-- Now that descriptions have been migrated to INFO items, we can rename name to content
-- and remove descriptions

-- Add the new content column
ALTER TABLE "Checklist" ADD COLUMN "content" TEXT;

-- Copy name to content
UPDATE "Checklist" SET "content" = "name";

-- Make content NOT NULL
ALTER TABLE "Checklist" ALTER COLUMN "content" SET NOT NULL;

-- Drop the old columns
ALTER TABLE "Checklist" DROP COLUMN "name";
ALTER TABLE "Checklist" DROP COLUMN "descriptions";
