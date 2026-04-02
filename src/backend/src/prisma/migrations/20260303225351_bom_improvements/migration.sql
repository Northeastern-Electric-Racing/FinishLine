-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_manufacturerId_fkey";

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "manufacturerId" DROP NOT NULL,
ALTER COLUMN "manufacturerPartNumber" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "subtotal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reimbursement_Product" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reimbursement_Product" ADD COLUMN     "materialId" TEXT;

-- CreateIndex
CREATE INDEX "Reimbursement_Product_materialId_idx" ON "Reimbursement_Product"("materialId");

-- AddForeignKey
ALTER TABLE "Reimbursement_Product" ADD CONSTRAINT "Reimbursement_Product_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("materialId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DO $$
DECLARE
  material_record RECORD;
  new_reason_id TEXT;
BEGIN
  -- Loop through all materials that are linked to RRs but don't have products yet
  FOR material_record IN 
    SELECT 
      m."materialId",
      m."name",
      m."subtotal",
      m."wbsElementId",
      m."reimbursementRequestId"
    FROM "Material" m
    WHERE m."reimbursementRequestId" IS NOT NULL
      AND m."dateDeleted" IS NULL
      AND EXISTS (
        -- Only migrate if the RR isn't deleted
        SELECT 1 FROM "Reimbursement_Request" rr
        WHERE rr."reimbursementRequestId" = m."reimbursementRequestId"
          AND rr."dateDeleted" IS NULL
      )
      AND EXISTS (
        -- Only migrate if the WBS element isn't deleted
        SELECT 1 FROM "WBS_Element" wbs
        WHERE wbs."wbsElementId" = m."wbsElementId"
          AND wbs."dateDeleted" IS NULL
      )
      AND NOT EXISTS (
        -- Skip if a product already links to this material for this RR
        SELECT 1 FROM "Reimbursement_Product" rp
        WHERE rp."materialId" = m."materialId"
          AND rp."reimbursementRequestId" = m."reimbursementRequestId"
      )
  LOOP
    -- Create a new reason for this material (can't reuse due to @unique and one to one relation)
    INSERT INTO "Reimbursement_Product_Reason" (
      "reimbursementProductReasonId",
      "wbsElementId"
    ) VALUES (
      gen_random_uuid(),
      material_record."wbsElementId"
    )
    RETURNING "reimbursementProductReasonId" INTO new_reason_id;
    
    -- Create the product linked to the material
    INSERT INTO "Reimbursement_Product" (
      "reimbursementProductId",
      "name",
      "cost",
      "materialId",
      "reimbursementProductReasonId",
      "reimbursementRequestId"
    ) VALUES (
      gen_random_uuid(),
      material_record."name",
      COALESCE(material_record."subtotal", 0),
      material_record."materialId",
      new_reason_id,
      material_record."reimbursementRequestId"
    );
  END LOOP;
END $$;
