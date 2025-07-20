import { Prisma, Reimbursement_Status_Type } from '@prisma/client';
import { wbsPipe, SpendingBarData, ReimbursementRequestData } from 'shared';
import prisma from '../prisma/prisma';
import { getReimbursementRequestQueryArgs } from '../prisma-query-args/reimbursement-requests.query-args';
import { NotFoundException } from './errors.utils';
import { getTeamQueryArgs } from '../prisma-query-args/teams.query-args';

export const getProjectSegmentedWhereInput = (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): {
  where: {
    wbsElement: { organizationId: string; dateDeleted: null; dateCreated?: { gte?: Date; lte?: Date } };
  };
} => {
  const baseWhere: {
    where: {
      wbsElement: { organizationId: string; dateDeleted: null; dateCreated?: { gte?: Date; lte?: Date } };
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

  return baseWhere;
};

const getReimbursementRequestWhereInput = (
  startDate?: Date,
  endDate?: Date
): {
  dateCreated?: {
    gte?: Date;
    lte?: Date;
  };
} => {
  const baseWhere: {
    dateCreated?: {
      gte?: Date;
      lte?: Date;
    };
    reimbursementStatuses: {
      none: {
        type: Reimbursement_Status_Type;
      };
    };
  } = Prisma.validator<Prisma.Reimbursement_RequestWhereInput>()({
    reimbursementStatuses: {
      none: {
        type: Reimbursement_Status_Type.DENIED
      }
    }
  });

  if (startDate) {
    baseWhere.dateCreated = {
      gte: startDate
    };
  }

  if (endDate) {
    baseWhere.dateCreated = {
      ...baseWhere.dateCreated,
      lte: endDate
    };
  }

  return baseWhere;
};

export const getSpendingBarDataForProjectBudgetByTeam = async (
  teamId: string,
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<SpendingBarData> => {
  const team = await prisma.team.findUnique({
    where: {
      organizationId,
      dateArchived: null,
      teamId
    },
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, startDate, endDate),
        include: {
          wbsElement: true
        }
      }
    }
  });

  if (!team) throw new NotFoundException('Team', teamId);

  const spendingInfoPromises = team.projects.map((project) =>
    getReimbursementRequestsForReimbursementRequestsByProject(project.projectId, organizationId, startDate, endDate)
  );

  const spendingInfos = await Promise.all(spendingInfoPromises);

  const data: SpendingBarData = {
    title: `${team.teamName}`,
    data: team.projects.map((project, index) => ({
      title: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
      spendingInfo: spendingInfos[index]
    }))
  };
  return data;
};

