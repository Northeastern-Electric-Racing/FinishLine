-- Move dashboard placement (guest home page / new member dashboard / onboarding dashboard) off
-- Link_Type (a global category, e.g. "GitHub", "Confluence") and onto Link (a specific instance).
-- This lets the same Link_Type be reused across a project link and any number of dashboard links.

-- AlterTable: Link - add the placement columns
ALTER TABLE "Link"
ADD COLUMN "isOnGuestHomePage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isOnNewMemberDashboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isOnOnboardingDashboard" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: copy each existing link's placement down from its current Link_Type before the
-- Link_Type columns are dropped. Only org-level useful links (organizationId set) ever had
-- meaningful placement; project links (wbsElementId) were never flagged and stay false.
UPDATE "Link" l
SET
  "isOnGuestHomePage" = lt."isOnGuestHomePage",
  "isOnNewMemberDashboard" = lt."isOnNewMemberDashboard",
  "isOnOnboardingDashboard" = lt."isOnOnboardingDashboard"
FROM "Link_Type" lt
WHERE l."linkTypeId" = lt."id"
  AND l."organizationId" IS NOT NULL;

-- Enforce the "one dashboard per link" invariant: some legacy Link_Type rows (e.g. the old
-- seeded "Handbook" type) had more than one placement flag set, which the backfill above would
-- otherwise carry over verbatim. Keep only the highest-priority flag per link, prioritizing
-- onboarding dashboard, then new member dashboard, then guest home page.
UPDATE "Link"
SET "isOnNewMemberDashboard" = false
WHERE "isOnNewMemberDashboard" = true AND "isOnOnboardingDashboard" = true;

UPDATE "Link"
SET "isOnGuestHomePage" = false
WHERE "isOnGuestHomePage" = true
  AND ("isOnNewMemberDashboard" = true OR "isOnOnboardingDashboard" = true);

-- AlterTable: Link_Type - drop the now-relocated placement columns
ALTER TABLE "Link_Type"
DROP COLUMN "isOnGuestHomePage",
DROP COLUMN "isOnNewMemberDashboard",
DROP COLUMN "isOnOnboardingDashboard";
