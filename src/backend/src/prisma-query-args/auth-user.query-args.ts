import { Prisma } from '@prisma/client';

export type AuthUserQueryArgs = ReturnType<typeof getAuthUserQueryArgs>;

export const getAuthUserQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
      userSettings: true,
      teamsAsHead: {
        where: {
          organizationId
        }
      },
      organizations: true,
      onboardingChecklists: {
        include: {
          checklistItems: {
            include: {
              subtasks: true,
              usersChecked: true
            }
          }
        }
      },
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
