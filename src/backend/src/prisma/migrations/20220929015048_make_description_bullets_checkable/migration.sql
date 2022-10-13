-- AlterTable
ALTER TABLE "Description_Bullet" ADD COLUMN     "dateTimeChecked" TIMESTAMP(3),
ADD COLUMN     "userCheckedId" INTEGER;

-- AddForeignKey
ALTER TABLE "Description_Bullet" ADD CONSTRAINT "Description_Bullet_userCheckedId_fkey" FOREIGN KEY ("userCheckedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
