-- CreateEnum
CREATE TYPE "Material_Status" AS ENUM ('RECEIVED', 'ORDERED', 'SHIPPED', 'UNORDERED');

-- CreateTable
CREATE TABLE "Unit" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Assembly" (
    "assemblyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pdmFileName" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "wbsElementId" INTEGER NOT NULL,

    CONSTRAINT "Assembly_pkey" PRIMARY KEY ("assemblyId")
);

-- CreateTable
CREATE TABLE "Material" (
    "materialId" TEXT NOT NULL,
    "assemblyId" TEXT,
    "name" TEXT NOT NULL,
    "wbsElementId" INTEGER NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userDeletedId" INTEGER,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "status" "Material_Status" NOT NULL,
    "materialTypeName" TEXT NOT NULL,
    "manufacturerName" TEXT NOT NULL,
    "manufacturerPartNumber" TEXT NOT NULL,
    "pdmFileName" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitName" TEXT,
    "price" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("materialId")
);

-- CreateTable
CREATE TABLE "Material_Type" (
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" INTEGER NOT NULL,

    CONSTRAINT "Material_Type_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Manufacturer" (
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "userCreatedId" INTEGER NOT NULL,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assembly_name_key" ON "Assembly"("name");

-- AddForeignKey
ALTER TABLE "Assembly" ADD CONSTRAINT "Assembly_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assembly" ADD CONSTRAINT "Assembly_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assembly" ADD CONSTRAINT "Assembly_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "Assembly"("assemblyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_wbsElementId_fkey" FOREIGN KEY ("wbsElementId") REFERENCES "WBS_Element"("wbsElementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_materialTypeName_fkey" FOREIGN KEY ("materialTypeName") REFERENCES "Material_Type"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_manufacturerName_fkey" FOREIGN KEY ("manufacturerName") REFERENCES "Manufacturer"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_unitName_fkey" FOREIGN KEY ("unitName") REFERENCES "Unit"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material_Type" ADD CONSTRAINT "Material_Type_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
