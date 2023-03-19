import { ChangeRequestStatus } from '../types/change-request-types';
import { WbsNumber } from '../types/project-types';
import { User } from '../types/user-types';

/**
 * This function calculates the status of a change request.
 * @param cr An incoming change request
 * @returns The status of the change request. Can either be Open, Accepted, Denied, or Implemented
 */
const calculateStatus = (
  implementedChanges: {
    wbsNum: WbsNumber;
    changeId: number;
    changeRequestId: number;
    implementer: User;
    detail: string;
    dateImplemented: Date;
  }[],
  accepted?: boolean,
  dateReviewed?: Date
): ChangeRequestStatus => {
  if (implementedChanges) {
    return ChangeRequestStatus.Implemented;
  } else if (accepted && dateReviewed) {
    return ChangeRequestStatus.Accepted;
  } else if (dateReviewed) {
    return ChangeRequestStatus.Denied;
  }
  return ChangeRequestStatus.Open;
};

export { calculateStatus };
