/*
  Leadership changes are now one kind of non-meaningful change, so existing LEADERSHIP
  change requests become NON_MEANINGFUL. Renaming the value keeps those rows valid;
  recreating the enum (what Prisma generated) would fail on them.
*/
ALTER TYPE "CR_Type" RENAME VALUE 'LEADERSHIP' TO 'NON_MEANINGFUL';

/*
  Leadership_CR only stored the new lead/manager, which is already recorded in each
  leadership change request's Change rows.
*/
-- DropForeignKey
ALTER TABLE "Leadership_CR" DROP CONSTRAINT "Leadership_CR_changeRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Leadership_CR" DROP CONSTRAINT "Leadership_CR_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Leadership_CR" DROP CONSTRAINT "Leadership_CR_managerId_fkey";

-- DropTable
DROP TABLE "Leadership_CR";