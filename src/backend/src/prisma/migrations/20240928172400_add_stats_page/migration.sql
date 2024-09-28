-- CreateEnum
CREATE TYPE "Graph_Type" AS ENUM ('BAR', 'LINE', 'PIE');

-- CreateEnum
CREATE TYPE "Graph_Data_Unit" AS ENUM ('CAR', 'PROJECT', 'TEAM', 'CHANGE_REQUEST', 'BUDGET', 'DESIGN_REVIEW', 'USER');

-- CreateEnum
CREATE TYPE "Measures" AS ENUM ('SUM', 'AVERAGE');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('EDIT_GRAPH', 'CREATE_GRAPH', 'VIEW_GRAPH', 'DELETE_GRAPH', 'EDIT_GRAPH_COLLECTION', 'CREATE_GRAPH_COLLECTION', 'VIEW_GRAPH_COLLECTION', 'DELETE_GRAPH_COLLECTION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permissions" "Permission"[];

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
    "groupBy" "Graph_Data_Unit" NOT NULL,
    "graphCollectionLinkId" TEXT,

    CONSTRAINT "Graph_pkey" PRIMARY KEY ("graphDataId")
);

-- CreateTable
CREATE TABLE "GraphData" (
    "id" TEXT NOT NULL,
    "type" "Graph_Data_Unit" NOT NULL,
    "measures" "Measures" NOT NULL,

    CONSTRAINT "GraphData_pkey" PRIMARY KEY ("id")
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
