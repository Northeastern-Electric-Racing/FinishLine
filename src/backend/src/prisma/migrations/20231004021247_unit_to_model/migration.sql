/*
  Warnings:

  - You are about to drop the column `quantityUnit` on the `Material` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Material" DROP COLUMN "quantityUnit",
ADD COLUMN     "unitName" TEXT;

-- DropEnum
DROP TYPE "Unit";

-- CreateTable
CREATE TABLE "Unit" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_unitName_fkey" FOREIGN KEY ("unitName") REFERENCES "Unit"("name") ON DELETE SET NULL ON UPDATE CASCADE;
