import { Prisma } from '@prisma/client';
import { SponsorTask } from 'shared';
import { userTransformer } from './user.transformer';
import { SponsorTaskQueryArgs } from '../prisma-query-args/sponsor-task.query.args';

export const sponsorTaskTransformer = (sponsorTask: Prisma.Sponsor_TaskGetPayload<SponsorTaskQueryArgs>): SponsorTask => {
  return {
    ...sponsorTask,
    sponsor: sponsorTask.sponsor,
    assignee: sponsorTask.assignee ? userTransformer(sponsorTask.assignee) : undefined,
    notifyDate: sponsorTask.notifyDate ?? undefined
  };
};

export default sponsorTaskTransformer;
