-- AlterTable
ALTER TABLE "Work_Package_Template" ALTER COLUMN "templateName" DROP NOT NULL,
ALTER COLUMN "templateNotes" DROP NOT NULL,
ALTER COLUMN "stage" DROP NOT NULL;
