/*
  Warnings:

  - You are about to drop the column `projectId` on the `_ProjectToReimbursement_Request` table. All the data in the column will be lost.
  - You are about to drop the column `reimbursementRequestId` on the `_ProjectToReimbursement_Request` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[A,B]` on the table `_ProjectToReimbursement_Request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `A` to the `_ProjectToReimbursement_Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `B` to the `_ProjectToReimbursement_Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" DROP CONSTRAINT "_ProjectToReimbursement_Request_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" DROP CONSTRAINT "_ProjectToReimbursement_Request_B_fkey";

-- DropIndex
DROP INDEX "_ProjectToReimbursement_Request_AB_unique";

-- DropIndex
DROP INDEX "_ProjectToReimbursement_Request_B_index";

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "reimbursementNumber" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "activeYears" DROP DEFAULT,
ALTER COLUMN "addedByUserId" DROP DEFAULT,
ALTER COLUMN "assignToUserId" DROP DEFAULT,
ALTER COLUMN "contacts" DROP DEFAULT,
ALTER COLUMN "discountCode" DROP DEFAULT,
ALTER COLUMN "dueDate" DROP DEFAULT,
ALTER COLUMN "joinDate" DROP DEFAULT,
ALTER COLUMN "notes" DROP DEFAULT,
ALTER COLUMN "notifyDate" DROP DEFAULT,
ALTER COLUMN "password" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "taxExempt" DROP DEFAULT,
ALTER COLUMN "tier" DROP DEFAULT,
ALTER COLUMN "twoFactorContact" DROP DEFAULT,
ALTER COLUMN "username" DROP DEFAULT,
ALTER COLUMN "value" DROP DEFAULT;

-- AlterTable
ALTER TABLE "_ProjectToReimbursement_Request" DROP COLUMN "projectId",
DROP COLUMN "reimbursementRequestId",
ADD COLUMN     "A" TEXT NOT NULL,
ADD COLUMN     "B" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToReimbursement_Request_AB_unique" ON "_ProjectToReimbursement_Request"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToReimbursement_Request_B_index" ON "_ProjectToReimbursement_Request"("B");

-- AddForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" ADD CONSTRAINT "_ProjectToReimbursement_Request_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToReimbursement_Request" ADD CONSTRAINT "_ProjectToReimbursement_Request_B_fkey" FOREIGN KEY ("B") REFERENCES "Reimbursement_Request"("reimbursementRequestId") ON DELETE CASCADE ON UPDATE CASCADE;
