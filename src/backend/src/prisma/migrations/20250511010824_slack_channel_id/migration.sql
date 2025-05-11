-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "sponsorshipNotificationsSlackChannelId" TEXT;

-- AlterTable
ALTER TABLE "Sponsor_Task" ADD COLUMN     "dateDeleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "password" DROP DEFAULT,
ALTER COLUMN "taxExempt" DROP DEFAULT,
ALTER COLUMN "username" DROP DEFAULT;
