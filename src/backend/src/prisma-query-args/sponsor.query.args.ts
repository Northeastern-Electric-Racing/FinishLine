import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type SponsorQueryArgs = ReturnType<typeof getSponsorQueryArgs>;

export type SponsorTaskQueryArgs = ReturnType<typeof getSponsorTaskQueryArgs>;

export type SponsorTierQueryArgs = ReturnType<typeof getSponsorTierQueryArgs>; 

export const getSponsorQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.SponsorDefaultArgs>()({
    include: {
      sponsorTasks: getSponsorTaskQueryArgs(organizationId)
    }
  });

export const getSponsorTaskQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Sponsor_TaskDefaultArgs>()({
    include: {
      assignee: getUserQueryArgs(organizationId)
    }
  });

  export const getSponsorTierQueryArgs = (organizationId: string) =>
    Prisma.validator<Prisma.Sponsor_TierDefaultArgs>()({
      include: {
        sponsors: getSponsorQueryArgs(organizationId)
      }
    })
