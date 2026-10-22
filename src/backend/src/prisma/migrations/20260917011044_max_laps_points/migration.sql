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


-- Backfill an empty competition performance for every competition on every existing executive summary
INSERT INTO "Competition_Performance" ("competitionPerformanceId", "executiveSummaryId", "competition")
SELECT gen_random_uuid(), es."executiveSummaryId", comp.competition
FROM "Executive_Summary" es
CROSS JOIN unnest(enum_range(NULL::"Competition")) AS comp(competition)
WHERE NOT EXISTS (
  SELECT 1 FROM "Competition_Performance" cp
  WHERE cp."executiveSummaryId" = es."executiveSummaryId" AND cp."competition" = comp.competition
);

-- Backfill an empty competition documents summary for every existing executive summary that doesn't have one
INSERT INTO "Competition_Documents_Summary" ("competitionDocumentsSummaryId", "executiveSummaryId")
SELECT gen_random_uuid(), es."executiveSummaryId"
FROM "Executive_Summary" es
WHERE NOT EXISTS (
  SELECT 1 FROM "Competition_Documents_Summary" cds WHERE cds."executiveSummaryId" = es."executiveSummaryId"
);

-- Backfill an empty recruitment cycle for every term on every existing executive summary
INSERT INTO "Recruitment_Cycle" ("recruitmentCycleId", "executiveSummaryId", "term")
SELECT gen_random_uuid(), es."executiveSummaryId", t.term
FROM "Executive_Summary" es
CROSS JOIN unnest(enum_range(NULL::"Term")) AS t(term)
WHERE NOT EXISTS (
  SELECT 1 FROM "Recruitment_Cycle" rc
  WHERE rc."executiveSummaryId" = es."executiveSummaryId" AND rc."term" = t.term
);
