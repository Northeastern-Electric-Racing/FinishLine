-- CreateEnum
CREATE TYPE "Graph_Type" AS ENUM ('PROJECT_BUDGET_BY_PROJECT', 'PROJECT_BUDGET_BY_TEAM', 'PROJECT_BUDGET_BY_DIVISION', 'CHANGE_REQUESTS_BY_PROJECT', 'CHANGE_REQUESTS_BY_TEAM', 'CHANGE_REQUESTS_BY_DIVISION', 'REIMBURSEMENT_TOTAL_BY_PROJECT', 'REIMBURSEMENT_TOTAL_BY_TEAM', 'REIMBURSEMENT_TOTAL_BY_DIVISION');

-- CreateEnum
CREATE TYPE "Graph_Display_Type" AS ENUM ('PIE', 'BAR');

-- CreateEnum
CREATE TYPE "Measure" AS ENUM ('SUM', 'AVG');

-- CreateEnum
CREATE TYPE "Graph_Permission" AS ENUM ('EDIT_GRAPH', 'CREATE_GRAPH', 'VIEW_GRAPH', 'DELETE_GRAPH');

-- CreateEnum
CREATE TYPE "Graph_Collection_Permission" AS ENUM ('EDIT_GRAPH_COLLECTION', 'CREATE_GRAPH_COLLECTION', 'VIEW_GRAPH_COLLECTION', 'DELETE_GRAPH_COLLECTION');

-- CreateEnum
CREATE TYPE "Special_Permission" AS ENUM ('FINANCE_ONLY');

-- AlterTable
ALTER TABLE "Team_Type" ADD COLUMN     "dateDeleted" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "additionalPermissions" TEXT[];

-- CreateTable
CREATE TABLE "Graph" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "graphType" "Graph_Type" NOT NULL,
    "displayGraphType" "Graph_Display_Type" NOT NULL,
    "measure" "Measure" NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "specialPermissions" "Special_Permission"[],
    "graphCollectionId" TEXT,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,
    "carId" TEXT,

    CONSTRAINT "Graph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graph_Collection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "viewPermissions" "Special_Permission"[],
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Graph_Collection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Team_Type" ADD CONSTRAINT "Team_Type_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_graphCollectionId_fkey" FOREIGN KEY ("graphCollectionId") REFERENCES "Graph_Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph" ADD CONSTRAINT "Graph_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("carId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graph_Collection" ADD CONSTRAINT "Graph_Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
