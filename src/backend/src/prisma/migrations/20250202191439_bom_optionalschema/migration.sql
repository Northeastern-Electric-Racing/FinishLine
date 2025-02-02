-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_materialTypeId_fkey";

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "materialTypeId" DROP NOT NULL,
ALTER COLUMN "manufacturerId" DROP NOT NULL,
ALTER COLUMN "manufacturerPartNumber" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "subtotal" DROP NOT NULL,
ALTER COLUMN "linkUrl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_materialTypeId_fkey" FOREIGN KEY ("materialTypeId") REFERENCES "Material_Type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
