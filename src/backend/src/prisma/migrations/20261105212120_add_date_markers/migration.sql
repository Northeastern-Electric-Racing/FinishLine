-- CreateTable
CREATE TABLE "Date_Marker" (
    "dateMarkerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "color" TEXT,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "carId" TEXT,

    CONSTRAINT "Date_Marker_pkey" PRIMARY KEY ("dateMarkerId")
);

-- CreateIndex
CREATE INDEX "Date_Marker_organizationId_idx" ON "Date_Marker"("organizationId");

-- CreateIndex
CREATE INDEX "Date_Marker_carId_idx" ON "Date_Marker"("carId");

-- AddForeignKey
ALTER TABLE "Date_Marker" ADD CONSTRAINT "Date_Marker_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Date_Marker" ADD CONSTRAINT "Date_Marker_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Date_Marker" ADD CONSTRAINT "Date_Marker_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Date_Marker" ADD CONSTRAINT "Date_Marker_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("carId") ON DELETE SET NULL ON UPDATE CASCADE;
