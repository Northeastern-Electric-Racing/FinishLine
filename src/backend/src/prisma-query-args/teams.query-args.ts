import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type TeamQueryArgs = ReturnType<typeof getTeamQueryArgs>;

export const getTeamQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TeamArgs>()({
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
