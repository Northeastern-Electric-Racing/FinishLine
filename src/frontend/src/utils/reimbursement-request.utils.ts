import {
  Project,
  Reimbursement,
  ReimbursementProduct,
  ReimbursementRequest,
  ReimbursementStatus,
  ReimbursementStatusType,
  WBSElementData,
  WbsNumber,
  wbsPipe
} from 'shared';

export const getUniqueWbsElementsWithProductsFromReimbursementRequest = (
  reimbursementRequest: ReimbursementRequest
): Map<string, ReimbursementProduct[]> => {
  const uniqueWbsElementsWithProducts = new Map<string, ReimbursementProduct[]>();
  reimbursementRequest.reimbursementProducts.forEach((product) => {
    const wbs = !!(product.reimbursementProductReason as WBSElementData).wbsNum
      ? `${wbsPipe((product.reimbursementProductReason as WBSElementData).wbsNum)} - ${
          (product.reimbursementProductReason as WBSElementData).wbsName
        }`
      : (product.reimbursementProductReason as string);
    if (uniqueWbsElementsWithProducts.has(wbs)) {
      const products = uniqueWbsElementsWithProducts.get(wbs);
      products?.push(product);
    } else {
      uniqueWbsElementsWithProducts.set(wbs, [product]);
    }
  });
  return uniqueWbsElementsWithProducts;
};

export const getAllWbsElements = (projects: Project[]): { wbsNum: WbsNumber; wbsName: string }[] => {
  return projects
    .map((project) => {
      return {
        wbsNum: project.wbsNum,
        wbsName: project.name
      };
    })
    .concat(
      projects.flatMap((project) =>
        project.workPackages.map((workPackage) => {
          return {
            wbsNum: workPackage.wbsNum,
            wbsName: workPackage.projectName + ' - ' + workPackage.name
          };
        })
      )
    );
};

export const cleanReimbursementRequestStatus = (status: ReimbursementStatusType) => {
  switch (status) {
    case ReimbursementStatusType.ADVISOR_APPROVED: {
      return 'Advisor Approved';
    }
    case ReimbursementStatusType.PENDING_FINANCE: {
      return 'Pending Finance Team';
    }
    case ReimbursementStatusType.REIMBURSED: {
      return 'Reimbursed';
    }
    case ReimbursementStatusType.SABO_SUBMITTED: {
      return 'Submitted to Sabo';
    }
    case ReimbursementStatusType.DENIED: {
      return 'Denied';
    }
  }
};

export const getCurrentReimbursementStatus = (statuses: ReimbursementStatus[]) => {
  return statuses.sort((a: ReimbursementStatus, b: ReimbursementStatus) => (a.dateCreated > b.dateCreated ? -1 : 1))[0];
};

export const isReimbursementRequestAdvisorApproved = (reimbursementRequest: ReimbursementRequest) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.ADVISOR_APPROVED);
};

export const isReimbursementRequestSaboSubmitted = (reimbursementRequest: ReimbursementRequest) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.SABO_SUBMITTED);
};

export const isReimbursementRequestDenied = (reimbursementRequest: ReimbursementRequest) => {
  return reimbursementRequest.reimbursementStatuses.map((status) => status.type).includes(ReimbursementStatusType.DENIED);
};

export const isReimbursementRequestReimbursed = (reimbursementRequest: ReimbursementRequest) => {
  return reimbursementRequest.reimbursementStatuses
    .map((status) => status.type)
    .includes(ReimbursementStatusType.REIMBURSED);
};

export const getReimbursementRequestDateSubmittedToSabo = (reimbursementRequest: ReimbursementRequest) => {
  const saboStatus = reimbursementRequest.reimbursementStatuses.find(
    (status) => status.type === ReimbursementStatusType.SABO_SUBMITTED
  );
  return saboStatus?.dateCreated;
};

export const imagePreviewUrl = (googleFileId: string) => `https://drive.google.com/file/d/${googleFileId}/preview`;

export const imageFileUrl = (googleFileId: string) => `https://drive.google.com/file/d/${googleFileId}`;

export const imageDownloadUrl = (googleFileId: string) => `https://drive.google.com/uc?export=download&id=${googleFileId}`;

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
    dateSubmittedToSabo: getReimbursementRequestDateSubmittedToSabo(reimbursementRequest),
    submitter: reimbursementRequest.recipient,
    vendor: reimbursementRequest.vendor
  };
};
