-- CreateEnum
CREATE TYPE "Slack_Mention_Type" AS ENUM ('USER', 'CHANNEL');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "mention" "Slack_Mention_Type" NOT NULL DEFAULT 'USER';
