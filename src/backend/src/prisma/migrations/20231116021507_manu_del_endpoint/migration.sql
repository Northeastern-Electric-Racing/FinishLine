-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "dateDeleted" TIMESTAMP(3),
ADD COLUMN     "deletedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
