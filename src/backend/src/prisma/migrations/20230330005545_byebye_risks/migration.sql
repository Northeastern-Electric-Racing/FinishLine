/*
  Warnings:

  - You are about to drop the `Risk` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Risk" DROP CONSTRAINT "Risk_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Risk" DROP CONSTRAINT "Risk_deletedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Risk" DROP CONSTRAINT "Risk_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Risk" DROP CONSTRAINT "Risk_resolvedByUserId_fkey";

-- DropTable
DROP TABLE "Risk";
