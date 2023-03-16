import { ChangeRequest } from "../types/change-request-types";

/**
 * This function calculates the status of a change request.
 * @param cr An incoming change request
 * @returns The status of the change request. Can either be Open, Accepted, Denied, or Implemented
 */
const calculateStatus = (cr: ChangeRequest) => {
    if (cr.implementedChanges) {
        return 'IMPLEMENTED';
    }
    else if (cr.accepted && cr.dateReviewed) {
        return 'ACCEPTED';
    }
    else if (!cr.accepted && cr.dateReviewed) {
        return 'DENIED';
    }
    
    return 'OPEN';
  };

  export default calculateStatus
  