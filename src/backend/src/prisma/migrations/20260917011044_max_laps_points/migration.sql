-- AlterTable
ALTER TABLE "Competition_Performance" ADD COLUMN     "maxLaps" INTEGER,
ADD COLUMN     "maxPoints" INTEGER;

-- Backfill an empty executive summary for every existing car that doesn't have one,
-- attributing creation to the car's organization creator
INSERT INTO "Executive_Summary" ("executiveSummaryId", "carId", "userCreatedId")
SELECT gen_random_uuid(), c."carId", o."userCreatedId"
FROM "Car" c
JOIN "WBS_Element" w ON w."wbsElementId" = c."wbsElementId"
JOIN "Organization" o ON o."organizationId" = w."organizationId"
WHERE NOT EXISTS (
  SELECT 1 FROM "Executive_Summary" es WHERE es."carId" = c."carId"
);

