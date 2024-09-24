import { WbsElement, wbsPipe, WorkPackage } from 'shared';
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

export const getUpcomingWorkPackages = (workPackages: WorkPackage[]): WorkPackage[] => {
  const currentTime = new Date();
  const twoWeeks = new Date();
  twoWeeks.setDate(currentTime.getDate() + 14);
  return workPackages.filter(({ startDate }) => currentTime < startDate && startDate <= twoWeeks);
  
/**
 * Given a list of work packages, return the work packages that are overdue.
 * @param wpList a list of work packages.
 * @returns a list of work packages that are overdue.
 */
export const getOverdueWorkPackages = (wpList: WorkPackage[]): WorkPackage[] => {
  return wpList.filter((wp) => wp.status !== WbsElementStatus.Complete && wp.endDate < new Date());
};
