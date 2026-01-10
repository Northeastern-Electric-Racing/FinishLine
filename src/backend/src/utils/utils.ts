import { WBS_Element_Status } from '@prisma/client';
import { WbsElementStatus, WbsNumber } from 'shared';

export const wbsNumOf = (element: { carNumber: number; projectNumber: number; workPackageNumber: number }): WbsNumber => ({
  carNumber: element.carNumber,
  projectNumber: element.projectNumber,
  workPackageNumber: element.workPackageNumber
});

export const convertStatus = (status: WBS_Element_Status): WbsElementStatus =>
  ({
    INACTIVE: WbsElementStatus.Inactive,
    ACTIVE: WbsElementStatus.Active,
    COMPLETE: WbsElementStatus.Complete
  })[status];

export const getStringParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) throw new Error('Expected single value');
  if (!value) throw new Error('Missing parameter');
  return value;
};
