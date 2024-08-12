import { Organization, WBS_Element, WBS_Element_Status } from '@prisma/client';
import { OrganizationPreview, WbsElementStatus, WbsNumber } from 'shared';
import { AccessDeniedException, NotFoundException } from './errors.utils';
import { IncomingHttpHeaders } from 'http';
import prisma from '../prisma/prisma';

export const wbsNumOf = (element: WBS_Element): WbsNumber => ({
  carNumber: element.carNumber,
  projectNumber: element.projectNumber,
  workPackageNumber: element.workPackageNumber
});

export const convertStatus = (status: WBS_Element_Status): WbsElementStatus =>
  ({
    INACTIVE: WbsElementStatus.Inactive,
    ACTIVE: WbsElementStatus.Active,
    COMPLETE: WbsElementStatus.Complete
  }[status]);

export const getOrganization = async (headers: IncomingHttpHeaders): Promise<OrganizationPreview> => {
  let { organizationId } = headers;

  const isProd = process.env.NODE_ENV === 'production';

  if (organizationId === undefined && !isProd) {
    organizationId = process.env.DEV_ORGANIZATION_ID;
  }

  if (organizationId === undefined) {
    throw new AccessDeniedException('Organization not provided');
  }

  if (typeof organizationId !== 'string') {
    throw new AccessDeniedException('Invalid organization ID');
  }

  const organization = await prisma.organization.findUnique({
    where: { organizationId }
  });

  if (!organization) {
    throw new NotFoundException('Organization', organizationId);
  }

  return organization;
};
