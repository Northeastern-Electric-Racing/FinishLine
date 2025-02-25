import { Prisma } from '@prisma/client';

export type IndexCodeQueryArgs = ReturnType<typeof getIndexCodeQueryArgs>;

export const getIndexCodeQueryArgs = () =>
  Prisma.validator<Prisma.Index_CodeDefaultArgs>()({
    include: {
      userCreated: {
        include: {
          organizations: true,
          roles: true
        }
      }
    }
  });
