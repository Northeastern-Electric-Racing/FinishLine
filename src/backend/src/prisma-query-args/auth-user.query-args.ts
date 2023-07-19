import { Prisma } from '@prisma/client';
import teamQueryArgs from './teams.query-args';

const authUserQueryArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    userSettings: true,
    teamAsHead: true,
    favoriteProjects: true,
    teamsAsLead: {
      ...teamQueryArgs
    },
    teamsAsMember: {
      ...teamQueryArgs
    },
    changeRequestsToReview: true
  }
});

export default authUserQueryArgs;
