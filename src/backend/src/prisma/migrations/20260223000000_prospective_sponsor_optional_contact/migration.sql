-- Make contact fields optional on Prospective_Sponsor for NOT_IN_CONTACT status
-- Make lastContactDate optional
ALTER TABLE "Prospective_Sponsor" ALTER COLUMN "lastContactDate" DROP NOT NULL;

-- Make firstContactMethod optional
ALTER TABLE "Prospective_Sponsor" ALTER COLUMN "firstContactMethod" DROP NOT NULL;

-- Make contactorUserId optional
ALTER TABLE "Prospective_Sponsor" ALTER COLUMN "contactorUserId" DROP NOT NULL;

-- Make contactId optional
ALTER TABLE "Prospective_Sponsor" ALTER COLUMN "contactId" DROP NOT NULL;

-- Change default status from IN_PROGRESS to NOT_IN_CONTACT
ALTER TABLE "Prospective_Sponsor" ALTER COLUMN "status" SET DEFAULT 'NOT_IN_CONTACT'::"Prospective_Sponsor_Status";