export const getSpendingBarDataForProjectBudgetByDivision = async (
  teamTypeId: string,
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<SpendingBarData[]> => {
  const division = await prisma.team_Type.findUnique({
    where: {
      organizationId,
      teamTypeId
    },
    include: {
      teams: {
        where: {
          dateArchived: null,
          teamTypeId
        },
        include: {
          projects: {
            ...getProjectSegmentedWhereInput(organizationId, startDate, endDate),
            include: {
              wbsElement: true
            }
          }
        }
      }
    }
  });

  if (!division) throw new NotFoundException('Team Type', teamTypeId);

  const teamDataPromises = division.teams.map(async (team) => {
    const spendingInfoPromises = team.projects.map((project) =>
      getReimbursementRequestsForReimbursementRequestsByProject(project.projectId, organizationId, startDate, endDate)
    );
    const spendingInfos = await Promise.all(spendingInfoPromises);

    return {
      title: `${team.teamName}`,
      data: team.projects.map((project, index) => ({
        title: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
        spendingInfo: spendingInfos[index]
      }))
    };
  });

  const data: SpendingBarData[] = await Promise.all(teamDataPromises);

  return data;
};

export const getReimbursementRequestsForReimbursementRequestsByProject = async (
  projectId: string,
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReimbursementRequestData> => {
  const project = await prisma.project.findFirst({
    where: {
      projectId,
      wbsElement: {
        organizationId,
        dateDeleted: null
      }
    }
  });

  if (!project) throw new NotFoundException('Project', projectId);

  const reimbursementRequests = await prisma.reimbursement_Request.findMany({
    where: {
      reimbursementProducts: {
        some: {
          reimbursementProductReason: {
            wbsElement: {
              project: {
                projectId
              }
            }
          }
        }
      },
      reimbursementStatuses: {
        none: {
          type: Reimbursement_Status_Type.DENIED
        }
      },
      ...getReimbursementRequestWhereInput(startDate, endDate)
    },
    ...getReimbursementRequestQueryArgs(organizationId)
  });

  let pendingFinance = 0;
  let pendingLeadership = 0;
  let submittedToSabo = 0;
  let reimbursed = 0;

  reimbursementRequests.forEach((req) => {
    const lastStatus = req.reimbursementStatuses.at(-1)?.type;

    switch (lastStatus) {
      case Reimbursement_Status_Type.PENDING_FINANCE:
        pendingFinance += req.totalCost;
        break;
      case Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL:
        pendingLeadership += req.totalCost;
        break;
      case Reimbursement_Status_Type.SABO_SUBMITTED:
        submittedToSabo += req.totalCost;
        break;
      case Reimbursement_Status_Type.REIMBURSED:
        reimbursed += req.totalCost;
        break;
      default:
        break;
    }
  });

  pendingFinance = pendingFinance / 100;
  pendingLeadership = pendingLeadership / 100;
  submittedToSabo = submittedToSabo / 100;
  reimbursed = reimbursed / 100;

  const totalBalance = reimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0) / 100;

  const available = project.budget - totalBalance;

  const data: ReimbursementRequestData = {
    totalBudget: project.budget,
    pendingFinance,
    pendingLeadership,
    submittedToSabo,
    reimbursed,
    available
  };
  return data;
};

export const getReimbursementRequestsForReimbursementRequestsByTeam = async (
  teamId: string,
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReimbursementRequestData> => {
  const team = await prisma.team.findUnique({
    where: {
      organizationId,
      dateArchived: null,
      teamId
    },
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, startDate, endDate),
        include: {
          wbsElement: true
        }
      }
    }
  });

  if (!team) throw new NotFoundException('Team', teamId);

  const reimbursementRequests = await prisma.reimbursement_Request.findMany({
    where: {
      reimbursementProducts: {
        some: {
          reimbursementProductReason: {
            wbsElement: {
              project: {
                teams: {
                  some: {
                    teamId
                  }
                }
              }
            }
          }
        }
      },
      reimbursementStatuses: {
        none: {
          type: Reimbursement_Status_Type.DENIED
        }
      },
      ...getReimbursementRequestWhereInput(startDate, endDate)
    },
    ...getReimbursementRequestQueryArgs(organizationId)
  });

  const totalBudget = team.projects.reduce((acc, curr) => acc + curr.budget, 0);

  let pendingFinance = 0;
  let pendingLeadership = 0;
  let submittedToSabo = 0;
  let reimbursed = 0;

  reimbursementRequests.forEach((req) => {
    const lastStatus = req.reimbursementStatuses.at(-1)?.type;

    switch (lastStatus) {
      case Reimbursement_Status_Type.PENDING_FINANCE:
        pendingFinance += req.totalCost;
        break;
      case Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL:
        pendingLeadership += req.totalCost;
        break;
      case Reimbursement_Status_Type.SABO_SUBMITTED:
        submittedToSabo += req.totalCost;
        break;
      case Reimbursement_Status_Type.REIMBURSED:
        reimbursed += req.totalCost;
        break;
      default:
        break;
    }
  });

  pendingFinance = pendingFinance / 100;
  pendingLeadership = pendingLeadership / 100;
  submittedToSabo = submittedToSabo / 100;
  reimbursed = reimbursed / 100;

  const totalBalance = reimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0) / 100;

  const available = totalBudget - totalBalance;

  const data: ReimbursementRequestData = {
    totalBudget,
    pendingFinance,
    pendingLeadership,
    submittedToSabo,
    reimbursed,
    available
  };
  return data;
};

