import { Prisma } from '@prisma/client';
import { getTeamQueryArgs } from './teams.query-args';

export type AuthUserQueryArgs = ReturnType<typeof getAuthUserQueryArgs>;

export const getAuthUserQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
      userSettings: true,
      teamsAsHead: {
        where: {
          organizationId
        },
        ...getTeamQueryArgs(organizationId)
      },
      organizations: true,
      teamsAsLead: {
        where: {
          organizationId
        },
        ...getTeamQueryArgs(organizationId)
      },
      teamsAsMember: {
        where: {
          organizationId
        }
      },
      favoriteProjects: {
        where: {
          wbsElement: {
            organizationId
          }
        }
      },
      roles: {
        where: {
          organizationId
        }
      },
      changeRequestsToReview: {
        where: {
          wbsElement: {
            organizationId
          }
        }
      }
    }
  });
