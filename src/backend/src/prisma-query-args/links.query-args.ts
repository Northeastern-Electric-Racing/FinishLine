import { Prisma } from '@prisma/client';
import { getLinkTypeQueryArgs } from './link-types.query-args';
import { getUserQueryArgs } from './user.query-args';

export type LinkQueryArgs = ReturnType<typeof getLinkQueryArgs>;

export const getLinkQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.LinkDefaultArgs>()({
    include: { linkType: getLinkTypeQueryArgs(organizationId), creator: getUserQueryArgs(organizationId) }
  });
