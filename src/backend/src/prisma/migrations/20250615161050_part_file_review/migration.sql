-- CreateEnum
CREATE TYPE "Review_Status" AS ENUM ('IN_PROGRESS', 'READY_FOR_REVIEW', 'IN_REVIEW', 'REVIEWED', 'APPROVED');


-- DropForeignKey
ALTER TABLE "FrequentlyAskedQuestion" DROP CONSTRAINT "FrequentlyAskedQuestion_organizationId_fkey";

-- AlterTable
ALTER TABLE "FrequentlyAskedQuestion" RENAME COLUMN "organizationId" TO "regularFaqOrgId";
ALTER TABLE "FrequentlyAskedQuestion" ALTER "regularFaqOrgId" DROP NOT NULL;
ALTER TABLE "FrequentlyAskedQuestion" ADD COLUMN     "partReviewFaqOrgId" TEXT;

-- Custom constriant so every faq is either a regular faq or a part review faq
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "at_least_one_field_required" CHECK ("regularFaqOrgId" IS NOT NULL OR "partReviewFaqOrgId" IS NOT NULL);

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "partReviewGuideLink" TEXT,
ADD COLUMN     "partReviewSampleImageId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "abbreviation" TEXT;

-- AlterTable
ALTER TABLE "_Project_TemplateToTeam" ADD CONSTRAINT "_Project_TemplateToTeam_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_Project_TemplateToTeam_AB_unique";

-- CreateTable
CREATE TABLE "Part" (
    "partId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "commonName" TEXT NOT NULL,
    "description" TEXT,
    "previewImageId" TEXT,
    "status" "Review_Status" NOT NULL DEFAULT 'IN_PROGRESS',
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("partId")
);

-- CreateTable
CREATE TABLE "Part_Tag" (
    "partTagId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHexCode" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Part_Tag_pkey" PRIMARY KEY ("partTagId")
);

-- CreateTable
CREATE TABLE "Part_Submission" (
    "partSubmissionId" TEXT NOT NULL,
    "fileIds" TEXT[],
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "partId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,

    CONSTRAINT "Part_Submission_pkey" PRIMARY KEY ("partSubmissionId")
);

-- CreateTable
CREATE TABLE "Part_Review_Request" (
    "partReviewRequestId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),

    CONSTRAINT "Part_Review_Request_pkey" PRIMARY KEY ("partReviewRequestId")
);

-- CreateTable
CREATE TABLE "Part_Review" (
    "partReviewId" TEXT NOT NULL,
    "fileIds" TEXT[],
    "notes" TEXT,
    "submissionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userDeletedId" TEXT,

    CONSTRAINT "Part_Review_pkey" PRIMARY KEY ("partReviewId")
);

-- CreateTable
CREATE TABLE "Part_Review_Popup" (
    "partReviewPopupId" TEXT NOT NULL,
    "xCoord" DOUBLE PRECISION NOT NULL,
    "yCoord" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "fileIndex" INTEGER NOT NULL,
    "description" TEXT,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Part_Review_Popup_pkey" PRIMARY KEY ("partReviewPopupId")
);

-- CreateTable
CREATE TABLE "Part_Review_Common_Mistake" (
    "partReviewCommonMistakeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Part_Review_Common_Mistake_pkey" PRIMARY KEY ("partReviewCommonMistakeId")
);

-- CreateTable
CREATE TABLE "_PartToPart_Tag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PartToPart_Tag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_partAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_partAssignees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Part_projectId_index_key" ON "Part"("projectId", "index");

-- CreateIndex
CREATE INDEX "_PartToPart_Tag_B_index" ON "_PartToPart_Tag"("B");

-- CreateIndex
CREATE INDEX "_partAssignees_B_index" ON "_partAssignees"("B");

-- AddForeignKey
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_regularFaqOrgId_fkey" FOREIGN KEY ("regularFaqOrgId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequentlyAskedQuestion" ADD CONSTRAINT "FrequentlyAskedQuestion_partReviewFaqOrgId_fkey" FOREIGN KEY ("partReviewFaqOrgId") REFERENCES "Organization"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Tag" ADD CONSTRAINT "Part_Tag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Submission" ADD CONSTRAINT "Part_Submission_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("partId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Submission" ADD CONSTRAINT "Part_Submission_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Submission" ADD CONSTRAINT "Part_Submission_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Request" ADD CONSTRAINT "Part_Review_Request_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("partId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Request" ADD CONSTRAINT "Part_Review_Request_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Request" ADD CONSTRAINT "Part_Review_Request_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review" ADD CONSTRAINT "Part_Review_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Part_Submission"("partSubmissionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review" ADD CONSTRAINT "Part_Review_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review" ADD CONSTRAINT "Part_Review_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Popup" ADD CONSTRAINT "Part_Review_Popup_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Part_Review"("partReviewId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Common_Mistake" ADD CONSTRAINT "Part_Review_Common_Mistake_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Common_Mistake" ADD CONSTRAINT "Part_Review_Common_Mistake_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Common_Mistake" ADD CONSTRAINT "Part_Review_Common_Mistake_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartToPart_Tag" ADD CONSTRAINT "_PartToPart_Tag_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("partId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartToPart_Tag" ADD CONSTRAINT "_PartToPart_Tag_B_fkey" FOREIGN KEY ("B") REFERENCES "Part_Tag"("partTagId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partAssignees" ADD CONSTRAINT "_partAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("partId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partAssignees" ADD CONSTRAINT "_partAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
