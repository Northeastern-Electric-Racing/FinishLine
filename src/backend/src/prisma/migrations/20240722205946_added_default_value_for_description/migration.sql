/*
  Warnings:

  - Made the column `description` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "description" SET NOT NULL;
