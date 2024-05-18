import { Prisma } from '@prisma/client';

export type AuthUserQueryArgs = ReturnType<typeof getAuthUserQueryArgs>;

export const getAuthUserQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.UserArgs>()({
    include: {
      userSettings: true,
      teamsAsHead: {
        where: {
          organizationId
        }
      },
      organizations: true,
      teamsAsLead: {
        where: {
          organizationId
        }
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
