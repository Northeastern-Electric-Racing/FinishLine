-- CreateEnum
CREATE TYPE "Bay_Dashboard_Widget_Size" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "Bay_Dashboard_Widget_Type" AS ENUM ('CALENDAR', 'OVERDUE_WORK_PACKAGES', 'TEXT_FIELD', 'COUNTDOWN', 'TIER_LIST', 'MBTA_TRACKER', 'SLACK_APPRECIATIONS', 'SLACK_MENTIONS');

-- CreateTable
CREATE TABLE "Bay_Dashboard_Config" (
    "bayDashboardConfigId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEdited" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userEditedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Config_pkey" PRIMARY KEY ("bayDashboardConfigId")
);

-- CreateTable
CREATE TABLE "Bay_Dashboard_Widget" (
    "bayDashboardWidgetId" TEXT NOT NULL,
    "type" "Bay_Dashboard_Widget_Type" NOT NULL,
    "size" "Bay_Dashboard_Widget_Size" NOT NULL,
    "bayDashboardConfigId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Widget_pkey" PRIMARY KEY ("bayDashboardWidgetId")
);

-- CreateTable
CREATE TABLE "Bay_Dashboard_Countdown" (
    "bayDashboardCountdownId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEdited" TIMESTAMP(3),
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userEditedId" TEXT,
    "userDeletedId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Countdown_pkey" PRIMARY KEY ("bayDashboardCountdownId")
);

-- CreateTable
CREATE TABLE "Bay_Dashboard_Text_Field" (
    "bayDashboardTextFieldId" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEdited" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userEditedId" TEXT,
    "bayDashboardWidgetId" TEXT NOT NULL,

    CONSTRAINT "Bay_Dashboard_Text_Field_pkey" PRIMARY KEY ("bayDashboardTextFieldId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bay_Dashboard_Config_organizationId_key" ON "Bay_Dashboard_Config"("organizationId");

-- CreateIndex
CREATE INDEX "Bay_Dashboard_Widget_bayDashboardConfigId_idx" ON "Bay_Dashboard_Widget"("bayDashboardConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "Bay_Dashboard_Widget_bayDashboardConfigId_size_key" ON "Bay_Dashboard_Widget"("bayDashboardConfigId", "size");

-- CreateIndex
CREATE INDEX "Bay_Dashboard_Countdown_organizationId_idx" ON "Bay_Dashboard_Countdown"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Bay_Dashboard_Text_Field_bayDashboardWidgetId_key" ON "Bay_Dashboard_Text_Field"("bayDashboardWidgetId");

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Config" ADD CONSTRAINT "Bay_Dashboard_Config_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Config" ADD CONSTRAINT "Bay_Dashboard_Config_userEditedId_fkey" FOREIGN KEY ("userEditedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Config" ADD CONSTRAINT "Bay_Dashboard_Config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Widget" ADD CONSTRAINT "Bay_Dashboard_Widget_bayDashboardConfigId_fkey" FOREIGN KEY ("bayDashboardConfigId") REFERENCES "Bay_Dashboard_Config"("bayDashboardConfigId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Countdown" ADD CONSTRAINT "Bay_Dashboard_Countdown_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Countdown" ADD CONSTRAINT "Bay_Dashboard_Countdown_userEditedId_fkey" FOREIGN KEY ("userEditedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Countdown" ADD CONSTRAINT "Bay_Dashboard_Countdown_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Countdown" ADD CONSTRAINT "Bay_Dashboard_Countdown_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Text_Field" ADD CONSTRAINT "Bay_Dashboard_Text_Field_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Text_Field" ADD CONSTRAINT "Bay_Dashboard_Text_Field_userEditedId_fkey" FOREIGN KEY ("userEditedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bay_Dashboard_Text_Field" ADD CONSTRAINT "Bay_Dashboard_Text_Field_bayDashboardWidgetId_fkey" FOREIGN KEY ("bayDashboardWidgetId") REFERENCES "Bay_Dashboard_Widget"("bayDashboardWidgetId") ON DELETE CASCADE ON UPDATE CASCADE;
