import { WbsElement, WbsElementStatus, wbsPipe, WorkPackage } from 'shared';
import { WPFormType } from './form';

export const getTitleFromFormType = (formType: WPFormType, wbsElement: WbsElement): string => {
  switch (formType) {
    case WPFormType.CREATEWITHCR:
      return `Create Change Request - New Work Package - ${wbsElement.name}`;
    case WPFormType.CREATE:
      return `New Work Package - ${wbsElement.name}`;
    default:
      return `${wbsPipe(wbsElement.wbsNum)} - ${wbsElement.name}`;
  }
};

/**
 * Given a list of work packages, return the work packages that are overdue.
 * @param wpList a list of work packages.
 * @returns a list of work packages that are overdue.
 */
export const getOverdueWorkPackages = (wpList: WorkPackage[]): WorkPackage[] => {
  return wpList.filter((wp) => wp.status !== WbsElementStatus.Complete && new Date(wp.endDate) <= new Date());
};

export const getUpcomingWorkPackages = (wpList: WorkPackage[]): WorkPackage[] => {
  return wpList.filter(
    (wp) =>
      wp.status === WbsElementStatus.Inactive &&
      //start date is within 2 weeks
      wp.startDate < new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) &&
      //start date is in the future
      wp.startDate > new Date()
  );
};

export const getInProgressWorkPackages = (wpList: WorkPackage[]): WorkPackage[] => {
  return wpList.filter((wp) => wp.status === WbsElementStatus.Active && wp.endDate >= new Date());
};
