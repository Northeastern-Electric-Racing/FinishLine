import { Prisma } from '@prisma/client';
import { getSponsorTaskQueryArgs } from './sponsor-task.query.args';

export type SponsorQueryArgs = ReturnType<typeof getSponsorQueryArgs>;

export const getSponsorQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.SponsorDefaultArgs>()({
    include: {
      organization: true,
      tier: true,
      sponsorTasks: getSponsorTaskQueryArgs(organizationId)
    }
  });
