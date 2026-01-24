import { Prisma } from '@prisma/client';
import { SponsorTask } from 'shared';
import { userTransformer } from './user.transformer.js';
import { SponsorTaskQueryArgs } from '../prisma-query-args/sponsor.query.args.js';

export const sponsorTaskTransformer = (sponsorTask: Prisma.Sponsor_TaskGetPayload<SponsorTaskQueryArgs>): SponsorTask => {
  return {
    sponsorTaskId: sponsorTask.sponsorTaskId,
    dueDate: sponsorTask.dueDate,
    notifyDate: sponsorTask.notifyDate ?? undefined,
    assignee: sponsorTask.assignee ? userTransformer(sponsorTask.assignee) : undefined,
    notes: sponsorTask.notes
  };
};

export default sponsorTaskTransformer;
