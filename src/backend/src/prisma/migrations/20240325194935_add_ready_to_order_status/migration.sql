/*
  Warnings:

  - The values [UNORDERED] on the enum `Material_Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Material_Status_new" AS ENUM ('RECEIVED', 'ORDERED', 'SHIPPED', 'NOT_READY_TO_ORDER', 'READY_TO_ORDER');
ALTER TABLE "Material" ALTER COLUMN "status" TYPE "Material_Status_new" USING (
  CASE "status"::text
    WHEN 'UNORDERED' THEN 'NOT_READY_TO_ORDER'::"Material_Status_new"
    ELSE "status"::text::"Material_Status_new"
  END);
ALTER TYPE "Material_Status" RENAME TO "Material_Status_old";
ALTER TYPE "Material_Status_new" RENAME TO "Material_Status";
DROP TYPE "Material_Status_old";
COMMIT;
