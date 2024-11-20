import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type GraphQueryArgs = ReturnType<typeof getGraphQueryArgs>;

export const getGraphQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.GraphDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      data: true
    }
  });

export type GraphCollectionQueryArgs = ReturnType<typeof getGraphCollectionQueryArgs>;

export const getGraphCollectionQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.GraphCollectionDefaultArgs>()({
    include: {
      graphs: getGraphQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId)
    }
  });
