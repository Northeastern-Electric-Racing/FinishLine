-- AlterEnum
ALTER TYPE "public"."Reimbursement_Status_Type" ADD VALUE 'PENDING_SABO_SUBMISSION';

-- CreateTable
CREATE TABLE "public"."_financeDelegates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_financeDelegates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_financeDelegates_B_index" ON "public"."_financeDelegates"("B");

-- AddForeignKey
ALTER TABLE "public"."_financeDelegates" ADD CONSTRAINT "_financeDelegates_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Organization"("organizationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_financeDelegates" ADD CONSTRAINT "_financeDelegates_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
