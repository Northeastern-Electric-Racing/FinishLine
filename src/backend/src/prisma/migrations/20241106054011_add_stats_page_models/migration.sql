-- CreateEnum
CREATE TYPE "Graph_Type" AS ENUM ('BAR', 'LINE', 'PIE');

-- CreateEnum
CREATE TYPE "Graph_Data_Unit" AS ENUM ('CAR', 'PROJECT', 'TEAM', 'CHANGE_REQUEST', 'BUDGET', 'WORK_PACKAGE', 'REIMBURSEMENT', 'DESIGN_REVIEW', 'USER');

-- CreateEnum
CREATE TYPE "Measure" AS ENUM ('SUM', 'AVERAGE');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('EDIT_GRAPH', 'CREATE_GRAPH', 'VIEW_GRAPH', 'DELETE_GRAPH', 'EDIT_GRAPH_COLLECTION', 'CREATE_GRAPH_COLLECTION', 'VIEW_GRAPH_COLLECTION', 'DELETE_GRAPH_COLLECTION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permissions" "Permission"[];

-- CreateTable
CREATE TABLE "Graph" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "graphType" "Graph_Type" NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "groupBy" "Graph_Data_Unit" NOT NULL,
    "graphCollectionLinkId" TEXT,

    CONSTRAINT "Graph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graph_Data" (
    "id" TEXT NOT NULL,
    "type" "Graph_Data_Unit" NOT NULL,
    "measure" "Measure" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "graphId" TEXT NOT NULL,

    CONSTRAINT "Graph_Data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graph_Collection" (
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateDeleted" TIMESTAMP(3),
    "permissions" "Permission"[],

    CONSTRAINT "Graph_Collection_pkey" PRIMARY KEY ("linkId")
);

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_graphCollectionLinkId_fkey" FOREIGN KEY ("graphCollectionLinkId") REFERENCES "Graph_Collection"("linkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Data" ADD CONSTRAINT "Graph_Data_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "Graph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
