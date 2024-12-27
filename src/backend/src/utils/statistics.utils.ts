import { Graph_Type, Measure, Organization, Prisma, User } from '@prisma/client';
import { GraphData, wbsPipe, wbsNamePipe, Permission } from 'shared';
import prisma from '../prisma/prisma';
import { getGraphCollectionQueryArgs } from '../prisma-query-args/statistics.query-args';
import { AccessDeniedException, DeletedException, InvalidOrganizationException, NotFoundException } from './errors.utils';
import { userHasPermissionNew } from './users.utils';

interface CarSegmentedData {
  carIds: string[];
}

export interface ProjectDataParams extends CarSegmentedData {}

export interface ChangeRequestDataParams extends CarSegmentedData {}

export interface ReimbursementRequestDataParams extends CarSegmentedData {}

const getProjectSegmentedWhereInput = (
  organizationId: string,
  carIds: string[],
  startDate: Date | null = null,
  endDate: Date | null = null
): {
  where: {
    wbsElement: { organizationId: string; dateDeleted: null; dateCreated?: { gte?: Date; lte?: Date } };
    carId?: { in: string[] };
  };
} => {
  const baseWhere: {
    where: {
      wbsElement: { organizationId: string; dateDeleted: null; dateCreated?: { gte?: Date; lte?: Date } };
      carId?: { in: string[] };
    };
  } = Prisma.validator<Prisma.ProjectFindManyArgs>()({
    where: {
      wbsElement: {
        organizationId,
        dateDeleted: null
      }
    }
  });

  if (carIds.length > 0) {
    baseWhere.where.carId = { in: carIds };
  }

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

export const getGraphDataForProjectBudgetByProject = async (
  _measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ProjectDataParams
): Promise<GraphData[]> => {
  const projects = await prisma.project.findMany({
    ...getProjectSegmentedWhereInput(organizationId, params.carIds, startDate, endDate),
    include: {
      wbsElement: true
    }
  });

  const data: GraphData[] = projects.map((project) => {
    return {
      value: project.budget,
      label: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`
    };
  });

  return data;
};

export const getGraphDataForProjectBudgetByTeam = async (
  measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ProjectDataParams
): Promise<GraphData[]> => {
  const teams = await prisma.team.findMany({
    where: {
      organizationId,
      dateArchived: null
    },
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, params.carIds, startDate, endDate)
      }
    }
  });

  const data: GraphData[] = teams.map((team) => {
    let value = team.projects.reduce((prev, curr) => {
      return prev + curr.budget;
    }, 0);

    if (measure === Measure.AVG && team.projects.length > 0) {
      value = value / team.projects.length;
    }

    return {
      value,
      label: `${team.teamName}`
    };
  });

  return data;
};

export const getGraphDataForProjectBudgetByDivision = async (
  measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ProjectDataParams
): Promise<GraphData[]> => {
  const divisions = await prisma.team_Type.findMany({
    where: {
      organizationId
    },
    include: {
      teams: {
        where: {
          dateArchived: null
        },
        include: {
          projects: {
            ...getProjectSegmentedWhereInput(organizationId, params.carIds, startDate, endDate)
          }
        }
      }
    }
  });

  const data: GraphData[] = divisions.map((division) => {
    let numProjects = 0;

    let value = division.teams.reduce((prev, curr) => {
      return (
        prev +
        curr.projects.reduce((prev, curr) => {
          numProjects++;
          return prev + curr.budget;
        }, 0)
      );
    }, 0);

    if (measure === Measure.AVG && numProjects > 0) {
      value = value / numProjects;
    }

    return {
      value,
      label: `${division.name}`
    };
  });

  return data;
};

const changeRequestProjectDataQueryArgs = (startDate: Date | null, endDate: Date | null) => {
  const baseWhere = Prisma.validator<Prisma.ProjectDefaultArgs>()({
    include: {
      wbsElement: {
        include: {
          changeRequests: { where: { dateSubmitted: {} } }
        }
      },
      workPackages: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        include: {
          wbsElement: {
            include: {
              changeRequests: {
                where: {
                  dateSubmitted: {}
                }
              }
            }
          }
        }
      }
    }
  });

  if (startDate) {
    baseWhere.include.wbsElement.include.changeRequests.where.dateSubmitted = { gte: startDate };
    baseWhere.include.workPackages.include.wbsElement.include.changeRequests.where.dateSubmitted = { gte: startDate };
  }

  if (endDate) {
    baseWhere.include.wbsElement.include.changeRequests.where.dateSubmitted = {
      ...baseWhere.include.wbsElement.include.changeRequests.where.dateSubmitted,
      lte: endDate
    };
    baseWhere.include.workPackages.include.wbsElement.include.changeRequests.where.dateSubmitted = { lte: endDate };
  }

  return baseWhere;
};

export const getGraphDataForChangeRequestsByProject = async (
  _measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ChangeRequestDataParams
): Promise<GraphData[]> => {
  const projects = await prisma.project.findMany({
    ...getProjectSegmentedWhereInput(organizationId, params.carIds),
    ...changeRequestProjectDataQueryArgs(startDate, endDate)
  });

  const data: GraphData[] = projects.map((project) => {
    const workPackageChangeRequestsValue = project.workPackages.reduce(
      (prev, curr) => prev + curr.wbsElement.changeRequests.length,
      0
    );

    return {
      value: project.wbsElement.changeRequests.length + workPackageChangeRequestsValue,
      label: wbsNamePipe({ wbsNum: project.wbsElement, name: project.wbsElement.name })
    };
  });

  return data;
};

const changeRequestTeamQueryArgs = (
  organizationId: string,
  carIds: string[],
  startDate: Date | null,
  endDate: Date | null
) => {
  return {
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, carIds),
        ...changeRequestProjectDataQueryArgs(startDate, endDate)
      }
    }
  };
};

export const getGraphDataForChangeRequestsByTeam = async (
  measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ChangeRequestDataParams
): Promise<GraphData[]> => {
  const teams = await prisma.team.findMany({
    where: { organizationId, dateArchived: null },
    ...changeRequestTeamQueryArgs(organizationId, params.carIds, startDate, endDate)
  });

  const data: GraphData[] = teams.map((team) => {
    let value = team.projects.reduce((prev, curr) => {
      const workPackageChangeRequests = curr.workPackages.reduce(
        (prev, curr) => prev + curr.wbsElement.changeRequests.length,
        0
      );

      return prev + curr.wbsElement.changeRequests.length + workPackageChangeRequests;
    }, 0);

    if (measure === Measure.AVG && team.projects.length > 0) {
      value = value / team.projects.length;
    }

    return {
      value,
      label: team.teamName
    };
  });

  return data;
};

export const getGraphDataForChangeRequestsByDivision = async (
  measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ChangeRequestDataParams
): Promise<GraphData[]> => {
  const divisions = await prisma.team_Type.findMany({
    where: { organizationId },
    include: {
      teams: {
        where: {
          dateArchived: null
        },
        ...changeRequestTeamQueryArgs(organizationId, params.carIds, startDate, endDate)
      }
    }
  });

  const data: GraphData[] = divisions.map((division) => {
    let numProjects = 0;
    let value = division.teams.reduce((prev, curr) => {
      return (
        prev +
        curr.projects.reduce((prev, curr) => {
          numProjects++;
          const workPackageChangeRequests = curr.workPackages.reduce(
            (prev, curr) => prev + curr.wbsElement.changeRequests.length,
            0
          );

          return prev + curr.wbsElement.changeRequests.length + workPackageChangeRequests;
        }, 0)
      );
    }, 0);

    if (measure === Measure.AVG && numProjects > 0) {
      value = value / numProjects;
    }

    return {
      value,
      label: division.name
    };
  });

  return data;
};

const reimbursementProductProjectDataQueryArgs = (startDate: Date | null, endDate: Date | null) => {
  const baseWhere = Prisma.validator<Prisma.ProjectDefaultArgs>()({
    include: {
      wbsElement: {
        include: {
          reimbursementProductReasons: {
            include: {
              reimbursementProduct: {
                where: {
                  dateDeleted: null,
                  reimbursementRequest: {
                    dateCreated: {}
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (startDate) {
    baseWhere.include.wbsElement.include.reimbursementProductReasons.include.reimbursementProduct.where.reimbursementRequest.dateCreated =
      { gte: startDate };
  }

  if (endDate) {
    baseWhere.include.wbsElement.include.reimbursementProductReasons.include.reimbursementProduct.where.reimbursementRequest.dateCreated =
      {
        ...baseWhere.include.wbsElement.include.reimbursementProductReasons.include.reimbursementProduct.where
          .reimbursementRequest.dateCreated,
        lte: endDate
      };
  }

  return baseWhere;
};

export const getGraphDataForReimbursementRequestsByProject = async (
  measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ReimbursementRequestDataParams
) => {
  const projects = await prisma.project.findMany({
    ...getProjectSegmentedWhereInput(organizationId, params.carIds),
    ...reimbursementProductProjectDataQueryArgs(startDate, endDate)
  });

  const data: GraphData[] = projects.map((project) => {
    let value = project.wbsElement.reimbursementProductReasons.reduce((prev, curr) => {
      return prev + (curr.reimbursementProduct?.cost ?? 0);
    }, 0);

    if (measure === Measure.AVG && project.wbsElement.reimbursementProductReasons.length > 0) {
      value = value / project.wbsElement.reimbursementProductReasons.length;
    }

    return {
      value,
      label: wbsNamePipe({ wbsNum: project.wbsElement, name: project.wbsElement.name })
    };
  });

  return data;
};

const reimbursementProductTeamDataQueryArgs = (
  organizationId: string,
  carIds: string[],
  startDate: Date | null,
  endDate: Date | null
) => {
  return Prisma.validator<Prisma.TeamDefaultArgs>()({
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, carIds),
        ...reimbursementProductProjectDataQueryArgs(startDate, endDate)
      }
    }
  });
};

export const getGraphDataForReimbursementRequestsByTeam = async (
  measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ReimbursementRequestDataParams
) => {
  const teams = await prisma.team.findMany({
    where: {
      dateArchived: null,
      organizationId
    },
    ...reimbursementProductTeamDataQueryArgs(organizationId, params.carIds, startDate, endDate)
  });

  const data: GraphData[] = teams.map((team) => {
    let value = team.projects.reduce((prev, curr) => {
      return (
        prev +
        curr.wbsElement.reimbursementProductReasons.reduce((prev, curr) => {
          return prev + (curr.reimbursementProduct?.cost ?? 0);
        }, 0)
      );
    }, 0);

    if (measure === Measure.AVG && team.projects.length > 0) {
      value = value / team.projects.length;
    }

    return {
      value,
      label: team.teamName
    };
  });

  return data;
};

export const getGraphDataForReimbursementRequestsByDivision = async (
  measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: ReimbursementRequestDataParams
) => {
  const divisions = await prisma.team_Type.findMany({
    where: {
      dateDeleted: null,
      organizationId
    },
    include: {
      teams: {
        where: {
          dateArchived: null
        },
        ...reimbursementProductTeamDataQueryArgs(organizationId, params.carIds, startDate, endDate)
      }
    }
  });

  const data: GraphData[] = divisions.map((division) => {
    let value = division.teams.reduce((prev, curr) => {
      return (
        prev +
        curr.projects.reduce((prev, curr) => {
          return (
            prev +
            curr.wbsElement.reimbursementProductReasons.reduce((prev, curr) => {
              return prev + (curr.reimbursementProduct?.cost ?? 0);
            }, 0)
          );
        }, 0)
      );
    }, 0);

    if (measure === Measure.AVG && division.teams.length > 0) {
      value = value / division.teams.length;
    }

    return {
      value,
      label: division.name
    };
  });

  return data;
};

export const getGraphData = (
  graphType: Graph_Type,
  measure: Measure,
  organizationId: string,
  startDate: Date | null,
  endDate: Date | null,
  params: { carIds: string[] }
): Promise<GraphData[]> => {
  switch (graphType) {
    case Graph_Type.PROJECT_BUDGET_BY_PROJECT:
      return getGraphDataForProjectBudgetByProject(measure, organizationId, startDate, endDate, params);
    case Graph_Type.PROJECT_BUDGET_BY_TEAM:
      return getGraphDataForProjectBudgetByTeam(measure, organizationId, startDate, endDate, params);
    case Graph_Type.PROJECT_BUDGET_BY_DIVISION:
      return getGraphDataForProjectBudgetByDivision(measure, organizationId, startDate, endDate, params);
    case Graph_Type.CHANGE_REQUESTS_BY_PROJECT:
      return getGraphDataForChangeRequestsByProject(measure, organizationId, startDate, endDate, params);
    case Graph_Type.CHANGE_REQUESTS_BY_TEAM:
      return getGraphDataForChangeRequestsByTeam(measure, organizationId, startDate, endDate, params);
    case Graph_Type.CHANGE_REQUESTS_BY_DIVISION:
      return getGraphDataForChangeRequestsByDivision(measure, organizationId, startDate, endDate, params);
    case Graph_Type.REIMBURSEMENT_TOTAL_BY_PROJECT:
      return getGraphDataForReimbursementRequestsByProject(measure, organizationId, startDate, endDate, params);
    case Graph_Type.REIMBURSEMENT_TOTAL_BY_TEAM:
      return getGraphDataForReimbursementRequestsByTeam(measure, organizationId, startDate, endDate, params);
    case Graph_Type.REIMBURSEMENT_TOTAL_BY_DIVISION:
      return getGraphDataForReimbursementRequestsByDivision(measure, organizationId, startDate, endDate, params);
  }
};

export const getGraphCollectionAndVerifyPermissions = async (
  user: User,
  graphCollectionId: string,
  organization: Organization
) => {
  const requestedGraphCollection = await prisma.graph_Collection.findUnique({
    where: { id: graphCollectionId, organizationId: organization.organizationId },
    ...getGraphCollectionQueryArgs(organization.organizationId)
  });

  if (!requestedGraphCollection) throw new NotFoundException('Graph Collection', graphCollectionId);
  if (requestedGraphCollection.dateDeleted) throw new DeletedException('Graph', graphCollectionId);
  if (requestedGraphCollection.organizationId !== organization.organizationId)
    throw new InvalidOrganizationException('Graph');
  if (
    !(await userHasPermissionNew(user.userId, organization.organizationId, [
      ...requestedGraphCollection.viewPermissions,
      Permission.VIEW_GRAPH
    ]))
  ) {
    throw new AccessDeniedException('You do not have permission to view graphs');
  }

  return requestedGraphCollection;
};
