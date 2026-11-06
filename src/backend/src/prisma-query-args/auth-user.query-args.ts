import { Prisma } from '@prisma/client';

export type AuthUserQueryArgs = ReturnType<typeof getAuthUserQueryArgs>;

export const getAuthUserQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
      userSettings: true,
      organizations: true,
      teamsAsHead: {
        select: {
          teamId: true,
          financeTeam: true,
          operationsTeam: true
        }
      },
      teamsAsLead: {
        select: {
          financeTeam: true,
          operationsTeam: true,
          teamId: true
        }
      },
      teamsAsMember: {
        select: {
          financeTeam: true,
          operationsTeam: true,
          teamId: true
        }
      },
      roles: {
        where: {
          organizationId
        }
      },
      onboardingTeamTypes: {
        where: {
          organizationId
        }
      },
      onboardedTeamTypes: {
        where: {
          organizationId
        }
      }
    }
  });
