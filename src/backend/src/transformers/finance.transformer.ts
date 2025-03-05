import { Prisma } from '@prisma/client';
import { Sponsor, SponsorTask } from 'shared';
import { SponsorQueryArgs, SponsorTaskQueryArgs } from '../prisma-query-args/sponsor.query-args';
import { userTransformer } from './user.transformer';

export const sponsorTransformer = (sponsor: Prisma.SponsorGetPayload<SponsorQueryArgs>): Sponsor => {
  return {
    sponsorId: sponsor.sponsorId,
    name: sponsor.name,
    activeStatus: sponsor.activeStatus,
    vendorContact: sponsor.vendorContact,
    tierId: sponsor.sponsorTierId,
    sponsorValue: sponsor.sponsorValue,
    joinDate: sponsor.joinDate,
    discountCode: sponsor.discountCode ?? undefined,
    activeYears: sponsor.activeYears,
    taxExempt: sponsor.taxExempt,
    sponsorTasks: sponsor.sponsorTasks.map(sponsorTaskTranformer)
  };
};

export const sponsorTaskTranformer = (sponsorTask: Prisma.Sponsor_TaskGetPayload<SponsorTaskQueryArgs>): SponsorTask => {
  return {
    sponsorTaskId: sponsorTask.sponsorTaskId,
    dueDate: sponsorTask.dueDate,
    notifyDate: sponsorTask.notifyDate ?? undefined,
    assignee: sponsorTask.assignee ? userTransformer(sponsorTask.assignee) : undefined,
    notes: sponsorTask.notes
  };
};
