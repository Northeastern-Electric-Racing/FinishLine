/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Reimbursement_Request` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reimbursement_Request" ADD COLUMN     "identifier" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Request_identifier_key" ON "Reimbursement_Request"("identifier");

-- Assign Identifier to all old Reimbursement Requests based on their dateCreated order
WITH CTE AS (
    SELECT 
        "reimbursementRequestId",
        ROW_NUMBER() OVER (ORDER BY "dateCreated" DESC) AS new_identifier
    FROM 
        "Reimbursement_Request"
    WHERE
        "identifier" IS NULL
)
UPDATE "Reimbursement_Request" AS rr
SET "identifier" = cte.new_identifier
FROM CTE
WHERE rr."reimbursementRequestId" = CTE."reimbursementRequestId";
