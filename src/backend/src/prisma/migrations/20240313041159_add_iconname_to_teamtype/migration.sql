/*
  Warnings:

  - Added the required column `iconName` to the `TeamType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamType" ADD COLUMN     "iconName" TEXT NOT NULL;
