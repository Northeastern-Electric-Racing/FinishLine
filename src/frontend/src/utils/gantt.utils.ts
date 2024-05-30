/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  isProject,
  isWorkPackage,
  Project,
  ProjectPreview,
  Team,
  User,
  validateWBS,
  WbsElement,
  WbsElementStatus,
  WbsNumber,
  wbsPipe,
  WorkPackage,
  WorkPackageStage
} from 'shared';
import { projectWbsPipe } from './pipes';
import dayjs from 'dayjs';
import { deepOrange, green, grey, indigo, orange, pink, yellow } from '@mui/material/colors';

export const NO_TEAM = 'No Team';

export const GANTT_CHART_GAP_SIZE = '0.75rem';
export const GANTT_CHART_CELL_SIZE = '2.25rem';

export interface GanttTaskData {
  id: string;
  name: string;
  start: Date;
  end: Date;
  projectNumber: number;
  carNumber: number;
  unblockedWorkPackages: WorkPackage[];
  blocking: WbsNumber[];
  blockedByIds: string[];

  // Optional Values
  styles?: {
    color?: string;
    backgroundColor?: string;
    backgroundSelectedColor?: string;
  };
  stage?: WorkPackageStage;
  projectId?: string;
  onClick?: () => void;
  lead?: User;
  manager?: User;
}

export type Date_Event = { id: string; start: Date; end: Date; title: string };

export type EventChange = { id: string; eventId: string } & (
  | { type: 'change-end-date'; originalEnd: Date; newEnd: Date }
  | { type: 'shift-by-days'; days: number }
  | { type: 'create-project' }
  | { type: 'create-work-package'; name: string; stage?: WorkPackageStage; start: Date; end: Date }
);

export type RequestEventChange = {
  taskId: string;
  name: string;
  prevStart: Date;
  prevEnd: Date;
  newStart: Date;
  newEnd: Date;
  duration: number;
  stage?: WorkPackageStage;
  teamName: string;
  baseWbs: WbsNumber;
  workPackageChanges: RequestEventChange[];
  createProject?: boolean;
};

const getProjectStartDate = (project: ProjectPreview): Date => {
  return project.workPackages.reduce((acc, current) => {
    if (current.startDate < acc) return current.startDate;
    return acc;
  }, new Date(3000, 0, 1)); // Set Date to Year 3000
};

const getProjectEndDate = (project: ProjectPreview): Date => {
  return project.workPackages.reduce((acc, current) => {
    if (current.endDate > acc) return current.endDate;
    return acc;
  }, new Date(0));
};

export const applyChangeToEvent = (
  eventChanges: EventChange[],
  wbsElement: WbsElement,
  parentProject: Project
): WbsElement => {
  let workPackages: WbsElement[] = [];
  if (isProject(wbsElement.wbsNum)) {
    const project = wbsElement as Project;
    workPackages = project.workPackages.map((wp) => applyChangeToEvent(eventChanges, wp, parentProject));
  }

  if (isWorkPackage(wbsElement.wbsNum)) {
    const workPackage = wbsElement as WorkPackage;
    workPackage.immediatelyBlocking.map((blockedWorkPacakge) => {
      const workPackage = parentProject.workPackages.find((wp) => wp.wbsNum === blockedWorkPacakge);
      if (!workPackage) {
        throw new Error('Work Package not found when applying changes to event for: ' + blockedWorkPacakge);
      }
      return applyChangeToEvent(eventChanges, workPackage, parentProject);
    });
  }

  const currentEventChanges = eventChanges.filter((ec) => ec.eventId === wbsElement.id);

  let blockedByEventChanges: EventChange[] = [];
  if (isWorkPackage(wbsElement.wbsNum)) {
    const workPackage = wbsElement as WorkPackage;
    blockedByEventChanges = eventChanges.filter((ec) => workPackage.blockedBy.includes(validateWBS(ec.eventId)));
  }

  if (isWorkPackage(wbsElement.wbsNum)) {
    const changedEvent = wbsElement as WorkPackage;
    for (const eventChange of currentEventChanges) {
      switch (eventChange.type) {
        case 'change-end-date': {
          changedEvent.endDate = eventChange.newEnd;
          break;
        }
        case 'shift-by-days': {
          changedEvent.startDate = dayjs(changedEvent.startDate).add(eventChange.days, 'days').toDate();
          changedEvent.endDate = dayjs(changedEvent.endDate).add(eventChange.days, 'days').toDate();
          break;
        }
      }
    }
    const totalTimelineImpact = blockedByEventChanges.reduce((acc, currentEventChange) => {
      switch (currentEventChange.type) {
        case 'change-end-date': {
          const timelineImpact = dayjs(currentEventChange.newEnd).diff(dayjs(currentEventChange.originalEnd), 'days');
          return acc + timelineImpact;
        }
        case 'shift-by-days': {
          return acc + currentEventChange.days;
        }
        default:
          return acc;
      }
    }, 0);

    if (totalTimelineImpact > 0) {
      changedEvent.startDate = dayjs(changedEvent.startDate).add(totalTimelineImpact, 'days').toDate();
      changedEvent.endDate = dayjs(changedEvent.endDate).add(totalTimelineImpact, 'days').toDate();
    }

    return changedEvent;
  } else if (isProject(wbsElement.wbsNum)) {
    const changedEvent = wbsElement as Project;
    changedEvent.workPackages = workPackages as WorkPackage[];

    return changedEvent;
  }

  return wbsElement;
};

