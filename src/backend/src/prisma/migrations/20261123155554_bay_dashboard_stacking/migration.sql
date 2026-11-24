/*
  Warnings:

  - You are about to drop the column `rotationSeconds` on the `Bay_Dashboard_Slot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bay_Dashboard_Slot" DROP COLUMN "rotationSeconds";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "appreciationsSlackChannelId" TEXT;

-- CreateTable
CREATE TABLE "Bay_Dashboard_Rotation" (
    "bayDashboardRotationId" TEXT NOT NULL,
    "size" "Bay_Dashboard_Widget_Size" NOT NULL,
    "rotationSeconds" INTEGER NOT NULL DEFAULT 30,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Rotation_pkey" PRIMARY KEY ("bayDashboardRotationId")
);

-- CreateIndex
CREATE INDEX "Bay_Dashboard_Rotation_organizationId_size_dateDeleted_idx" ON "Bay_Dashboard_Rotation"("organizationId", "size", "dateDeleted");

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Rotation" ADD CONSTRAINT "Bay_Dashboard_Rotation_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Rotation" ADD CONSTRAINT "Bay_Dashboard_Rotation_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Rotation" ADD CONSTRAINT "Bay_Dashboard_Rotation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
