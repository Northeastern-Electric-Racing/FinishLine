import { Prisma } from '@prisma/client';
import teamQueryArgs from './teams.query-args';

const authUserQueryArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    userSettings: true,
    teamAsLead: true,
    favoriteProjects: true,
    teams: {
      ...teamQueryArgs
    },
    changeRequestsToReview: true
  }
});

export default authUserQueryArgs;
