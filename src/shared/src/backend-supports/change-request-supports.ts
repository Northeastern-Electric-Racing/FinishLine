import { ChangeRequest, ChangeRequestStatus } from "../types/change-request-types";

/**
 * This function calculates the status of a change request.
 * @param cr An incoming change request
 * @returns The status of the change request. Can either be Open, Accepted, Denied, or Implemented
 */
const calculateStatus = (cr: ChangeRequest) : ChangeRequestStatus => {
    if (cr.implementedChanges) {
        return ChangeRequestStatus.Implemented;
    }
    else if (cr.accepted && cr.dateReviewed) {
        return ChangeRequestStatus.Accepted;
    }
    else if (!cr.accepted && cr.dateReviewed) {
        return ChangeRequestStatus.Denied;
    }
    return ChangeRequestStatus.Open;
  };

  export { calculateStatus };
  