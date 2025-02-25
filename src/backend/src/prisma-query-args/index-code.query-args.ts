import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type IndexCodeQueryArgs = ReturnType<typeof getIndexCodeQueryArgs>;

export const getIndexCodeQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Index_CodeDefaultArgs>()({
    include: {
      userCreated: {
        include: {
          ...getUserQueryArgs(organizationId),
          roles: true,
          organizations: true
        }
      }
    }
  });
