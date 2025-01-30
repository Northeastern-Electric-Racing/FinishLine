import { Prisma } from '@prisma/client';
import { TeamType } from 'shared';

export const teamTypeTransformer = (teamType: Prisma.Team_TypeGetPayload<null>): TeamType => {
  return {
    ...teamType,
    dateDeleted: teamType.dateDeleted ?? undefined,
    deletedById: teamType.deletedById ?? undefined
  };
};
