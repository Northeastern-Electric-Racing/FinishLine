import { Prisma } from '@prisma/client';
import projectQueryArgs from './projects.query-args';

const authUserQueryArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    userSettings: true,
    teamAsLead: true,
    favoriteProjects: {...projectQueryArgs}
  }
});

export default authUserQueryArgs;
