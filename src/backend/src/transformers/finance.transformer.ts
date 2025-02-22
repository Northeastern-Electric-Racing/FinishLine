import { Prisma } from '@prisma/client';
import { Sponsor } from '@prisma/client';

const sponsorTransformer = (sponsor: Prisma.SponsorGetPayload<null>): Sponsor => {
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
    taxExempt: sponsor.taxExempt
  };
};

export default sponsorTransformer;
