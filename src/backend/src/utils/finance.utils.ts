import { Prisma, Reimbursement_Status_Type } from '@prisma/client';

export const getProjectSegmentedWhereInput = (
  organizationId: string,
  startDate?: Date,
  endDate?: Date,
  carNumber?: number
): {
  where: {
    wbsElement: {
      organizationId: string;
      dateDeleted: null;
      carNumber?: number;
      dateCreated?: { gte?: Date; lte?: Date };
    };
  };
} => {
  const baseWhere: {
    where: {
      wbsElement: {
        organizationId: string;
        dateDeleted: null;
        carNumber?: number;
        dateCreated?: { gte?: Date; lte?: Date };
      };
    };
  } = Prisma.validator<Prisma.ProjectFindManyArgs>()({
    where: {
      wbsElement: {
        organizationId,
        dateDeleted: null
      }
    }
  });

  if (startDate) {
    baseWhere.where.wbsElement.dateCreated = {
      gte: startDate
    };
  }

  if (endDate) {
    baseWhere.where.wbsElement.dateCreated = { ...baseWhere.where.wbsElement.dateCreated, lte: endDate };
  }

  if (carNumber !== undefined) {
    baseWhere.where.wbsElement.carNumber = carNumber;
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

  if (carNumber !== undefined) {
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
  }[]
): {
  pendingFinance: number;
  pendingLeadership: number;
  submittedToSabo: number;
  reimbursed: number;
} => {
  const totals: Partial<Record<Reimbursement_Status_Type, number>> = {
    [Reimbursement_Status_Type.PENDING_FINANCE]: 0,
    [Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL]: 0,
    [Reimbursement_Status_Type.SABO_SUBMITTED]: 0,
    [Reimbursement_Status_Type.REIMBURSED]: 0
  };

  reimbursementRequests.forEach((req) => {
    const lastStatus = req.reimbursementStatuses.at(-1)?.type;

    if (lastStatus && totals[lastStatus] !== undefined) {
      totals[lastStatus] += req.totalCost;
    }
  });

  const pendingFinance = (totals[Reimbursement_Status_Type.PENDING_FINANCE] ?? 0) / 100;
  const pendingLeadership = (totals[Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL] ?? 0) / 100;
  const submittedToSabo = (totals[Reimbursement_Status_Type.SABO_SUBMITTED] ?? 0) / 100;
  const reimbursed = (totals[Reimbursement_Status_Type.REIMBURSED] ?? 0) / 100;

  return { pendingFinance, pendingLeadership, submittedToSabo, reimbursed };
};
