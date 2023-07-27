import {
  Project,
  Reimbursement,
  ReimbursementProduct,
  ReimbursementRequest,
  ReimbursementStatus,
  ReimbursementStatusType,
  WbsNumber,
  wbsPipe
} from 'shared';

export const getUniqueWbsElementsWithProductsFromReimbursementRequest = (
  reimbursementRequest: ReimbursementRequest
): Map<string, ReimbursementProduct[]> => {
  const uniqueWbsElementsWithProducts = new Map<string, ReimbursementProduct[]>();
  reimbursementRequest.reimbursementProducts.forEach((product) => {
    const wbs = `${wbsPipe(product.wbsNum)} - ${product.wbsName}`;
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
  }
};

export const getCurrentReimbursementStatus = (statuses: ReimbursementStatus[]) => {
  return statuses.sort((a: ReimbursementStatus, b: ReimbursementStatus) => (a.dateCreated > b.dateCreated ? -1 : 1))[0];
};

export const isReimbursementRequestApproved = (reimbursementRequest: ReimbursementRequest) => {
  return reimbursementRequest.reimbursementStatuses.some(
    (status: ReimbursementStatus) => status.type === ReimbursementStatusType.ADVISOR_APPROVED
  );
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