export const getReimbursementRequestsForReimbursementRequestsByDivision = async (
  teamTypeId: string,
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReimbursementRequestData> => {
  const division = await prisma.team_Type.findUnique({
    where: {
      organizationId,
      teamTypeId
    },
    include: {
      teams: {
        where: {
          dateArchived: null
        },
        include: {
          projects: {
            ...getProjectSegmentedWhereInput(organizationId, startDate, endDate),
            include: {
              wbsElement: true
            }
          }
        }
      }
    }
  });

  if (!division) throw new NotFoundException('Team Type', teamTypeId);

  const results: ReimbursementRequestData = {
    totalBudget: 0,
    pendingFinance: 0,
    pendingLeadership: 0,
    submittedToSabo: 0,
    reimbursed: 0,
    available: 0
  };

  for (const team of division.teams) {
    const data: ReimbursementRequestData = await getReimbursementRequestsForReimbursementRequestsByTeam(
      team.teamId,
      organizationId,
      startDate,
      endDate
    );

    results.totalBudget += data.totalBudget;
    results.pendingFinance += data.pendingFinance;
    results.pendingLeadership += data.pendingLeadership;
    results.submittedToSabo += data.submittedToSabo;
    results.reimbursed += data.reimbursed;
    results.available += data.available;
  }

  return results;
};

export const getAllReimbursementRequestData = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReimbursementRequestData[]> => {
  const cashReimbursementRequests = await prisma.reimbursement_Request.findMany({
    where: {
      dateDeleted: null,
      accountCode: { organizationId },
      indexCode: { organizationId, name: 'CASH', code: '830667' },
      reimbursementStatuses: {
        none: {
          type: Reimbursement_Status_Type.DENIED
        }
      },
      ...getReimbursementRequestWhereInput(startDate, endDate)
    },
    ...getReimbursementRequestQueryArgs(organizationId)
  });

  const budgetReimbursementRequests = await prisma.reimbursement_Request.findMany({
    where: {
      dateDeleted: null,
      accountCode: { organizationId },
      indexCode: { organizationId, name: 'BUDGET', code: '800462' },
      reimbursementStatuses: {
        none: {
          type: Reimbursement_Status_Type.DENIED
        }
      },
      ...getReimbursementRequestWhereInput(startDate, endDate)
    },
    ...getReimbursementRequestQueryArgs(organizationId)
  });

  const allReimbursementRequests = await prisma.reimbursement_Request.findMany({
    where: {
      dateDeleted: null,
      accountCode: { organizationId },
      indexCode: { organizationId },
      reimbursementStatuses: {
        none: {
          type: Reimbursement_Status_Type.DENIED
        }
      },
      ...getReimbursementRequestWhereInput(startDate, endDate)
    },
    ...getReimbursementRequestQueryArgs(organizationId)
  });

  const teams = await prisma.team.findMany({
    where: { dateArchived: null, organizationId },
    ...getTeamQueryArgs(organizationId)
  });

  const allTotalBudget = teams.reduce((teamAcc, team) => {
    const teamBudget = team.projects.reduce((projAcc, project) => projAcc + project.budget, 0);
    return teamAcc + teamBudget;
  }, 0);

  const cashTotalBudget =
    cashReimbursementRequests.reduce((reqAcc, rr) => {
      return reqAcc + rr.totalCost;
    }, 0) / 100;

  const budgetTotalBudget =
    budgetReimbursementRequests.reduce((reqAcc, rr) => {
      return reqAcc + rr.totalCost;
    }, 0) / 100;

  let allPendingFinance = 0;
  let allPendingLeadership = 0;
  let allSubmittedToSabo = 0;
  let allReimbursed = 0;

  allReimbursementRequests.forEach((req) => {
    const lastStatus = req.reimbursementStatuses.at(-1)?.type;

    switch (lastStatus) {
      case Reimbursement_Status_Type.PENDING_FINANCE:
        allPendingFinance += req.totalCost;
        break;
      case Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL:
        allPendingLeadership += req.totalCost;
        break;
      case Reimbursement_Status_Type.SABO_SUBMITTED:
        allSubmittedToSabo += req.totalCost;
        break;
      case Reimbursement_Status_Type.REIMBURSED:
        allReimbursed += req.totalCost;
        break;
      default:
        break;
    }
  });

  allPendingFinance = allPendingFinance / 100;
  allPendingLeadership = allPendingLeadership / 100;
  allSubmittedToSabo = allSubmittedToSabo / 100;
  allReimbursed = allReimbursed / 100;

  const allTotalBalance = allReimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0) / 100;

  const allAvailable = allTotalBudget - allTotalBalance;

  let cashPendingFinance = 0;
  let cashPendingLeadership = 0;
  let cashSubmittedToSabo = 0;
  let cashReimbursed = 0;

  cashReimbursementRequests.forEach((req) => {
    const lastStatus = req.reimbursementStatuses.at(-1)?.type;

    switch (lastStatus) {
      case Reimbursement_Status_Type.PENDING_FINANCE:
        cashPendingFinance += req.totalCost;
        break;
      case Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL:
        cashPendingLeadership += req.totalCost;
        break;
      case Reimbursement_Status_Type.SABO_SUBMITTED:
        cashSubmittedToSabo += req.totalCost;
        break;
      case Reimbursement_Status_Type.REIMBURSED:
        cashReimbursed += req.totalCost;
        break;
      default:
        break;
    }
  });

  cashPendingFinance = cashPendingFinance / 100;
  cashPendingLeadership = cashPendingLeadership / 100;
  cashSubmittedToSabo = cashSubmittedToSabo / 100;
  cashReimbursed = cashReimbursed / 100;

  const cashTotalBalance = cashReimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0) / 100;

  const cashAvailable = cashTotalBudget - cashTotalBalance;

  let budgetPendingFinance = 0;
  let budgetPendingLeadership = 0;
  let budgetSubmittedToSabo = 0;
  let budgetReimbursed = 0;

  budgetReimbursementRequests.forEach((req) => {
    const lastStatus = req.reimbursementStatuses.at(-1)?.type;

    switch (lastStatus) {
      case Reimbursement_Status_Type.PENDING_FINANCE:
        budgetPendingFinance += req.totalCost;
        break;
      case Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL:
        budgetPendingLeadership += req.totalCost;
        break;
      case Reimbursement_Status_Type.SABO_SUBMITTED:
        budgetSubmittedToSabo += req.totalCost;
        break;
      case Reimbursement_Status_Type.REIMBURSED:
        budgetReimbursed += req.totalCost;
        break;
      default:
        break;
    }
  });

  budgetPendingFinance = budgetPendingFinance / 100;
  budgetPendingLeadership = budgetPendingLeadership / 100;
  budgetSubmittedToSabo = budgetSubmittedToSabo / 100;
  budgetReimbursed = budgetReimbursed / 100;

  const budgetTotalBalance = budgetReimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0) / 100;

  const budgetAvailable = budgetTotalBudget - budgetTotalBalance;

  const allData: ReimbursementRequestData = {
    totalBudget: allTotalBudget,
    pendingFinance: allPendingFinance,
    pendingLeadership: allPendingLeadership,
    submittedToSabo: allSubmittedToSabo,
    reimbursed: allReimbursed,
    available: allAvailable
  };

  const cashData: ReimbursementRequestData = {
    totalBudget: cashTotalBudget,
    pendingFinance: cashPendingFinance,
    pendingLeadership: cashPendingLeadership,
    submittedToSabo: cashSubmittedToSabo,
    reimbursed: cashReimbursed,
    available: cashAvailable
  };

  const budgetData: ReimbursementRequestData = {
    totalBudget: budgetTotalBudget,
    pendingFinance: budgetPendingFinance,
    pendingLeadership: budgetPendingLeadership,
    submittedToSabo: budgetSubmittedToSabo,
    reimbursed: budgetReimbursed,
    available: budgetAvailable
  };

  const data: ReimbursementRequestData[] = [allData, budgetData, cashData];

  return data;
};

