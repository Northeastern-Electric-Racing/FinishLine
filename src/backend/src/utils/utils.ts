import { WBS_Element, WBS_Element_Status } from '@prisma/client';
import { WbsElementStatus, WbsNumber } from 'shared';
import { AccessDeniedException } from './errors.utils';
import { IncomingHttpHeaders } from 'http';

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

export const getOrganizationId = (headers: IncomingHttpHeaders): string => {
  let { organizationId } = headers;

  if (organizationId === undefined) {
    organizationId = process.env.DEV_ORGANIZATION_ID;
  }

  if (organizationId === undefined) {
    throw new AccessDeniedException('Organization not provided');
  }

  if (typeof organizationId !== 'string') {
    throw new AccessDeniedException('Invalid organization ID');
  }

  return organizationId;
};
