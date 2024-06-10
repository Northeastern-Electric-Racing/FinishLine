import {
  Project,
  Reimbursement,
  ReimbursementProduct,
  ReimbursementRequest,
  ReimbursementRequestRow,
  ReimbursementStatus,
  ReimbursementStatusType,
  User,
  Vendor,
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

export const descendingComparator = <T>(a: T, b: T, orderBy: keyof T) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export const statusDescendingComparator = (a: ReimbursementStatusType, b: ReimbursementStatusType) => {
  const statusOrder = new Map<ReimbursementStatusType, number>([
    [ReimbursementStatusType.PENDING_FINANCE, 1],
    [ReimbursementStatusType.SABO_SUBMITTED, 2],
    [ReimbursementStatusType.ADVISOR_APPROVED, 3],
    [ReimbursementStatusType.REIMBURSED, 4],
    [ReimbursementStatusType.DENIED, 5]
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

export const vendorDescendingComparator = (a: Vendor, b: Vendor) => {
  if (b.name < a.name) {
    return -1;
  }
  if (b.name > a.name) {
    return 1;
  }
  return 0;
};

export const submitterDescendingComparator = (a: User, b: User) => {
  if (b.firstName < a.firstName) {
    return -1;
  }
  if (b.firstName > a.firstName) {
    return 1;
  }
  return 0;
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
      return 'Submitted to SABO';
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
  return { date: refund.dateCreated, amount: refund.amount, recipient: refund.userSubmitted, id: refund.reimbursementId };
};

export const createReimbursementRequestRowData = (reimbursementRequest: ReimbursementRequest): ReimbursementRequestRow => {
  return {
    id: reimbursementRequest.reimbursementRequestId,
    identifier: reimbursementRequest.identifier,
    saboId: reimbursementRequest.saboId,
    amount: reimbursementRequest.totalCost,
    dateSubmitted: reimbursementRequest.dateCreated,
    status: getCurrentReimbursementStatus(reimbursementRequest.reimbursementStatuses).type,
    dateSubmittedToSabo: getReimbursementRequestDateSubmittedToSabo(reimbursementRequest),
    submitter: reimbursementRequest.recipient,
    vendor: reimbursementRequest.vendor,
    refundSource: reimbursementRequest.account
  };
};
