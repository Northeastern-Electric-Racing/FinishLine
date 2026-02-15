-- CreateEnum
CREATE TYPE "Sponsor_Value_Type" AS ENUM ('MONETARY', 'STOCK', 'DISCOUNT');

-- AlterTable: Sponsor
ALTER TABLE "Sponsor"
ADD COLUMN     "valueTypes" "Sponsor_Value_Type"[] DEFAULT ARRAY['MONETARY']::"Sponsor_Value_Type"[],
ADD COLUMN     "stockDescription" TEXT,
ADD COLUMN     "discountDescription" TEXT;

-- Make sponsorValue nullable
ALTER TABLE "Sponsor" ALTER COLUMN "sponsorValue" DROP NOT NULL;

-- AlterTable: Prospective_Sponsor (add notes)
ALTER TABLE "Prospective_Sponsor" ADD COLUMN "notes" TEXT;
