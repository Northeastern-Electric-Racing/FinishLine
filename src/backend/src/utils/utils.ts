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
