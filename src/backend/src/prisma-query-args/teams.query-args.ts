import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getWorkPackageQueryArgs } from './work-packages.query-args';

export type TeamQueryArgs = ReturnType<typeof getTeamQueryArgs>;

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
        include: {
          wbsElement: true,
          workPackages: getWorkPackageQueryArgs(organizationId)
        }
      }
    }
  });
