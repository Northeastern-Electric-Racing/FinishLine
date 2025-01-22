-- CreateEnum
CREATE TYPE "Review_Status" AS ENUM ('NA', 'READY_FOR_REVIEW', 'IN_REVIEW', 'REVIEWED', 'APPROVED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "abbreviation" TEXT;

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "commonName" TEXT NOT NULL,
    "description" TEXT,
    "previewImageLink" TEXT,
    "status" "Review_Status" NOT NULL DEFAULT 'NA',
    "projectId" TEXT NOT NULL,
    "history" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "PartTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "files" TEXT[],
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "partId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "files" TEXT[],
    "notes" TEXT,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dateDeleted" TIMESTAMP(3),
    "userCreatedId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userDeletedId" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part_Review_Popup" (
    "id" TEXT NOT NULL,
    "xCoord" DOUBLE PRECISION NOT NULL,
    "yCoord" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_Review_Popup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartReviewFAQ" (
    "faqId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "part_Review_Admin_ToolsOrganizationId" TEXT,

    CONSTRAINT "PartReviewFAQ_pkey" PRIMARY KEY ("faqId")
);

-- CreateTable
CREATE TABLE "CommonMistake" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL,
    "userCreatedId" TEXT NOT NULL,
    "userDeletedId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "part_Review_Admin_ToolsOrganizationId" TEXT,

    CONSTRAINT "CommonMistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part_Review_Admin_Tools" (
    "organizationId" TEXT NOT NULL,
    "sampleDrawingLink" TEXT NOT NULL,
    "confluenceDrawingGuideLink" TEXT NOT NULL,

    CONSTRAINT "Part_Review_Admin_Tools_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "_PartToPartTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PartAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PartReviewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PartToPartTag_AB_unique" ON "_PartToPartTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PartToPartTag_B_index" ON "_PartToPartTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PartAssignees_AB_unique" ON "_PartAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_PartAssignees_B_index" ON "_PartAssignees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PartReviewers_AB_unique" ON "_PartReviewers"("A", "B");

-- CreateIndex
CREATE INDEX "_PartReviewers_B_index" ON "_PartReviewers"("B");

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartTag" ADD CONSTRAINT "PartTag_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Part_Review_Admin_Tools"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Popup" ADD CONSTRAINT "Part_Review_Popup_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReviewFAQ" ADD CONSTRAINT "PartReviewFAQ_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReviewFAQ" ADD CONSTRAINT "PartReviewFAQ_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReviewFAQ" ADD CONSTRAINT "PartReviewFAQ_part_Review_Admin_ToolsOrganizationId_fkey" FOREIGN KEY ("part_Review_Admin_ToolsOrganizationId") REFERENCES "Part_Review_Admin_Tools"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommonMistake" ADD CONSTRAINT "CommonMistake_userCreatedId_fkey" FOREIGN KEY ("userCreatedId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommonMistake" ADD CONSTRAINT "CommonMistake_userDeletedId_fkey" FOREIGN KEY ("userDeletedId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommonMistake" ADD CONSTRAINT "CommonMistake_part_Review_Admin_ToolsOrganizationId_fkey" FOREIGN KEY ("part_Review_Admin_ToolsOrganizationId") REFERENCES "Part_Review_Admin_Tools"("organizationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part_Review_Admin_Tools" ADD CONSTRAINT "Part_Review_Admin_Tools_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartToPartTag" ADD CONSTRAINT "_PartToPartTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartToPartTag" ADD CONSTRAINT "_PartToPartTag_B_fkey" FOREIGN KEY ("B") REFERENCES "PartTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartAssignees" ADD CONSTRAINT "_PartAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartAssignees" ADD CONSTRAINT "_PartAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartReviewers" ADD CONSTRAINT "_PartReviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartReviewers" ADD CONSTRAINT "_PartReviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
