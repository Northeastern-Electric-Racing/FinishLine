import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';
import { getProjectGanttQueryArgs } from './projects.query-args.js';

export type TeamQueryArgs = ReturnType<typeof getTeamQueryArgs>;
export type TeamBaseQueryArgs = ReturnType<typeof getTeamBaseQueryArgs>;
export type TeamPreviewQueryArgs = ReturnType<typeof getTeamPreviewQueryArgs>;

export const getTeamQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    include: {
      members: getUserQueryArgs(organizationId),
      head: getUserQueryArgs(organizationId),
      leads: getUserQueryArgs(organizationId),
      userArchived: getUserQueryArgs(organizationId),
      teamType: true,
      projects: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        ...getProjectGanttQueryArgs(organizationId)
      }
    }
  });

export const getTeamBaseQueryArgs = () => {
  return Prisma.validator<Prisma.TeamDefaultArgs>()({
    include: {
      teamType: true
    }
  });
};

export const getTeamPreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    include: {
      members: getUserQueryArgs(organizationId),
      head: getUserQueryArgs(organizationId),
      leads: getUserQueryArgs(organizationId)
    }
  });
