import { Prisma } from '@prisma/client';
import { SponsorQueryArgs } from '../prisma-query-args/sponsor.query-args';
import { TransformedSponsor } from './types'; // Import the custom type

const sponsorTransformer = (
  sponsor: Prisma.SponsorGetPayload<SponsorQueryArgs> // Sponsor with included relations
): TransformedSponsor => {
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
    sponsorTasks: sponsor.sponsorTasks // Include `sponsorTasks` in the return object
  };
};

export default sponsorTransformer;
