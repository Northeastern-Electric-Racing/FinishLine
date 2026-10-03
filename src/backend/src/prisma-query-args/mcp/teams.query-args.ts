import { Prisma } from '@prisma/client';

export type McpProjectTeamQueryArgs = ReturnType<typeof getMcpProjectTeamQueryArgs>;

export const userSelect = { select: { userId: true, firstName: true, lastName: true } } as const;

export const getMcpProjectTeamQueryArgs = () =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    select: {
      teamName: true,
      head: userSelect,
      leads: userSelect,
      members: userSelect
    }
  });
