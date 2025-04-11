import { Prisma } from '@prisma/client';
import { Sponsor, SponsorTask } from 'shared';
import { SponsorQueryArgs, SponsorTaskQueryArgs } from '../prisma-query-args/sponsor.query.args';
import { userTransformer } from './user.transformer';

export const sponsorTransformer = (sponsor: Prisma.SponsorGetPayload<SponsorQueryArgs>): Sponsor => {
  return {
    ...sponsor,
    discountCode: sponsor.discountCode ?? undefined,
    sponsorTasks: sponsor.sponsorTasks.map(sponsorTaskTranformer),
    tier: sponsor.tier
  };
};

export const sponsorTaskTranformer = (sponsorTask: Prisma.Sponsor_TaskGetPayload<SponsorTaskQueryArgs>): SponsorTask => {
  return {
    ...sponsorTask,
    notifyDate: sponsorTask.notifyDate ?? undefined,
    assignee: sponsorTask.assignee ? userTransformer(sponsorTask.assignee) : undefined
  };
};
