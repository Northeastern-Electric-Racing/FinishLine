import { addWeeksToDate, WbsElement, WbsElementStatus, WbsElementStatus, wbsPipe, WorkPackage, WorkPackage } from 'shared';
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
 * @returns a sub-list of work packages that are not complete, and have end dates before the current date.
 */
export const getOverdueWorkPackages = (wpList: WorkPackage[]): WorkPackage[] => {
  return wpList.filter((wp) => wp.status !== WbsElementStatus.Complete && new Date(wp.endDate) <= new Date());
};

/**
 * Given a list of work packages, return the work packages that are upcoming.
 * @param wpList a list of work packages.
 * @returns a sub-list of work packages that are active and have a start date within the next 2 weeks.
 */
export const getUpcomingWorkPackages = (wpList: WorkPackage[]): WorkPackage[] => {
  return wpList.filter(
    (wp) =>
      wp.status !== WbsElementStatus.Complete &&
      new Date(wp.startDate) <= addWeeksToDate(new Date(), 2) &&
      new Date(wp.startDate) >= new Date()
  );
};

/**
 * Given a list of work packages, return the work packages that are in progress.
 * @param wpList a list of work packages.
 * @returns a sub-list of work packages that are active, have a start date in the past, and an end date in the future.
 */
export const getInProgressWorkPackages = (wpList: WorkPackage[]): WorkPackage[] => {
  return wpList.filter(
    (wp) =>
      wp.status === WbsElementStatus.Active && new Date(wp.endDate) >= new Date() && new Date(wp.startDate) <= new Date()
  );
};