export const applyChangesToEvents = (
  wbsElements: WbsElement[],
  eventChanges: EventChange[],
  allProjects: Project[]
): WbsElement[] => {
  return wbsElements.map((wbsElement) => {
    const parentProject = allProjects.find((e) => e.id === wbsElement.id);
    if (!parentProject) throw new Error('Parent project not found when applying changes to events for: ' + wbsElement.id);
    return applyChangeToEvent(eventChanges, wbsElement, parentProject);
  });
};

export interface GanttFilters {
  showCars: number[];
  showTeamTypes: string[];
  showTeams: string[];
  showOnlyOverdue: boolean;
}

export interface GanttTask extends GanttTaskData {
  teamName: string;
}

export const filterGanttProjects = (
  projects: ProjectPreview[],
  ganttFilters: GanttFilters,
  searchText: string,
  team: Team
): ProjectPreview[] => {
  // inclusive filters
  if (ganttFilters.showCars.length > 0)
    projects = projects.filter((project) => ganttFilters.showCars.some((car) => project.wbsNum.carNumber === car));

  if (ganttFilters.showTeamTypes.length > 0)
    projects = ganttFilters.showTeamTypes.some((teamType) => team.teamType && team.teamType.name === teamType)
      ? projects
      : [];

  if (ganttFilters.showTeams.length > 0) projects = ganttFilters.showTeams.some((team) => team) ? projects : [];

  // shows only active and inactive projects
  projects = projects.filter((project) => project.status !== WbsElementStatus.Complete);

  if (ganttFilters.showOnlyOverdue) {
    projects = projects.filter((project) => getProjectEndDate(project) < new Date());
  }

  // apply the search
  projects = projects.filter((project) => project.name.toLowerCase().includes(searchText.toLowerCase()));

  projects = projects.filter((project) => getProjectEndDate(project).getFullYear() !== 1969);

  return projects;
};

export const buildGanttSearchParams = (ganttFilters: GanttFilters): string => {
  const carFormat = (name: string) => {
    return `&car=${name}`;
  };

  const teamTypeFormat = (name: string) => {
    return `&teamType=${name}`;
  };

  const teamFormat = (name: string) => {
    return `&team=${name}`;
  };

  const newParams =
    '?' +
    ganttFilters.showCars.map((car) => carFormat(car.toString())).join('') +
    ganttFilters.showTeamTypes.map(teamTypeFormat).join('') +
    ganttFilters.showTeams.map(teamFormat).join('') +
    `&overdue=${ganttFilters.showOnlyOverdue}`;

  localStorage.setItem('ganttURL', newParams);

  return newParams;
};

export const transformWorkPackageToGanttTask = (workPackage: WorkPackage, teamName: string): GanttTask => {
  return {
    id: wbsPipe(workPackage.wbsNum),
    name: wbsPipe(workPackage.wbsNum) + ' ' + workPackage.name,
    start: workPackage.startDate,
    end: workPackage.endDate,
    projectId: projectWbsPipe(workPackage.wbsNum),
    projectNumber: workPackage.wbsNum.projectNumber,
    carNumber: workPackage.wbsNum.carNumber,
    blockedByIds: workPackage.blockedBy.map(wbsPipe),
    teamName,
    stage: workPackage.stage,
    unblockedWorkPackages: [],
    blocking: workPackage.immediatelyBlocking,
    styles: {
      color: GanttWorkPackageTextColorPipe(workPackage.stage),
      backgroundColor: GanttWorkPackageStageColorPipe(workPackage.stage, workPackage.status)
    },
    onClick: () => {
      window.open(`/projects/${wbsPipe(workPackage.wbsNum)}`, '_blank');
    },
    lead: workPackage.lead,
    manager: workPackage.manager
  };
};

