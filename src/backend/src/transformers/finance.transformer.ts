import { Prisma } from '@prisma/client';
import { Sponsor, SponsorTask, SponsorTier } from 'shared';
import { SponsorQueryArgs, SponsorTaskQueryArgs, SponsorTierQueryArgs } from '../prisma-query-args/sponsor.query.args';
import { userTransformer } from './user.transformer';

export const sponsorTransformer = (sponsor: Prisma.SponsorGetPayload<SponsorQueryArgs>): Sponsor => {
  return {
    ...sponsor,
    tierId: sponsor.sponsorTierId,
    discountCode: sponsor.discountCode ?? undefined,
    sponsorTasks: sponsor.sponsorTasks.map(sponsorTaskTranformer),
    sponsorTier: sponsor.sponsorTierId ? sponsorTierTransformer(sponsor.sponsorTierId) : undefined
  };
};

export const sponsorTaskTranformer = (sponsorTask: Prisma.Sponsor_TaskGetPayload<SponsorTaskQueryArgs>): SponsorTask => {
  return {
    ...sponsorTask,
    notifyDate: sponsorTask.notifyDate ?? undefined,
    assignee: sponsorTask.assignee ? userTransformer(sponsorTask.assignee) : undefined
  };
};

export const sponsorTierTransformer = (sponsorTier: Prisma.Sponsor_TierGetPayload<SponsorTierQueryArgs>): SponsorTier => {
  return {
    ...sponsorTier,
    sponsorTierId: sponsorTier.sponsorTierId,
    name: sponsorTier.name,
    colorHexCode: sponsorTier.colorHexCode
  }
}
