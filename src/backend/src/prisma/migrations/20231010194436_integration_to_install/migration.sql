-- AlterEnum
CREATE TYPE "Work_Package_Stage_new" AS ENUM ('RESEARCH', 'DESIGN', 'MANUFACTURING', 'INSTALL');
ALTER TABLE "Work_Package" ALTER COLUMN "stage" TYPE "Work_Package_Stage_new" USING (
  CASE "stage"::text
    WHEN 'INTEGRATION' THEN 'INSTALL'::"Work_Package_Stage_new"
    ELSE "stage"::text::"Work_Package_Stage_new"
  END);
ALTER TYPE "Work_Package_Stage" RENAME TO "Work_Package_Stage_old";
ALTER TYPE "Work_Package_Stage_new" RENAME TO "Work_Package_Stage";
DROP TYPE "Work_Package_Stage_old";
