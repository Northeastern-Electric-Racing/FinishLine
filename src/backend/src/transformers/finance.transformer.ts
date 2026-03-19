import { Prisma } from '@prisma/client';
import { Sponsor, SponsorTask, SponsorValueType } from 'shared';
import { SponsorQueryArgs, SponsorTaskQueryArgs } from '../prisma-query-args/sponsor.query.args.js';
import { userTransformer } from './user.transformer.js';

export const sponsorTransformer = (sponsor: Prisma.SponsorGetPayload<SponsorQueryArgs>): Sponsor => {
  return {
    ...sponsor,
    valueTypes: sponsor.valueTypes as SponsorValueType[],
    contact: {
      name: sponsor.contact.name,
      email: sponsor.contact.email ?? undefined,
      phone: sponsor.contact.phone ?? undefined,
      position: sponsor.contact.position ?? undefined
    },
    sponsorValue: sponsor.sponsorValue ?? undefined,
    stockDescription: sponsor.stockDescription ?? undefined,
    discountDescription: sponsor.discountDescription ?? undefined,
    tier: sponsor.tier
      ? {
          sponsorTierId: sponsor.tier.sponsorTierId,
          name: sponsor.tier.name,
          colorHexCode: sponsor.tier.colorHexCode,
          minSupportValue: sponsor.tier.minSupportValue
        }
      : undefined,
    sponsorNotes: sponsor.sponsorNotes ?? undefined,
    discountCode: sponsor.discountCode ?? undefined,
    sponsorTasks: sponsor.sponsorTasks.map(sponsorTaskTranformer)
  };
};

export const sponsorTaskTranformer = (sponsorTask: Prisma.Sponsor_TaskGetPayload<SponsorTaskQueryArgs>): SponsorTask => {
  return {
    ...sponsorTask,
    notifyDate: sponsorTask.notifyDate ?? undefined,
    assignee: sponsorTask.assignee ? userTransformer(sponsorTask.assignee) : undefined
  };
};
