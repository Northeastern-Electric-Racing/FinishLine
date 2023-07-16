import { Prisma } from '@prisma/client';

const authUserQueryArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    userSettings: true,
    teamAsHead: true,
    favoriteProjects: true,
    changeRequestsToReview: true
  }
});

export default authUserQueryArgs;
