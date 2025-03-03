-- CreateEnum
CREATE TYPE "Review_Status" AS ENUM ('IN_PROGRESS', 'READY_FOR_REVIEW', 'IN_REVIEW', 'REVIEWED', 'APPROVED');

-- DropForeignKey
ALTER TABLE "FrequentlyAskedQuestion" DROP CONSTRAINT "FrequentlyAskedQuestion_organizationId_fkey";
ALTER TABLE "FrequentlyAskedQuestion" RENAME COLUMN "organizationId" TO "regularFaqOrgId";
ALTER TABLE "FrequentlyAskedQuestion" ALTER "regularFaqOrgId" DROP NOT NULL;
ALTER TABLE "FrequentlyAskedQuestion" ADD COLUMN     "partReviewFaqOrgId" TEXT;
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_regularFaqOrgId_fkey" FOREIGN KEY ("regularFaqOrgId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_partReviewFaqOrgId_fkey" FOREIGN KEY ("partReviewFaqOrgId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;
-- Add constriant so every faq is either a reulage faq or a part review faq
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "at_least_one_field_required" CHECK ("regularFaqOrgId" IS NOT NULL OR "partReviewFaqOrgId" IS NOT NULL);
ALTER TABLE "FrequentlyAskedQuestion" ALTER COLUMN "regularFaqOrgId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "partReviewSampleImageId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "abbreviation" TEXT;

-- CreateTable
CREATE TABLE "Part" (
    "partId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "commonName" TEXT NOT NULL,
    "description" TEXT,
    "previewImageLink" TEXT,
    "status" "Review_Status" NOT NULL DEFAULT 'IN_PROGRESS',
    "projectId" TEXT NOT NULL,
    "history" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("partId")
);

-- CreateTable
CREATE TABLE "PartTag" (
    "partTagId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHexCode" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "PartTag_pkey" PRIMARY KEY ("partTagId")
);

-- CreateTable
CREATE TABLE "PartSubmission" (
    "id" TEXT NOT NULL,
    "fileIds" TEXT[],
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "partId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,

    CONSTRAINT "PartSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartReview" (
    "partReviewId" TEXT NOT NULL,
    "fileIds" TEXT[],
    "notes" TEXT,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userDeletedId" TEXT,

    CONSTRAINT "PartReview_pkey" PRIMARY KEY ("partReviewId")
);

-- CreateTable
CREATE TABLE "Part_Review_Popup" (
    "partReviewPopupId" TEXT NOT NULL,
    "xCoord" DOUBLE PRECISION NOT NULL,
    "yCoord" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAd" TIMESTAMP(3),

    CONSTRAINT "Part_Review_Popup_pkey" PRIMARY KEY ("partReviewPopupId")
);

-- CreateTable
CREATE TABLE "PartReviewCommonMistake" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "PartReviewCommonMistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PartToPartTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_partAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_partReviewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PartToPartTag_AB_unique" ON "_PartToPartTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PartToPartTag_B_index" ON "_PartToPartTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_partAssignees_AB_unique" ON "_partAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_partAssignees_B_index" ON "_partAssignees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_partReviewers_AB_unique" ON "_partReviewers"("A", "B");

-- CreateIndex
CREATE INDEX "_partReviewers_B_index" ON "_partReviewers"("B");

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartTag" ADD CONSTRAINT "PartTag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartSubmission" ADD CONSTRAINT "PartSubmission_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("partId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartSubmission" ADD CONSTRAINT "PartSubmission_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartSubmission" ADD CONSTRAINT "PartSubmission_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReview" ADD CONSTRAINT "PartReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "PartSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReview" ADD CONSTRAINT "PartReview_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReview" ADD CONSTRAINT "PartReview_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Popup" ADD CONSTRAINT "Part_Review_Popup_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "PartReview"("partReviewId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReviewCommonMistake" ADD CONSTRAINT "PartReviewCommonMistake_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReviewCommonMistake" ADD CONSTRAINT "PartReviewCommonMistake_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReviewCommonMistake" ADD CONSTRAINT "PartReviewCommonMistake_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartToPartTag" ADD CONSTRAINT "_PartToPartTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("partId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartToPartTag" ADD CONSTRAINT "_PartToPartTag_B_fkey" FOREIGN KEY ("B") REFERENCES "PartTag"("partTagId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partAssignees" ADD CONSTRAINT "_partAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("partId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partAssignees" ADD CONSTRAINT "_partAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partReviewers" ADD CONSTRAINT "_partReviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("partId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partReviewers" ADD CONSTRAINT "_partReviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
