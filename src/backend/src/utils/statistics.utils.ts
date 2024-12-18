import { Measure } from '@prisma/client';
import { GraphData, wbsPipe, wbsNamePipe } from 'shared';
import prisma from '../prisma/prisma';

interface CarSegmentedData {
  carIds: string[];
}

export interface ProjectDataParams extends CarSegmentedData {}

export interface ChangeRequestDataParams extends CarSegmentedData {}

export interface ReimbursementRequestDataParams extends CarSegmentedData {}

const getProjectSegmentedWhereInput = (
  organizationId: string,
  carIds: string[]
):
  | { where: { wbsElement: { organizationId: string; dateDeleted: null }; carId: { in: string[] } } }
  | { where: { wbsElement: { organizationId: string; dateDeleted: null } } } => {
  if (carIds.length > 0) {
    return {
      where: {
        wbsElement: {
          organizationId,
          dateDeleted: null
        },
        carId: { in: carIds }
      }
    };
  }

  return {
    where: {
      wbsElement: {
        organizationId,
        dateDeleted: null
      }
    }
  };
};

export const getGraphDataForProjectBudgetByProject = async (
  _measure: Measure,
  organizationId: string,
  params: ProjectDataParams
): Promise<GraphData[]> => {
  const projects = await prisma.project.findMany({
    ...getProjectSegmentedWhereInput(organizationId, params.carIds),
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
  params: ProjectDataParams
): Promise<GraphData[]> => {
  const teams = await prisma.team.findMany({
    where: {
      organizationId,
      dateArchived: null
    },
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, params.carIds)
      }
    }
  });

  const data: GraphData[] = teams.map((team) => {
    let value = team.projects.reduce((prev, curr) => {
      return prev + curr.budget;
    }, 0);

    if (measure === Measure.AVG) {
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
            ...getProjectSegmentedWhereInput(organizationId, params.carIds)
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

    if (measure === Measure.AVG) {
      value = value / numProjects;
    }

    return {
      value,
      label: `${division.name}`
    };
  });

  return data;
};

const changeRequestProjectDataQueryArgs = {
  include: {
    wbsElement: {
      include: {
        changeRequests: true
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
            changeRequests: true
          }
        }
      }
    }
  }
};

export const getGraphDataForChangeRequestsByProject = async (
  _measure: Measure,
  organizationId: string,
  params: ChangeRequestDataParams
): Promise<GraphData[]> => {
  const projects = await prisma.project.findMany({
    ...getProjectSegmentedWhereInput(organizationId, params.carIds),
    ...changeRequestProjectDataQueryArgs
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

const changeRequestTeamQueryArgs = (organizationId: string, carIds: string[]) => {
  return {
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, carIds),
        ...changeRequestProjectDataQueryArgs
      }
    }
  };
};

export const getGraphDataForChangeRequestsByTeam = async (
  measure: Measure,
  organizationId: string,
  params: ChangeRequestDataParams
): Promise<GraphData[]> => {
  const teams = await prisma.team.findMany({
    where: { organizationId, dateArchived: null },
    ...changeRequestTeamQueryArgs(organizationId, params.carIds)
  });

  const data: GraphData[] = teams.map((team) => {
    let value = team.projects.reduce((prev, curr) => {
      const workPackageChangeRequests = curr.workPackages.reduce(
        (prev, curr) => prev + curr.wbsElement.changeRequests.length,
        0
      );

      return prev + curr.wbsElement.changeRequests.length + workPackageChangeRequests;
    }, 0);

    if (measure === Measure.AVG) {
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
  params: ChangeRequestDataParams
): Promise<GraphData[]> => {
  const divisions = await prisma.team_Type.findMany({
    where: { organizationId },
    include: {
      teams: {
        where: {
          dateArchived: null
        },
        ...changeRequestTeamQueryArgs(organizationId, params.carIds)
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

    if (measure === Measure.AVG) {
      value = value / numProjects;
    }

    return {
      value,
      label: division.name
    };
  });

  return data;
};

const reimbursementProductProjectDataQueryArgs = {
  include: {
    wbsElement: {
      include: {
        reimbursementProductReasons: {
          include: {
            reimbursementProduct: {
              where: {
                dateDeleted: null
              }
            }
          }
        }
      }
    }
  }
};

export const getGraphDataForReimbursementRequestsByProject = async (
  measure: Measure,
  organizationId: string,
  params: ReimbursementRequestDataParams
) => {
  const projects = await prisma.project.findMany({
    ...getProjectSegmentedWhereInput(organizationId, params.carIds),
    ...reimbursementProductProjectDataQueryArgs
  });

  const data: GraphData[] = projects.map((project) => {
    let value = project.wbsElement.reimbursementProductReasons.reduce((prev, curr) => {
      return prev + (curr.reimbursementProduct?.cost ?? 0);
    }, 0);

    if (measure === Measure.AVG) {
      value = value / project.wbsElement.reimbursementProductReasons.length;
    }

    return {
      value,
      label: wbsNamePipe({ wbsNum: project.wbsElement, name: project.wbsElement.name })
    };
  });

  return data;
};

const reimbursementProductTeamDataQueryArgs = (organizationId: string, carIds: string[]) => {
  return {
    include: {
      projects: {
        ...getProjectSegmentedWhereInput(organizationId, carIds),
        ...reimbursementProductProjectDataQueryArgs
      }
    }
  };
};

export const getGraphDataForReimbursementRequestsByTeam = async (
  measure: Measure,
  organizationId: string,
  params: ReimbursementRequestDataParams
) => {
  const teams = await prisma.team.findMany({
    where: {
      dateArchived: null,
      organizationId
    },
    ...reimbursementProductTeamDataQueryArgs(organizationId, params.carIds)
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

    if (measure === Measure.AVG) {
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
        ...reimbursementProductTeamDataQueryArgs(organizationId, params.carIds)
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

    if (measure === Measure.AVG) {
      value = value / division.teams.length;
    }

    return {
      value,
      label: division.name
    };
  });

  return data;
};
