/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `User_Secure_Settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `User_Secure_Settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User_Secure_Settings" ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_Secure_Settings_phoneNumber_key" ON "User_Secure_Settings"("phoneNumber");
