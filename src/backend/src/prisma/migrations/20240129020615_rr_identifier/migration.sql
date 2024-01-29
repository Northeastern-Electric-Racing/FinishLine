/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Reimbursement_Request` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reimbursement_Request" ADD COLUMN     "identifier" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Request_identifier_key" ON "Reimbursement_Request"("identifier");
