import { Prisma } from '@prisma/client';

export const teamRelationArgs = Prisma.validator<Prisma.TeamArgs>()({
  include: {
    members: true,
    leader: true,
    projects: {
      include: {
        wbsElement: true
      }
    }
  }
});
