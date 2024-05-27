/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project, User, validateWBS, WbsElementStatus, WbsNumber, wbsPipe, WorkPackage, WorkPackageStage } from 'shared';
import { projectWbsPipe } from './pipes';
import dayjs from 'dayjs';
import { deepOrange, green, grey, indigo, orange, pink, yellow } from '@mui/material/colors';

export const NO_TEAM = 'No Team';

export const GANTT_CHART_GAP_SIZE = '0.75rem';
export const GANTT_CHART_CELL_SIZE = '2.25rem';

export type TaskType = 'task' | 'milestone' | 'project';
export interface GanttTaskData {
  id: string;
  type: TaskType;
  name: string;
  start: Date;
  end: Date;
  workPackages: GanttTaskData[];
  projectNumber: number;
  carNumber: number;
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
  | { type: 'create-work-package'; name: string; stage: WorkPackageStage; start: Date; end: Date }
);

export type RequestEventChange = {
  eventId: string;
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

export const applyChangeToEvent = (eventChanges: EventChange[], task: GanttTaskData): GanttTaskData => {
  let workPackages: GanttTaskData[] = [];
  if (task && task.workPackages) {
    workPackages = task.workPackages.map((wpEvent) => applyChangeToEvent(eventChanges, wpEvent));
  }

  const currentEventChanges = eventChanges.filter((ec) => ec.eventId === task.id);

  const changedEvent = { ...task };
  for (const eventChange of currentEventChanges) {
    switch (eventChange.type) {
      case 'change-end-date': {
        changedEvent.end = eventChange.newEnd;
        break;
      }
      case 'shift-by-days': {
        changedEvent.start = dayjs(changedEvent.start).add(eventChange.days, 'days').toDate();
        changedEvent.end = dayjs(changedEvent.end).add(eventChange.days, 'days').toDate();
        break;
      }
    }
  }
  return { ...changedEvent, workPackages };
};

export const applyChangesToEvents = (events: GanttTaskData[], eventChanges: EventChange[]): GanttTaskData[] => {
  return events.map((event) => {
    return applyChangeToEvent(eventChanges, event);
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

export const filterGanttProjects = (projects: Project[], ganttFilters: GanttFilters, searchText: string): Project[] => {
  // inclusive filters
  if (ganttFilters.showCars.length > 0)
    projects = projects.filter((project) => ganttFilters.showCars.some((car) => project.wbsNum.carNumber === car));

  if (ganttFilters.showTeamTypes.length > 0)
    projects = projects.filter((project) =>
      ganttFilters.showTeamTypes.some((teamType) =>
        project.teams.some((team) => team.teamType && team.teamType.name === teamType)
      )
    );

  if (ganttFilters.showTeams.length > 0)
    projects = projects.filter((project) =>
      ganttFilters.showTeams.some((team) => project.teams.some((t) => t.teamName === team))
    );

  // shows only active projects
  projects = projects.filter((project) => project.status === WbsElementStatus.Active);

  if (ganttFilters.showOnlyOverdue) {
    projects = projects.filter((project) => project.endDate && project.endDate < new Date());
  }

  // apply the search
  projects = projects.filter((project) => project.name.toLowerCase().includes(searchText.toLowerCase()));

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
    type: 'task',
    teamName,
    stage: workPackage.stage,
    workPackages: [],
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

export const transformProjectToGanttTask = (project: Project): GanttTask[] => {
  const teamNames = Array.from(getProjectsTeamNames([project]));
  return teamNames.map((teamName) => {
    return {
      id: wbsPipe(project.wbsNum),
      name: wbsPipe(project.wbsNum) + ' - ' + project.name,
      start: project.startDate || new Date(),
      end: project.endDate || new Date(),
      type: 'project',
      projectNumber: project.wbsNum.projectNumber,
      carNumber: project.wbsNum.carNumber,
      teamName,
      lead: project.lead,
      manager: project.manager,
      workPackages: project.workPackages.map((wp) => transformWorkPackageToGanttTask(wp, teamName)),
      onClick: () => {
        window.open(`/projects/${wbsPipe(project.wbsNum)}`, '_blank');
      }
    };
  });
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
 * Hardcoding the team names so that we can get the teams in the exact order we want.
 * However, everything else is not hard coded and allows for more or less teams.
 * @param a name of team
 * @param b name of other team
 * @returns a number for sorting
 */
export const sortTeamNames = (a: string, b: string): number => {
  if (a === NO_TEAM) return Number.MAX_SAFE_INTEGER;
  if (b === NO_TEAM) return Number.MIN_SAFE_INTEGER;

  if (a.includes('Software')) return Number.MAX_SAFE_INTEGER - 1;
  if (b.includes('Software')) return Number.MIN_SAFE_INTEGER + 1;

  if (a.includes('Handling')) return Number.MAX_SAFE_INTEGER - 2;
  if (b.includes('Handling')) return Number.MIN_SAFE_INTEGER + 2;

  if (a.includes('Drivetrain')) return Number.MAX_SAFE_INTEGER - 3;
  if (b.includes('Drivetrain')) return Number.MIN_SAFE_INTEGER + 3;

  if (a.includes('Structural')) return Number.MAX_SAFE_INTEGER - 4;
  if (b.includes('Structural')) return Number.MIN_SAFE_INTEGER + 4;

  if (a.includes('Ergonomics')) return Number.MAX_SAFE_INTEGER - 5;
  if (b.includes('Ergonomics')) return Number.MIN_SAFE_INTEGER + 5;

  if (a.includes('Tractive')) return Number.MAX_SAFE_INTEGER - 6;
  if (b.includes('Tractive')) return Number.MIN_SAFE_INTEGER + 6;

  if (a.includes('Low Voltage')) return Number.MAX_SAFE_INTEGER - 7;
  if (b.includes('Low Voltage')) return Number.MIN_SAFE_INTEGER + 7;

  if (a.includes('Data & Controls')) return Number.MAX_SAFE_INTEGER - 8;
  if (b.includes('Data & Controls')) return Number.MIN_SAFE_INTEGER + 8;

  return a.localeCompare(b);
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

export const aggregateGanttChanges = (eventChanges: EventChange[], ganttTasks: GanttTask[]) => {
  const aggregatedMap: Map<string, EventChange[]> = new Map();

  // Loop through each eventChange
  eventChanges.forEach((eventChange) => {
    if (aggregatedMap.has(eventChange.eventId)) {
      aggregatedMap.get(eventChange.eventId)!.push(eventChange);
    } else {
      aggregatedMap.set(eventChange.eventId, [eventChange]);
    }
  });

  const orderedEvents = Array.from(aggregatedMap.entries()).sort((a, b) => {
    const aTask = ganttTasks.find((task) => task.id === a[0]);
    const bTask = ganttTasks.find((task) => task.id === b[0]);

    if (!aTask || !bTask) {
      throw new Error('Task not found');
    }

    return aTask.workPackages.length - bTask.workPackages.length;
  });

  // We want to ignore any work packages that were created on a new project as we will add them in the project creation
  const filteredEvents = orderedEvents.filter(([eventId, _changeEvents]) => {
    const task = ganttTasks.find((task) => task.id === eventId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.projectId) return true;

    try {
      validateWBS(task.projectId);
      return true;
    } catch {
      return false;
    }
  });

  const updatedEvents = filteredEvents.map(([eventId, changeEvents]) => {
    const task = ganttTasks.find((task) => task.id === eventId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updatedEvent = applyChangeToEvent(changeEvents, task);

    const start = dayjs(updatedEvent.start);
    const end = dayjs(updatedEvent.end);

    // Calculate the difference in days
    const diffInDays = end.diff(start, 'day');

    // Calculate the number of weeks
    const duration = Math.ceil(diffInDays / 7);

    const newProject = updatedEvent.type === 'project';

    const workPackageChanges: RequestEventChange[] = [];

    if (newProject) {
      updatedEvent.workPackages.forEach((wp) => {
        workPackageChanges.push({
          eventId: wp.id,
          name: wp.name,
          prevStart: new Date(),
          prevEnd: new Date(),
          newStart: wp.start,
          newEnd: wp.end,
          duration: wp.end.getTime() - wp.start.getTime(),
          stage: wp.stage,
          teamName: task.teamName,
          workPackageChanges: [],
          baseWbs: { carNumber: wp.carNumber, projectNumber: wp.projectNumber, workPackageNumber: 0 }
        });
      });
    }

    const change: RequestEventChange = {
      eventId: updatedEvent.id,
      stage: task.stage,
      teamName: task.teamName,
      name: updatedEvent.name,
      prevStart: task?.start ?? new Date(),
      prevEnd: task?.end ?? new Date(),
      newStart: updatedEvent.start,
      newEnd: updatedEvent.end,
      duration,
      createProject: updatedEvent.type === 'project',
      workPackageChanges,
      baseWbs:
        updatedEvent.type === 'project'
          ? { carNumber: updatedEvent.carNumber, projectNumber: 0, workPackageNumber: 0 }
          : { carNumber: updatedEvent.carNumber, projectNumber: updatedEvent.projectNumber, workPackageNumber: 0 }
    };

    return change;
  });

  return updatedEvents;
};
