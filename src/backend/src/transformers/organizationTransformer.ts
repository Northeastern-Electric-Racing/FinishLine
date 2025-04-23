import { Organization } from '@prisma/client';
import { OrganizationPreview } from 'shared';

export const organizationTransformer = (organization: Organization): OrganizationPreview => {
  return {
    ...organization,
    applicationLink: organization.applicationLink ?? undefined
  };
};

export const transformOrganizationWithGuide = (organization: Organization) => ({
  id: organization.organizationId,
  name: organization.name,
  description: organization.description,
  dateCreated: organization.dateCreated,
  dateDeleted: organization.dateDeleted,
  guideLink: organization.partReviewGuideLink
});
