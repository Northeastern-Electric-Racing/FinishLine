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
export const getOverdueWorkPackages = (wpList : WorkPackage[]) : WorkPackage[] => {
  const overdueWorkPackages : WorkPackage[] = [];

  for(let i = 0; i < wpList.length ; i++){
    const curr = wpList[i];

    // if the work package is anything but complete and the end date is before today, it is overdue.
    if(curr.status !== WbsElementStatus.Complete && curr.endDate < new Date()){
      overdueWorkPackages.push(curr);
    }
  }

  return overdueWorkPackages;
};