export const getReimbursementRequestCategoryData = async (
  otherReasonId: string,
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReimbursementRequestData> => {
  const reimbursementRequests = await prisma.reimbursement_Request.findMany({
    where: {
      dateDeleted: null,
      accountCode: { organizationId },
      reimbursementStatuses: {
        none: {
          type: Reimbursement_Status_Type.DENIED
        }
      },
      reimbursementProducts: {
        some: {
          reimbursementProductReason: {
            otherReasonId
          }
        }
      },
      ...getReimbursementRequestWhereInput(startDate, endDate)
    },
    ...getReimbursementRequestQueryArgs(organizationId)
  });

  const category = await prisma.reimbursement_Product_Other_Reason.findUnique({
    where: {
      otherReimbursementProductReasonId: otherReasonId
    }
  });

  if (!category) throw new NotFoundException('Reimbursement Product Other Reason', otherReasonId);

  const totalBudget = category.budget;

  let pendingFinance = 0;
  let pendingLeadership = 0;
  let submittedToSabo = 0;
  let reimbursed = 0;

  reimbursementRequests.forEach((req) => {
    const lastStatus = req.reimbursementStatuses.at(-1)?.type;

    switch (lastStatus) {
      case Reimbursement_Status_Type.PENDING_FINANCE:
        pendingFinance += req.totalCost;
        break;
      case Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL:
        pendingLeadership += req.totalCost;
        break;
      case Reimbursement_Status_Type.SABO_SUBMITTED:
        submittedToSabo += req.totalCost;
        break;
      case Reimbursement_Status_Type.REIMBURSED:
        reimbursed += req.totalCost;
        break;
      default:
        break;
    }
  });

  const totalBalance = reimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0);

  const available = totalBudget - totalBalance;

  const data: ReimbursementRequestData = {
    totalBudget,
    pendingFinance,
    pendingLeadership,
    submittedToSabo,
    reimbursed,
    available
  };

  return data;
};

