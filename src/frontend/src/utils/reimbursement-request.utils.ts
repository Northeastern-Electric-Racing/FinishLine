import {
  BaseReimbursementRequest,
  Reimbursement,
  ReimbursementProductReasonPreview,
  ReimbursementRequestRow,
  ReimbursementRequestTableItem,
  ReimbursementStatusType,
  wbsPipe
} from 'shared';

/** Groups a request's products by what they were bought for, keyed by the wbs element or "other" reason's name */
export const getUniqueWbsElementsWithProductsFromReimbursementRequest = <
  T extends { reimbursementProductReason: ReimbursementProductReasonPreview }
>(reimbursementRequest: {
  reimbursementProducts: T[];
}): Map<string, T[]> => {
  const uniqueWbsElementsWithProducts = new Map<string, T[]>();
  reimbursementRequest.reimbursementProducts.forEach((product) => {
    const reason = product.reimbursementProductReason;
    const wbs = 'wbsNum' in reason ? `${wbsPipe(reason.wbsNum)} - ${reason.wbsName}` : reason.name;
    if (uniqueWbsElementsWithProducts.has(wbs)) {
      const products = uniqueWbsElementsWithProducts.get(wbs);
      products?.push(product);
    } else {
      uniqueWbsElementsWithProducts.set(wbs, [product]);
    }
  });
  return uniqueWbsElementsWithProducts;
};

export const descendingComparator = <T>(a: T, b: T, orderBy: keyof T) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  if (b[orderBy] === undefined) {
    return -1;
  }
  return 0;
};

export const statusDescendingComparator = (a: ReimbursementStatusType, b: ReimbursementStatusType) => {
  const statusOrder = new Map<ReimbursementStatusType, number>([
    [ReimbursementStatusType.PENDING_LEADERSHIP_APPROVAL, 0],
    [ReimbursementStatusType.PENDING_FINANCE, 1],
    [ReimbursementStatusType.PENDING_SABO_SUBMISSION, 2],
    [ReimbursementStatusType.SABO_SUBMITTED, 3],
    [ReimbursementStatusType.ADVISOR_APPROVED, 4],
    [ReimbursementStatusType.REIMBURSED, 5],
    [ReimbursementStatusType.DENIED, 6]
  ]);

  const bConverted = statusOrder.get(b);
  const aConverted = statusOrder.get(a);

  if (bConverted !== undefined && aConverted !== undefined) {
    if (bConverted < aConverted) {
      return -1;
    }
    if (bConverted > aConverted) {
      return 1;
    }
  }
  return 0;
};

export const cleanReimbursementRequestStatus = (status: ReimbursementStatusType) => {
  switch (status) {
    case ReimbursementStatusType.ADVISOR_APPROVED:
      return 'Advisor Approved';
    case ReimbursementStatusType.PENDING_FINANCE:
      return 'Pending Finance Team';
    case ReimbursementStatusType.REIMBURSED:
      return 'Reimbursed';
    case ReimbursementStatusType.PENDING_SABO_SUBMISSION:
      return 'Pending SABO Submission';
    case ReimbursementStatusType.SABO_SUBMITTED:
      return 'Submitted to SABO';
    case ReimbursementStatusType.DENIED:
      return 'Denied';
    case ReimbursementStatusType.PENDING_LEADERSHIP_APPROVAL:
      return 'Pending Leadership Approval';
    case ReimbursementStatusType.LEADERSHIP_APPROVED:
      return 'Leadership Approved';
  }
};

// the status checks only need the request's statuses
type WithStatuses = Pick<BaseReimbursementRequest, 'reimbursementStatuses'>;

export const isReimbursementRequestAdvisorApproved = (reimbursementRequest: WithStatuses) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.ADVISOR_APPROVED);
};

export const isReimbursementRequestPendingSaboSubmission = (reimbursementRequest: WithStatuses) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.PENDING_SABO_SUBMISSION);
};

export const isReimbursementRequestSaboSubmitted = (reimbursementRequest: WithStatuses) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.SABO_SUBMITTED);
};

export const isReimbursementRequestLeadershipApproved = (reimbursementRequest: WithStatuses) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.LEADERSHIP_APPROVED);
};

export const isReimbursementRequestPendingFinance = (reimbursementRequest: WithStatuses) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.PENDING_FINANCE);
};

export const isReimbursementRequestDenied = (reimbursementRequest: WithStatuses) => {
  return reimbursementRequest.reimbursementStatuses.map((status) => status.type).includes(ReimbursementStatusType.DENIED);
};

export const isReimbursementRequestReimbursed = (reimbursementRequest: WithStatuses) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.REIMBURSED);
};

export const imagePreviewUrl = (googleFileId: string) => `https://drive.google.com/file/d/${googleFileId}/preview`;

export const imageFileUrl = (googleFileId: string) => `https://drive.google.com/file/d/${googleFileId}`;

export const imageDownloadUrl = (googleFileId: string) => `https://drive.google.com/uc?export=download&id=${googleFileId}`;

export const getRefundRowData = (refund: Reimbursement) => {
  return { date: refund.dateCreated, amount: refund.amount, recipient: refund.userSubmitted, id: refund.reimbursementId };
};

export const createReimbursementRequestRowData = (
  reimbursementRequest: ReimbursementRequestTableItem
): ReimbursementRequestRow => {
  return {
    id: reimbursementRequest.reimbursementRequestId,
    identifier: reimbursementRequest.identifier,
    saboId: reimbursementRequest.saboId,
    amount: reimbursementRequest.totalCost,
    dateSubmitted: reimbursementRequest.dateCreated,
    status: reimbursementRequest.currentStatus,
    dateSubmittedToSabo: reimbursementRequest.dateSubmittedToSabo,
    submitter: reimbursementRequest.recipient,
    financeMemberAssigned: reimbursementRequest.assignee,
    reimbursementProducts: reimbursementRequest.reimbursementProducts,
    description: reimbursementRequest.description
  };
};

export const formatReasonName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