export const getProjectsTeamNames = (projects: Project[]): Set<string> => {
  const teamNames: Set<string> = new Set();
  projects.forEach((project) => {
    project.teams.forEach((team) => {
      teamNames.add(team.teamName);
    });
  });

  return teamNames;
};

export const transformProjectToGanttTask = (project: ProjectPreview, teamName: string): GanttTask => {
  const startDate = getProjectStartDate(project);

  const endDate = getProjectEndDate(project);

  return {
    id: wbsPipe(project.wbsNum),
    name: wbsPipe(project.wbsNum) + ' - ' + project.name,
    start: startDate === new Date(3000, 0, 1) ? new Date() : startDate,
    end: endDate === new Date(0) ? new Date() : endDate,
    projectNumber: project.wbsNum.projectNumber,
    carNumber: project.wbsNum.carNumber,
    blockedByIds: [],
    teamName,
    lead: project.lead,
    manager: project.manager,
    unblockedWorkPackages: project.workPackages.filter((wp) => wp.blockedBy.length === 0),
    blocking: [],
    onClick: () => {
      window.open(`/projects/${wbsPipe(project.wbsNum)}`, '_blank');
    }
  };
};

/**
 * Comparator to sort WBS Numbers in ascending order.
 * @param a WBS Number 1
 * @param b WBS Number 2
 */
export const sortWbs = (a: { wbsNum: WbsNumber }, b: { wbsNum: WbsNumber }) => {
  const aWbsNum = a.wbsNum;
  const bWbsNum = b.wbsNum;
  if (aWbsNum.carNumber !== bWbsNum.carNumber) {
    return aWbsNum.carNumber - bWbsNum.carNumber;
  }
  if (aWbsNum.projectNumber !== bWbsNum.projectNumber) {
    return aWbsNum.projectNumber - bWbsNum.projectNumber;
  }
  return aWbsNum.workPackageNumber - bWbsNum.workPackageNumber;
};

/**
 * Sort function for the teams on the Gantt chart.
 * @param a name of team
 * @param b name of other team
 * @returns a number for sorting
 */
export const sortTeamList = (a: Team, b: Team, ganttFilters: GanttFilters, searchText: string): number => {
  const aProjects = filterGanttProjects(a.projects, ganttFilters, searchText, a);
  const bProjects = filterGanttProjects(b.projects, ganttFilters, searchText, b);
  if (aProjects.length === 0) return Number.MAX_SAFE_INTEGER;
  if (bProjects.length === 0) return Number.MIN_SAFE_INTEGER;

  return a.teamName.localeCompare(b.teamName);
};

// maps stage and status to the desired color for Gantt Chart
export const GanttWorkPackageStageColorPipe: (stage: WorkPackageStage | undefined, status: WbsElementStatus) => string = (
  stage,
  status
) => {
  if (status === WbsElementStatus.Active) {
    switch (stage) {
      case WorkPackageStage.Research:
        return orange[800];
      case WorkPackageStage.Design:
        return green[800];
      case WorkPackageStage.Manufacturing:
        return indigo[600];
      case WorkPackageStage.Install:
        return pink[500];
      case WorkPackageStage.Testing:
        return yellow[600];
      default:
        return grey[500];
    }
  } else if (status === WbsElementStatus.Inactive) {
    switch (stage) {
      case WorkPackageStage.Research:
        return orange[500];
      case WorkPackageStage.Design:
        return green[600];
      case WorkPackageStage.Manufacturing:
        return indigo[400];
      case WorkPackageStage.Install:
        return pink[300];
      case WorkPackageStage.Testing:
        return yellow[300];
      default:
        return grey[500];
    }
  } else {
    switch (stage) {
      case WorkPackageStage.Research:
        return deepOrange[800];
      case WorkPackageStage.Design:
        return green[900];
      case WorkPackageStage.Manufacturing:
        return indigo[900];
      case WorkPackageStage.Install:
        return pink[800];
      case WorkPackageStage.Testing:
        return yellow[800];
      default:
        return grey[500];
    }
  }
};

// maps stage to the desired text color
export const GanttWorkPackageTextColorPipe: (stage: WorkPackageStage | undefined) => string = (stage) => {
  switch (stage) {
    case WorkPackageStage.Research:
    case WorkPackageStage.Design:
    case WorkPackageStage.Manufacturing:
    case WorkPackageStage.Install:
      return '#ffffff';
    case WorkPackageStage.Testing:
      return '#000000';
    default:
      return '#ffffff';
  }
};

