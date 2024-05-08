/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Reimbursement_Request` will be added. If there are existing duplicate values, this will fail.

*/
-- Select all old RRs that has no identifier in dateCreated ascending order
CREATE TEMP TABLE cte_table AS (
    WITH CTE AS (
        SELECT 
            "reimbursementRequestId",
            row_number() OVER (ORDER BY "dateCreated" ASC, "reimbursementRequestId" ASC) AS new_identifier
        FROM 
            "Reimbursement_Request"
    )
    SELECT * FROM CTE
);

-- AlterTable
ALTER TABLE "Reimbursement_Request" ADD COLUMN     "identifier" SERIAL NOT NULL;

-- Assign Identifier to all old Reimbursement Requests based on their dateCreated order
UPDATE "Reimbursement_Request" AS rr
SET "identifier" = "cte_table".new_identifier
FROM cte_table
WHERE rr."reimbursementRequestId" = "cte_table"."reimbursementRequestId";

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Request_identifier_key" ON "Reimbursement_Request"("identifier");

-- Remove the temporary table
DROP TABLE cte_table;
