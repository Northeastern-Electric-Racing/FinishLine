import { Organization } from '@prisma/client';
import { OrganizationPreview } from 'shared';

export const organizationTransformer = (organization: Organization): OrganizationPreview => {
  // the bot token hash is only ever matched against, so keep it out of responses
  const { apiTokenHash: _apiTokenHash, ...rest } = organization;
  return {
    ...rest,
    applicationLink: organization.applicationLink ?? undefined,
    platformDescription: organization.platformDescription,
    platformLogoImageId: organization.platformLogoImageId ?? undefined
  };
};
