-- AlterTable
ALTER TABLE "Change_Request" ADD COLUMN     "dateDeleted" TIMESTAMP(3),
ADD COLUMN     "deletedByUserId" INTEGER;

-- AlterTable
ALTER TABLE "WBS_Element" ADD COLUMN     "dateDeleted" TIMESTAMP(3),
ADD COLUMN     "deletedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Change_Request" ADD CONSTRAINT "Change_Request_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS_Element" ADD CONSTRAINT "WBS_Element_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
