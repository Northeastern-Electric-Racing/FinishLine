import { Prisma, Sponsor, Sponsor_Task } from '@prisma/client';
import { SponsorQueryArgs } from '../prisma-query-args/sponsor.query-args';

export const sponsorTransformer = (
  sponsor: Prisma.SponsorGetPayload<SponsorQueryArgs>
): Sponsor & { sponsorTasks: Sponsor_Task[] } => {
  return {
    sponsorId: sponsor.sponsorId,
    name: sponsor.name,
    organizationId: sponsor.organizationId,
    dateCreated: sponsor.dateCreated,
    dateDeleted: sponsor.dateDeleted ?? null,
    activeStatus: sponsor.activeStatus,
    vendorContact: sponsor.vendorContact,
    sponsorTierId: sponsor.sponsorTierId,
    sponsorValue: sponsor.sponsorValue,
    joinDate: sponsor.joinDate,
    discountCode: sponsor.discountCode ?? null,
    activeYears: sponsor.activeYears,
    taxExempt: sponsor.taxExempt,
    sponsorTasks: sponsor.sponsorTasks ?? [] // Ensure it’s included
  };
};

export default sponsorTransformer;
