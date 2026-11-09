import { Prisma } from '@prisma/client';

export type AuthUserQueryArgs = ReturnType<typeof getAuthUserQueryArgs>;

export const getAuthUserQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
      userSettings: true,
      organizations: true,
      teamsAsHead: {
        where: { organizationId },
        select: {
          dateArchived: true,
          teamId: true,
          financeTeam: true,
          operationsTeam: true
        }
      },
      teamsAsLead: {
        where: { organizationId },
        select: {
          dateArchived: true,
          financeTeam: true,
          operationsTeam: true,
          teamId: true
        }
      },
      teamsAsMember: {
        where: { organizationId },
        select: {
          dateArchived: true,
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
