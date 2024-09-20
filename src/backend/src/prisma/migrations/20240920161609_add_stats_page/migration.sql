-- CreateEnum
CREATE TYPE "Graph_Type" AS ENUM ('BAR', 'LINE', 'PIE');

-- CreateEnum
CREATE TYPE "Data_Type" AS ENUM ('CAR', 'PROJECT', 'TEAM', 'CHANGE_REQUEST', 'BUDGET', 'DESIGN_REVIEW', 'USER');

-- CreateEnum
CREATE TYPE "Values" AS ENUM ('SUM', 'AVERAGE');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('LEADS_ONLY', 'HEADS_ONLY', 'ALL_MEMBERS');

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "graphLinkId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "graphLinkId" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "graphLinkId" TEXT;

-- CreateTable
CREATE TABLE "Graph" (
    "organizationId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "graphType" "Graph_Type" NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "graphDataId" TEXT NOT NULL,
    "groupBy" "Data_Type" NOT NULL,
    "graphCollectionLinkId" TEXT,

    CONSTRAINT "Graph_pkey" PRIMARY KEY ("linkId")
);

-- CreateTable
CREATE TABLE "GraphData" (
    "id" TEXT NOT NULL,
    "type" "Data_Type" NOT NULL,
    "values" "Values" NOT NULL
);

-- CreateTable
CREATE TABLE "GraphCollection" (
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "permissions" "Permission"[],

    CONSTRAINT "GraphCollection_pkey" PRIMARY KEY ("linkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Graph_organizationId_key" ON "Graph"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Graph_graphDataId_key" ON "Graph"("graphDataId");

-- CreateIndex
CREATE UNIQUE INDEX "GraphData_id_key" ON "GraphData"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GraphCollection_organizationId_key" ON "GraphCollection"("organizationId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_graphLinkId_fkey" FOREIGN KEY ("graphLinkId") REFERENCES "Graph"("linkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_graphLinkId_fkey" FOREIGN KEY ("graphLinkId") REFERENCES "Graph"("linkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_graphLinkId_fkey" FOREIGN KEY ("graphLinkId") REFERENCES "Graph"("linkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_graphDataId_fkey" FOREIGN KEY ("graphDataId") REFERENCES "GraphData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_graphCollectionLinkId_fkey" FOREIGN KEY ("graphCollectionLinkId") REFERENCES "GraphCollection"("linkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphCollection" ADD CONSTRAINT "GraphCollection_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphCollection" ADD CONSTRAINT "GraphCollection_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
