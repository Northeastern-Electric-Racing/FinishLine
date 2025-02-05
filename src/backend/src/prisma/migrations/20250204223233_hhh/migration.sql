-- AlterTable
ALTER TABLE "_assignedBy" ADD CONSTRAINT "_assignedBy_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_assignedBy_AB_unique";

-- AlterTable
ALTER TABLE "_assignedTo" ADD CONSTRAINT "_assignedTo_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_assignedTo_AB_unique";

-- AlterTable
ALTER TABLE "_blockedBy" ADD CONSTRAINT "_blockedBy_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_blockedBy_AB_unique";

-- AlterTable
ALTER TABLE "_blocking" ADD CONSTRAINT "_blocking_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_blocking_AB_unique";

-- AlterTable
ALTER TABLE "_confirmedAttendee" ADD CONSTRAINT "_confirmedAttendee_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_confirmedAttendee_AB_unique";

-- AlterTable
ALTER TABLE "_deniedAttendee" ADD CONSTRAINT "_deniedAttendee_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_deniedAttendee_AB_unique";

-- AlterTable
ALTER TABLE "_favoritedBy" ADD CONSTRAINT "_favoritedBy_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_favoritedBy_AB_unique";

-- AlterTable
ALTER TABLE "_graphCars" ADD CONSTRAINT "_graphCars_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_graphCars_AB_unique";

-- AlterTable
ALTER TABLE "_optionalAttendee" ADD CONSTRAINT "_optionalAttendee_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_optionalAttendee_AB_unique";

-- AlterTable
ALTER TABLE "_organizationMembers" ADD CONSTRAINT "_organizationMembers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_organizationMembers_AB_unique";

-- AlterTable
ALTER TABLE "_proposedBlockedBy" ADD CONSTRAINT "_proposedBlockedBy_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_proposedBlockedBy_AB_unique";

-- AlterTable
ALTER TABLE "_proposedProjectTeams" ADD CONSTRAINT "_proposedProjectTeams_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_proposedProjectTeams_AB_unique";

-- AlterTable
ALTER TABLE "_receivedAnnouncements" ADD CONSTRAINT "_receivedAnnouncements_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_receivedAnnouncements_AB_unique";

-- AlterTable
ALTER TABLE "_requestedChangeRequestReviewers" ADD CONSTRAINT "_requestedChangeRequestReviewers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_requestedChangeRequestReviewers_AB_unique";

-- AlterTable
ALTER TABLE "_requiredAttendee" ADD CONSTRAINT "_requiredAttendee_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_requiredAttendee_AB_unique";

-- AlterTable
ALTER TABLE "_teamsAsLead" ADD CONSTRAINT "_teamsAsLead_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_teamsAsLead_AB_unique";

-- AlterTable
ALTER TABLE "_teamsAsMember" ADD CONSTRAINT "_teamsAsMember_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_teamsAsMember_AB_unique";

-- AlterTable
ALTER TABLE "_userAttended" ADD CONSTRAINT "_userAttended_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_userAttended_AB_unique";

-- AlterTable
ALTER TABLE "_userPopUps" ADD CONSTRAINT "_userPopUps_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_userPopUps_AB_unique";
