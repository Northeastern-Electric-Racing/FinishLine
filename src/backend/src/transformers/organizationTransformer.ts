import { Organization } from '@prisma/client';
import { OrganizationPreview } from 'shared';

export const organizationTransformer = (organization: Organization): OrganizationPreview => {
  return {
    ...organization,
    applicationLink: organization.applicationLink ?? undefined
  };
};