export const getSpendingBarCategoryData = async (organizationId: string): Promise<SpendingBarData> => {
  const otherReasons = await prisma.reimbursement_Product_Other_Reason.findMany({
    where: {
      dateDeleted: null,
      indexCode: {
        organizationId
      }
    }
  });

  const spendingInfoPromises = otherReasons.map((r) =>
    getReimbursementRequestCategoryData(r.otherReimbursementProductReasonId, organizationId)
  );
  const spendingInfos = await Promise.all(spendingInfoPromises);

  const data: SpendingBarData = {
    title: `Club Categories`,
    data: otherReasons.map((r, index) => ({
      title: r.name,
      spendingInfo: spendingInfos[index]
    }))
  };

  return data;
};

export const getAllSpendingBarData = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<SpendingBarData[]> => {
  const teams = await prisma.team.findMany({
    where: {
      organizationId,
      dateArchived: null
    },
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, startDate, endDate),
        include: {
          wbsElement: true
        }
      }
    }
  });

  const teamDataPromises = teams.map(async (team) => {
    const spendingInfoPromises = team.projects.map((project) =>
      getReimbursementRequestsForReimbursementRequestsByProject(project.projectId, organizationId, startDate, endDate)
    );
    const spendingInfos = await Promise.all(spendingInfoPromises);

    return {
      title: `${team.teamName}`,
      data: team.projects.map((project, index) => ({
        title: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
        spendingInfo: spendingInfos[index]
      }))
    };
  });

  const data: SpendingBarData[] = await Promise.all(teamDataPromises);

  return data;
};
