import { Prisma } from '@prisma/client';

export type TeamTypeQueryArgs = ReturnType<typeof getTeamTypeQueryArgs>;
export type TeamTypePreviewQueryArgs = ReturnType<typeof getTeamTypePreviewQueryArgs>;

export const getTeamTypeQueryArgs = () =>
  Prisma.validator<Prisma.Team_TypeDefaultArgs>()({
    select: {
      name: true
    }
  });

export const getTeamTypePreviewQueryArgs = () =>
  Prisma.validator<Prisma.Team_TypeDefaultArgs>()({
    select: {
      name: true
    }
  });
