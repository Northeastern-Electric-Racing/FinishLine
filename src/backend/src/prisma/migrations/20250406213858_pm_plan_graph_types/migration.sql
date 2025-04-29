-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Graph_Type" ADD VALUE 'CHANGE_REQUESTS_BY_STATUS';
ALTER TYPE "Graph_Type" ADD VALUE 'PROJECT_BUDGET_VS_REIMBURSED_AMOUNT';
