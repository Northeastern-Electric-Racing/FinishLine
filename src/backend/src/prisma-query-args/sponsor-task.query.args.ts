import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type SponsorTaskQueryArgs = ReturnType<typeof getSponsorTaskQueryArgs>;

export const getSponsorTaskQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Sponsor_TaskDefaultArgs>()({
    include: {
      assignee: getUserQueryArgs(organizationId)
    }
  });
