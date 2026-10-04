import { Prisma } from '@prisma/client';

export type McpProjectTeamQueryArgs = ReturnType<typeof getMcpProjectTeamQueryArgs>;

export const userSelect = { select: { userId: true, firstName: true, lastName: true } } as const;

export type McpCurrentUserTeamQueryArgs = ReturnType<typeof getMcpCurrentUserTeamQueryArgs>;

/**
 * A team as seen by one of its people: only that user's own lead and member rows are selected, which
 * is enough to tell their position without loading everyone on the team.
 * @param userId the user whose position is being worked out
 * @param carNumber the car to list the team's projects for
 */
export const getMcpCurrentUserTeamQueryArgs = (userId: string, carNumber: number) =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    select: {
      teamName: true,
      headId: true,
      leads: { where: { userId }, select: { userId: true } },
      projects: {
        where: { wbsElement: { carNumber, dateDeleted: null } },
        orderBy: { wbsElement: { projectNumber: 'asc' } },
        select: { wbsElement: { select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true } } }
      }
    }
  });

export const getMcpProjectTeamQueryArgs = () =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    select: {
      teamName: true,
      head: userSelect,
      leads: userSelect,
      members: userSelect
    }
  });
