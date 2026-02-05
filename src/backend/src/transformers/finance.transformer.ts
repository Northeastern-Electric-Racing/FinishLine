import { Prisma } from '@prisma/client';
import { Sponsor, SponsorTask } from 'shared';
import { SponsorQueryArgs, SponsorTaskQueryArgs } from '../prisma-query-args/sponsor.query.args.js';
import { userTransformer } from './user.transformer.js';

export const sponsorTransformer = (sponsor: Prisma.SponsorGetPayload<SponsorQueryArgs>): Sponsor => {
  return {
    ...sponsor,
    contact: {
      name: sponsor.contactName,
      email: sponsor.contactEmail ?? undefined,
      phone: sponsor.contactPhone ?? undefined,
      position: sponsor.contactPosition ?? undefined
    },
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
