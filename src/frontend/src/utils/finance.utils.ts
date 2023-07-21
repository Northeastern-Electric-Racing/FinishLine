import { Reimbursement, ReimbursementRequest, ReimbursementStatus } from 'shared';

export const getCurrentReimbursementStatus = (statuses: ReimbursementStatus[]) => {
  return statuses.sort((a: ReimbursementStatus, b: ReimbursementStatus) => (a.dateCreated > b.dateCreated ? -1 : 1))[0];
};

export const getRefundRowData = (refund: Reimbursement) => {
  return { date: refund.dateCreated, amount: refund.amount, recipient: refund.userSubmitted };
};

export const createReimbursementRequestRowData = (reimbursementRequest: ReimbursementRequest) => {
  return {
    id: reimbursementRequest.reimbursementRequestId,
    saboId: reimbursementRequest.saboId,
    amount: reimbursementRequest.totalCost,
    dateSubmitted: reimbursementRequest.dateCreated,
    status: getCurrentReimbursementStatus(reimbursementRequest.reimbursementStatuses).type,
    dateDelivered: reimbursementRequest.dateDelivered,
    submitter: reimbursementRequest.recipient
  };
};
