import { Prisma, Reimbursement_Status_Type, Role, User } from '@prisma/client';
import { wbsPipe, SpendingBarData, ReimbursementRequestData } from 'shared';
import prisma from '../prisma/prisma';
import { getReimbursementRequestQueryArgs } from '../prisma-query-args/reimbursement-requests.query-args';
import { NotFoundException } from './errors.utils';

const getProjectSegmentedWhereInput = (
  organizationId: string,
  startDate: Date | null = null,
  endDate: Date | null = null
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
  startDate: Date | null = null,
  endDate: Date | null = null
): {
  dataCreated?: {
    gte?: Date;
    lte?: Date;
  };
} => {
  const baseWhere: {
    dataCreated?: {
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
    baseWhere.dataCreated = {
      gte: startDate
    };
  }

  if (endDate) {
    baseWhere.dataCreated = {
      ...baseWhere.dataCreated,
      lte: endDate
    };
  }

  return baseWhere;
};

export const getSpendingBarDataForProjectBudgetByTeam = async (
  teamId: string,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null
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

  const data: SpendingBarData = {
    teamName: `${team.teamName}`,
    projects: team.projects.map((project) => ({
      title: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
      budget: project.budget
    }))
  };

  return data;
};

export const getSpendingBarDataForProjectBudgetByDivision = async (
  teamTypeId: string,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null
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

  const data: SpendingBarData[] = division.teams.map((team) => {
    return {
      teamName: `${team.teamName}`,
      projects: team.projects.map((project) => ({
        title: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
        budget: project.budget
      }))
    };
  });

  return data;
};

export const getReimbursementRequestsForReimbursementRequestsByProject = async (
  projectId: string,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<ReimbursementRequestData> => {
  const project = await prisma.project.findUnique({
    where: {
      projectId,
      ...getProjectSegmentedWhereInput(organizationId)
    },
    include: {
      wbsElement: true
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
      ...getReimbursementRequestWhereInput(startDate, endDate)
    },
    ...getReimbursementRequestQueryArgs(organizationId)
  });

  const pendingFinance = reimbursementRequests.reduce((acc, curr) => {
    if (curr.reimbursementStatuses[curr.reimbursementStatuses.length - 1].type === 'PENDING_FINANCE') {
      return acc + curr.totalCost;
    }
    return acc;
  }, 0);

  const pendingLeadership = reimbursementRequests.reduce((acc, curr) => {
    if (curr.reimbursementStatuses[curr.reimbursementStatuses.length - 1].type === 'PENDING_LEADERSHIP_APPROVAL') {
      return acc + curr.totalCost;
    }
    return acc;
  }, 0);

  const submittedToSabo = reimbursementRequests.reduce((acc, curr) => {
    if (curr.reimbursementStatuses[curr.reimbursementStatuses.length - 1].type === 'SABO_SUBMITTED') {
      return acc + curr.totalCost;
    }
    return acc;
  }, 0);

  const reimbursed = reimbursementRequests.reduce((acc, curr) => {
    if (curr.reimbursementStatuses[curr.reimbursementStatuses.length - 1].type === 'REIMBURSED') {
      return acc + curr.totalCost;
    }
    return acc;
  }, 0);

  const totalBalance = reimbursementRequests.reduce((acc, curr) => acc + curr.totalCost, 0);

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
  startDate: Date | null,
  endDate: Date | null
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
      ...getReimbursementRequestWhereInput(startDate, endDate)
    },
    ...getReimbursementRequestQueryArgs(organizationId)
  });

  const totalBudget = team.projects.reduce((acc, curr) => acc + curr.budget, 0);

  const pendingFinance = reimbursementRequests.reduce((acc, curr) => {
    if (
      curr.reimbursementStatuses[curr.reimbursementStatuses.length - 1].type === Reimbursement_Status_Type.PENDING_FINANCE
    ) {
      return acc + curr.totalCost;
    }
    return acc;
  }, 0);

  const pendingLeadership = reimbursementRequests.reduce((acc, curr) => {
    if (
      curr.reimbursementStatuses[curr.reimbursementStatuses.length - 1].type ===
      Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL
    ) {
      return acc + curr.totalCost;
    }
    return acc;
  }, 0);

  const submittedToSabo = reimbursementRequests.reduce((acc, curr) => {
    if (
      curr.reimbursementStatuses[curr.reimbursementStatuses.length - 1].type === Reimbursement_Status_Type.SABO_SUBMITTED
    ) {
      return acc + curr.totalCost;
    }
    return acc;
  }, 0);

  const reimbursed = reimbursementRequests.reduce((acc, curr) => {
    if (curr.reimbursementStatuses[curr.reimbursementStatuses.length - 1].type === Reimbursement_Status_Type.REIMBURSED) {
      return acc + curr.totalCost;
    }
    return acc;
  }, 0);

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

export const getReimbursementRequestsForReimbursementRequestsByDivision = async (
  teamTypeId: string,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<ReimbursementRequestData[]> => {
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

  const results = [];

  for (const team of division.teams) {
    const data: ReimbursementRequestData = await getReimbursementRequestsForReimbursementRequestsByTeam(
      team.teamId,
      organizationId,
      startDate,
      endDate
    );

    results.push(data);
  }

  return results;
};

export const getReimbursementRequestDataForAdminFinance = (
  teamTypeId: string,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<ReimbursementRequestData[]> => {
  return getReimbursementRequestsForReimbursementRequestsByDivision(teamTypeId, organizationId, startDate, endDate);
};

export const getReimbursementRequestDataForNonAdminFinance = (
  teamId: string,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<ReimbursementRequestData> => {
  return getReimbursementRequestsForReimbursementRequestsByTeam(teamId, organizationId, startDate, endDate);
};

export const getSpendingBarDataForAdminFinance = (
  teamTypeId: string,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<SpendingBarData[]> => {
  return getSpendingBarDataForProjectBudgetByDivision(teamTypeId, organizationId, startDate, endDate);
};

export const getSpendingBarDataForNonAdminFinance = (
  teamId: string,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<SpendingBarData> => {
  return getSpendingBarDataForProjectBudgetByTeam(teamId, organizationId, startDate, endDate);
};
