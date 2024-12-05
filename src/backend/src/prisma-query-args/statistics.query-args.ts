import { Prisma } from '@prisma/client';
import { getUserQueryArgs, getUserWithSettingsQueryArgs } from './user.query-args';

export type GraphQueryArgs = ReturnType<typeof getGraphQueryArgs>;
export type GraphCollectionQueryArgs = ReturnType<typeof getGraphCollectionQueryArgs>;

export const getGraphQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.GraphDefaultArgs>()({
    include: {
      organization: true,
      userCreated: getUserWithSettingsQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      queryPaths: true
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
