-- AlterTable
ALTER TABLE "public"."Sponsor_Tier" 
ADD COLUMN     "dateDeleted" TIMESTAMP(3),
ADD COLUMN     "deleterId" TEXT,
ADD COLUMN     "threshold" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Vendor" ALTER COLUMN "addedByUserId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."Sponsor_Tier" ADD CONSTRAINT "Sponsor_Tier_deleterId_fkey" FOREIGN KEY ("deleterId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
