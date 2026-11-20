
-- AlterTable
ALTER TABLE "Bay_Dashboard_Slot" DROP COLUMN "rotationSeconds";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "appreciationsSlackChannelId" TEXT;

-- CreateTable
CREATE TABLE "Bay_Dashboard_Rotation" (
    "bayDashboardRotationId" TEXT NOT NULL,
    "size" "Bay_Dashboard_Widget_Size" NOT NULL,
    "rotationSeconds" INTEGER NOT NULL DEFAULT 30,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Rotation_pkey" PRIMARY KEY ("bayDashboardRotationId")
);

-- CreateIndex
CREATE INDEX "Bay_Dashboard_Rotation_organizationId_idx" ON "Bay_Dashboard_Rotation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Bay_Dashboard_Rotation_organizationId_size_key" ON "Bay_Dashboard_Rotation"("organizationId", "size");

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Rotation" ADD CONSTRAINT "Bay_Dashboard_Rotation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
