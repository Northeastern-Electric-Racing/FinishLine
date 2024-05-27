import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type LinkTypeQueryArgs = ReturnType<typeof getLinkTypeQueryArgs>;

export const getLinkTypeQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Link_TypeDefaultArgs>()({
    include: { creator: getUserQueryArgs(organizationId) }
  });
