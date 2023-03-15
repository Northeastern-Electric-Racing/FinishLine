import { ChangeRequest, StandardChangeRequest } from "../types/change-request-types";

/**
 * This function calculates the status of a change request.
 * @param cr An incoming change request
 * @returns The status of the change request. Can either be Open, Accepted, Denied, or Implemented
 */
const calculateStatus = (cr: ChangeRequest) => {
    if (cr.accepted == true && /* check if an implementation date exists */) {
        return 'IMPLEMENTED';
    }
    else if (cr.accepted == true) {
        return 'ACCEPTED';
    }
    else if (cr.accepted == false) {
        return 'DENIED';
    }
    else {
        return 'OPEN';
    }
  };

  export {
    calculateStatus
  }