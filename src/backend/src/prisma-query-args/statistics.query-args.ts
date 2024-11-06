import { Prisma } from '@prisma/client';
import { getUserQueryArgs, getUserWithSettingsQueryArgs } from './user.query-args';

export type GraphQueryArgs = ReturnType<typeof getGraphQueryArgs>;
export type GraphDataQueryArgs = ReturnType<typeof getGraphDataQueryArgs>;
export type GraphCollectionQueryArgs = ReturnType<typeof getGraphCollectionQueryArgs>;

export const getGraphQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.GraphDefaultArgs>()({
    include: {
      organization: true,
      userCreated: getUserWithSettingsQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      data: {
        select: {
          id: true,
          graphId: true,
          type: true,
          measure: true,
          value: true
        }
      }
    }
  });

export const getGraphDataQueryArgs = (): Prisma.Graph_DataDefaultArgs =>
  Prisma.validator<Prisma.Graph_DataDefaultArgs>()({
    select: {
      id: true,
      type: true,
      measure: true,
      value: true,
      graphId: true
    }
  });

export const getGraphCollectionQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Graph_CollectionDefaultArgs>()({
    include: {
      graphs: getGraphQueryArgs(organizationId),
      organization: true,
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId)
    }
  });
