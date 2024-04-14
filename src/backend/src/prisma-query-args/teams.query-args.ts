import { Prisma } from '@prisma/client';

const teamQueryArgs = Prisma.validator<Prisma.TeamArgs>()({
  include: {
    members: true,
    head: true,
    leads: true,
    userArchived: true,
    teamType: true,
    projects: {
      where: {
        wbsElement: {
          dateDeleted: null
        }
      },
      include: {
        wbsElement: true,
        workPackages: {
          include: {
            wbsElement: true
          }
        }
      }
    }
  }
});

export default teamQueryArgs;
