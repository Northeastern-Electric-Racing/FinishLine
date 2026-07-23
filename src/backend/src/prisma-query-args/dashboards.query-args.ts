import { Prisma } from '@prisma/client';

export type DashboardQueryArgs = ReturnType<typeof getDashboardQueryArgs>;

export const getDashboardQueryArgs = (_organizationId: string) =>
  Prisma.validator<Prisma.DashboardDefaultArgs>()({
    include: {}
  });
