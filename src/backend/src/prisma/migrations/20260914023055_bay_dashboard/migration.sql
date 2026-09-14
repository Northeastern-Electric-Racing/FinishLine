-- CreateEnum
CREATE TYPE "Bay_Dashboard_Widget_Size" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "Bay_Dashboard_Widget_Type" AS ENUM ('CALENDAR', 'OVERDUE_WORK_PACKAGES', 'TEXT_FIELD', 'TIER_LIST', 'MBTA_TRACKER', 'SLACK_APPRECIATIONS', 'SLACK_MENTIONS');

-- CreateTable
CREATE TABLE "Bay_Dashboard_Config" (
    "bayDashboardConfigId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Config_pkey" PRIMARY KEY ("bayDashboardConfigId")
);

-- CreateTable
CREATE TABLE "Bay_Dashboard_Slot" (
    "bayDashboardSlotId" TEXT NOT NULL,
    "size" "Bay_Dashboard_Widget_Size" NOT NULL,
    "position" INTEGER NOT NULL,
    "rotationSeconds" INTEGER NOT NULL DEFAULT 30,
    "bayDashboardConfigId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Slot_pkey" PRIMARY KEY ("bayDashboardSlotId")
);

-- CreateTable
CREATE TABLE "Bay_Dashboard_Widget" (
    "bayDashboardWidgetId" TEXT NOT NULL,
    "type" "Bay_Dashboard_Widget_Type" NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT,
    "bayDashboardSlotId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Widget_pkey" PRIMARY KEY ("bayDashboardWidgetId")
);

-- CreateTable
CREATE TABLE "Bay_Dashboard_Countdown" (
    "bayDashboardCountdownId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Countdown_pkey" PRIMARY KEY ("bayDashboardCountdownId")
);

-- CreateIndex
CREATE INDEX "Bay_Dashboard_Config_organizationId_idx" ON "Bay_Dashboard_Config"("organizationId");

-- CreateIndex
CREATE INDEX "Bay_Dashboard_Slot_bayDashboardConfigId_idx" ON "Bay_Dashboard_Slot"("bayDashboardConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "Bay_Dashboard_Slot_bayDashboardConfigId_position_key" ON "Bay_Dashboard_Slot"("bayDashboardConfigId", "position");

-- CreateIndex
CREATE INDEX "Bay_Dashboard_Widget_bayDashboardSlotId_idx" ON "Bay_Dashboard_Widget"("bayDashboardSlotId");

-- CreateIndex
CREATE UNIQUE INDEX "Bay_Dashboard_Widget_bayDashboardSlotId_order_key" ON "Bay_Dashboard_Widget"("bayDashboardSlotId", "order");

-- CreateIndex
CREATE INDEX "Bay_Dashboard_Countdown_organizationId_idx" ON "Bay_Dashboard_Countdown"("organizationId");

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Config" ADD CONSTRAINT "Bay_Dashboard_Config_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Config" ADD CONSTRAINT "Bay_Dashboard_Config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Slot" ADD CONSTRAINT "Bay_Dashboard_Slot_bayDashboardConfigId_fkey" FOREIGN KEY ("bayDashboardConfigId") REFERENCES "Bay_Dashboard_Config"("bayDashboardConfigId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Widget" ADD CONSTRAINT "Bay_Dashboard_Widget_bayDashboardSlotId_fkey" FOREIGN KEY ("bayDashboardSlotId") REFERENCES "Bay_Dashboard_Slot"("bayDashboardSlotId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Countdown" ADD CONSTRAINT "Bay_Dashboard_Countdown_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Countdown" ADD CONSTRAINT "Bay_Dashboard_Countdown_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Countdown" ADD CONSTRAINT "Bay_Dashboard_Countdown_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