export const aggregateGanttChanges = (eventChanges: EventChange[], allWbsElements: WbsElement[]) => {
  const aggregatedMap: Map<string, EventChange[]> = new Map();

  // Loop through each eventChange and aggregate them by eventId
  eventChanges.forEach((eventChange) => {
    if (aggregatedMap.has(eventChange.eventId)) {
      aggregatedMap.get(eventChange.eventId)!.push(eventChange);
    } else {
      aggregatedMap.set(eventChange.eventId, [eventChange]);
    }
  });

  // We want to ignore any work packages that were created on a new project as we will add them in the project creation
  const filteredEvents = Array.from(aggregatedMap.entries()).filter(([eventId, _changeEvents]) => {
    const wbsElement = allWbsElements.find((wbsElement) => wbsElement.id === eventId);
    if (!wbsElement) {
      throw new Error('Task not found when filtering events for: ' + eventId);
    }

    if (!isProject(wbsElement.wbsNum)) return true;

    return wbsElement.wbsElementId === '-1';
  });

  const updatedEvents = filteredEvents.map(([eventId, changeEvents]) => {
    const wbsElement = allWbsElements.find((wbsElement) => wbsElement.id === eventId);
    if (!wbsElement) {
      throw new Error('Wbs Element not found when updating events for: ' + eventId);
    }

    let workPackageEventChanges: EventChange[] = [];

    if (isProject(wbsElement.wbsNum)) {
      const project = wbsElement as Project;
      workPackageEventChanges = project.workPackages.flatMap((workPackage) =>
        eventChanges.filter((change) => change.eventId === workPackage.id && change.type !== 'create-work-package')
      );
    }

    const parentProject = allWbsElements.find((e) => wbsPipe(e.wbsNum) === projectWbsPipe(wbsElement.wbsNum));

    if (!parentProject) {
      throw new Error('Parent project not found when updating events for: ' + wbsElement.wbsNum);
    }

    const updatedEvent = applyChangeToEvent(
      changeEvents.concat(workPackageEventChanges),
      wbsElement,
      parentProject as Project
    );

    const start = isProject(updatedEvent.wbsNum)
      ? getProjectStartDate(updatedEvent as Project)
      : (updatedEvent as WorkPackage).startDate;
    const end = isProject(updatedEvent.wbsNum)
      ? getProjectEndDate(updatedEvent as Project)
      : (updatedEvent as WorkPackage).endDate;

    // Calculate the difference in days
    const diffInDays = dayjs(end).diff(dayjs(start), 'day');

    // Calculate the number of weeks
    const duration = Math.ceil(diffInDays / 7);

    const workPackageChanges: RequestEventChange[] = [];

    if (isProject(updatedEvent.wbsNum)) {
      const project = updatedEvent as Project;
      project.workPackages.forEach((wp) => {
        workPackageChanges.push({
          taskId: wp.id,
          name: wp.name,
          prevStart: new Date(),
          prevEnd: new Date(),
          newStart: wp.startDate,
          newEnd: wp.endDate,
          duration: wp.startDate.getTime() - wp.endDate.getTime(),
          stage: wp.stage,
          teamName: '',
          workPackageChanges: [],
          baseWbs: { carNumber: wp.wbsNum.carNumber, projectNumber: wp.wbsNum.projectNumber, workPackageNumber: 0 }
        });
      });
    }

    const change: RequestEventChange = {
      taskId: updatedEvent.id,
      stage: isProject(wbsElement.wbsNum) ? undefined : (wbsElement as WorkPackage).stage,
      teamName: '',
      name: updatedEvent.name,
      prevStart: isProject(wbsElement.wbsNum) ? new Date() : (wbsElement as WorkPackage).startDate,
      prevEnd: isProject(wbsElement.wbsNum) ? new Date() : (wbsElement as WorkPackage).endDate,
      newStart: start,
      newEnd: end,
      duration,
      createProject: isProject(updatedEvent.wbsNum),
      workPackageChanges,
      baseWbs: isProject(updatedEvent.wbsNum)
        ? { carNumber: updatedEvent.wbsNum.carNumber, projectNumber: 0, workPackageNumber: 0 }
        : {
            carNumber: updatedEvent.wbsNum.carNumber,
            projectNumber: updatedEvent.wbsNum.projectNumber,
            workPackageNumber: 0
          }
    };

    return change;
  });

  return updatedEvents;
};
