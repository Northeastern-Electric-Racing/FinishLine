-- CreateEnum
CREATE TYPE "Graph_Type" AS ENUM ('BAR', 'LINE', 'PIE');

-- CreateEnum
CREATE TYPE "Measure" AS ENUM ('COUNT', 'SUM', 'AVG');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('EDIT_GRAPH', 'CREATE_GRAPH', 'VIEW_GRAPH', 'DELETE_GRAPH', 'EDIT_GRAPH_COLLECTION', 'CREATE_GRAPH_COLLECTION', 'VIEW_GRAPH_COLLECTION', 'DELETE_GRAPH_COLLECTION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "additionalPermissions" "Permission"[];

-- CreateTable
CREATE TABLE "Graph" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "graphType" "Graph_Type" NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalTable" TEXT NOT NULL,
    "finalColumn" TEXT NOT NULL,
    "groupByColumn" TEXT NOT NULL,
    "measure" "Measure" NOT NULL,
    "graphCollectionId" TEXT,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Graph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graph_Query" (
    "id" TEXT NOT NULL,
    "primaryKey" TEXT NOT NULL,
    "table" TEXT NOT NULL,
    "graphId" TEXT NOT NULL,

    CONSTRAINT "Graph_Query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graph_Collection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "viewPermissions" "Permission"[],
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Graph_Collection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_graphCollectionId_fkey" FOREIGN KEY ("graphCollectionId") REFERENCES "Graph_Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Query" ADD CONSTRAINT "Graph_Query_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "Graph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
