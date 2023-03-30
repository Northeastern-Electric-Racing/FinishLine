/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequestStatus, ImplementedChange } from '../types/change-request-types';

/**
 * This function calculates the status of a change request.
 * @param cr An incoming change request
 * @returns The status of the change request. Can either be Open, Accepted, Denied, or Implemented
 */
const calculateStatus = (
  implementedChanges: ImplementedChange[],
  accepted?: boolean,
  dateReviewed?: Date
): ChangeRequestStatus => {
  if (implementedChanges.length) {
    return ChangeRequestStatus.Implemented;
  } else if (accepted && dateReviewed) {
    return ChangeRequestStatus.Accepted;
  } else if (dateReviewed) {
    return ChangeRequestStatus.Denied;
  }
  return ChangeRequestStatus.Open;
};

export { calculateStatus };
