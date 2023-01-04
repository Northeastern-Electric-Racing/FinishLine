import { Prisma } from '@prisma/client';

const teamQueryArgs = Prisma.validator<Prisma.TeamArgs>()({
  include: {
    members: true,
    leader: true,
    projects: {
      where: {
        wbsElement: {
          dateDeleted: null
        }
      },
      include: {
        wbsElement: true
      }
    }
  }
});

export default teamQueryArgs;
