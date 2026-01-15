/*
  Warnings:

  - A unique constraint covering the columns `[materialId]` on the table `Reimbursement_Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_manufacturerId_fkey";

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "manufacturerId" DROP NOT NULL,
ALTER COLUMN "manufacturerPartNumber" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "subtotal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reimbursement_Product" ADD COLUMN     "materialId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_Product_materialId_key" ON "Reimbursement_Product"("materialId");

-- CreateIndex
CREATE INDEX "Reimbursement_Product_materialId_idx" ON "Reimbursement_Product"("materialId");

-- AddForeignKey
ALTER TABLE "Reimbursement_Product" ADD CONSTRAINT "Reimbursement_Product_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("materialId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
