import { Prisma, Reimbursement_Status_Type } from '@prisma/client';

export const getProjectSegmentedWhereInput = (
  organizationId: string,
  startDate?: Date,
  endDate?: Date,
  carNumber?: number
): {
  where: {
    wbsElement: {
      is: {
        organizationId: string;
        dateDeleted: null;
        carNumber?: number;
        dateCreated?: { gte?: Date; lte?: Date };
      };
    };
  };
} => {
  const baseWhere: {
    where: {
      wbsElement: {
        is: {
          organizationId: string;
          dateDeleted: null;
          carNumber?: number;
          dateCreated?: { gte?: Date; lte?: Date };
        };
      };
    };
  } = Prisma.validator<Prisma.ProjectFindManyArgs>()({
    where: {
      wbsElement: {
        is: {
          organizationId,
          dateDeleted: null
        }
      }
    }
  });

  if (startDate !== undefined) {
    baseWhere.where.wbsElement.is.dateCreated = {
      gte: startDate
    };
  }

  if (endDate !== undefined) {
    baseWhere.where.wbsElement.is.dateCreated = { ...baseWhere.where.wbsElement.is.dateCreated, lte: endDate };
  }

  if (carNumber !== undefined) {
    baseWhere.where.wbsElement.is.carNumber = carNumber;
  }

  return baseWhere;
};

/**
 * Gets all reimbursement requests within the date range, and on the selected car if applicable
 * @param startDate the start of the range
 * @param endDate the end of the range
 * @param carNumber the car number to filter work package RRs on
 * @returns RRs within the range, including any "other reason" RRs, and any RRs on the selected car
 */
export const getReimbursementRequestWhereInput = (
  startDate?: Date,
  endDate?: Date,
  carNumber?: number
): Prisma.Reimbursement_RequestWhereInput => {
  const baseWhere: Prisma.Reimbursement_RequestWhereInput = Prisma.validator<Prisma.Reimbursement_RequestWhereInput>()({
    dateCreated: {},
    reimbursementStatuses: {
      none: {
        type: Reimbursement_Status_Type.DENIED
      }
    }
  });

  baseWhere.dateCreated = {
    ...(startDate && {
      gte: startDate
    }),
    ...(endDate && {
      lte: endDate
    })
  };

  if (carNumber) {
    baseWhere.reimbursementProducts = {
      some: {
        OR: [
          {
            reimbursementProductReason: {
              wbsElement: {
                carNumber
              }
            }
          },
          {
            reimbursementProductReason: {
              otherReason: { isNot: null }
            }
          }
        ]
      }
    };
  }

  return baseWhere;
};

export const computeRRTotals = (
  reimbursementRequests: {
    totalCost: number;
    reimbursementStatuses: {
      dateCreated: Date;
      reimbursementRequestId: string;
      type: Reimbursement_Status_Type;
      reimbursementStatusId: string;
      userId: string;
    }[];
    reimbursementProducts?: { cost: number }[];
  }[]
): {
  approved: number;
  pendingApproval: number;
  addedToSabo: number;
  reimbursed: number;
} => {
  let pendingApproval = 0;
  let approved = 0;
  let addedToSabo = 0;
  let reimbursed = 0;

  reimbursementRequests.forEach((req) => {
    const lastStatus = req.reimbursementStatuses.at(-1)?.type;
    if (!lastStatus) return;

    // If reimbursementProducts are provided, sum their costs; otherwise use totalCost
    const costToAdd = req.reimbursementProducts
      ? req.reimbursementProducts.reduce((acc, prod) => acc + prod.cost, 0)
      : req.totalCost;

    switch (lastStatus) {
      case Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL:
        pendingApproval += costToAdd;
        break;
      case Reimbursement_Status_Type.LEADERSHIP_APPROVED:
      case Reimbursement_Status_Type.PENDING_FINANCE:
      case Reimbursement_Status_Type.ADVISOR_APPROVED:
        approved += costToAdd;
        break;
      case Reimbursement_Status_Type.SABO_SUBMITTED:
      case Reimbursement_Status_Type.PENDING_SABO_SUBMISSION:
        addedToSabo += costToAdd;
        break;
      case Reimbursement_Status_Type.REIMBURSED:
        reimbursed += costToAdd;
        break;
    }
  });

  return {
    approved: approved / 100,
    pendingApproval: pendingApproval / 100,
    addedToSabo: addedToSabo / 100,
    reimbursed: reimbursed / 100
  };
};
