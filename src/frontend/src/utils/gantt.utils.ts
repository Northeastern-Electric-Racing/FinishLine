/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project, WbsElementStatus, WbsNumber, wbsPipe, WorkPackage, WorkPackageStage } from 'shared';
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
  /**
   * From 0 to 100
   */
  progress: number;
  children: GanttTaskData[];
  styles?: {
    color?: string;
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  isDisabled?: boolean;
  project?: string;
  dependencies?: string[];
  hideChildren?: boolean;
  displayOrder?: number;
  onClick?: () => void;
}

export type Date_Event = { id: string; start: Date; end: Date; title: string };

export type EventChange = { id: string; eventId: string } & (
  | { type: 'change-end-date'; originalEnd: Date; newEnd: Date }
  | { type: 'shift-by-days'; days: number }
);

export const applyChangeToEvent = (event: GanttTaskData, eventChanges: EventChange[]) => {
  const changedEvent = { ...event };
  for (const eventChange of eventChanges) {
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
  return changedEvent;
};

export const applyChangesToEvents = (events: GanttTaskData[], eventChanges: EventChange[]) => {
  return events.map((event) => {
    const changes = eventChanges.filter((ec) => ec.eventId === event.id);
    return applyChangeToEvent(event, changes);
  });
};

export interface GanttFilters {
  showCar1: boolean;
  showCar2: boolean;
  showElectricalTeamCategory: boolean;
  showMechanicalTeamCategory: boolean;
  showSoftwareTeamCategory: boolean;
  showBusinessTeamCategory: boolean;
  showErgonomicsTeam: boolean;
  showLowVoltageTeam: boolean;
  showTractiveTeam: boolean;
  showDataAndControlsTeam: boolean;
  showSoftwareTeam: boolean;
  showOnlyOverdue: boolean;
  expanded: boolean;
}

export interface GanttTask extends GanttTaskData {
  teamName: string;
}

export const filterGanttProjects = (projects: Project[], ganttFilters: GanttFilters): Project[] => {
  const car1Check = (project: Project) => {
    return project.wbsNum.carNumber !== 1;
  };
  const car2Check = (project: Project) => {
    return project.wbsNum.carNumber !== 2;
  };

  const electricalTeamCategoryCheck = (project: Project) => {
    // TODO
    return true;
  };

  const mechanicalTeamCategoryCheck = (project: Project) => {
    // TODO
    return true;
  };

  const softwareTeamCategoryCheck = (project: Project) => {
    // TODO
    return true;
  };

  const businessTeamCategoryCheck = (project: Project) => {
    // TODO
    return true;
  };

  const ergonomicsTeamCheck = (project: Project) => {
    return project.name.includes('Ergonomics');
  };

  const lowVoltageTeamCheck = (project: Project) => {
    return project.name.includes('Low Voltage');
  };

  const tractiveTeamCheck = (project: Project) => {
    return project.name.includes('Tractive');
  };

  const dataAndControlsTeamCheck = (project: Project) => {
    return project.name.includes('Data & Controls');
  };

  const softwareTeamCheck = (project: Project) => {
    return project.name.includes('Software');
  };

  const activeCheck = (project: Project) => {
    return project.status === WbsElementStatus.Active;
  };

  if (!(!ganttFilters.showCar1 && !ganttFilters.showCar2)) {
    if (!ganttFilters.showCar1) {
      projects = projects.filter(car1Check);
    }
    if (!ganttFilters.showCar2) {
      projects = projects.filter(car2Check);
    }
  }

  if (
    !(
      !ganttFilters.showErgonomicsTeam &&
      !ganttFilters.showLowVoltageTeam &&
      !ganttFilters.showTractiveTeam &&
      !ganttFilters.showDataAndControlsTeam &&
      !ganttFilters.showSoftwareTeam
    )
  ) {
    if (!ganttFilters.showErgonomicsTeam) {
      projects = projects.filter(ergonomicsTeamCheck);
    }
    if (!ganttFilters.showLowVoltageTeam) {
      projects = projects.filter(lowVoltageTeamCheck);
    }
    if (!ganttFilters.showTractiveTeam) {
      projects = projects.filter(tractiveTeamCheck);
    }
    if (!ganttFilters.showDataAndControlsTeam) {
      projects = projects.filter(dataAndControlsTeamCheck);
    }
    if (!ganttFilters.showSoftwareTeam) {
      projects = projects.filter(softwareTeamCheck);
    }
  }

  if (
    !(
      !ganttFilters.showElectricalTeamCategory &&
      !ganttFilters.showMechanicalTeamCategory &&
      !ganttFilters.showSoftwareTeamCategory &&
      !ganttFilters.showBusinessTeamCategory
    )
  ) {
    if (!ganttFilters.showElectricalTeamCategory) {
      projects = projects.filter(electricalTeamCategoryCheck);
    }
    if (!ganttFilters.showMechanicalTeamCategory) {
      projects = projects.filter(mechanicalTeamCategoryCheck);
    }
    if (!ganttFilters.showSoftwareTeamCategory) {
      projects = projects.filter(softwareTeamCategoryCheck);
    }
    if (!ganttFilters.showBusinessTeamCategory) {
      projects = projects.filter(businessTeamCategoryCheck);
    }
  }
  projects = projects.filter(activeCheck);

  return projects;
};

export const buildGanttSearchParams = (ganttFilters: GanttFilters): string => {
  const carFormat = (name: string) => {
    return `&car=${name}`;
  };

  const teamCategoryFormat = (name: string) => {
    return `&teamCategory=${name}`;
  };

  const teamFormat = (name: string) => {
    return `&team=${name}`;
  };

  return (
    '?' +
    (ganttFilters.showCar1 ? carFormat('Car 1') : '') +
    (ganttFilters.showCar2 ? carFormat('Car 2') : '') +
    (ganttFilters.showElectricalTeamCategory ? teamCategoryFormat('Electrical') : '') +
    (ganttFilters.showMechanicalTeamCategory ? teamCategoryFormat('Mechanical') : '') +
    (ganttFilters.showSoftwareTeamCategory ? teamCategoryFormat('Software') : '') +
    (ganttFilters.showBusinessTeamCategory ? teamCategoryFormat('Business') : '') +
    (ganttFilters.showErgonomicsTeam ? teamFormat('Ergonomics') : '') +
    (ganttFilters.showLowVoltageTeam ? teamFormat('Low Voltage') : '') +
    (ganttFilters.showTractiveTeam ? teamFormat('Tractive') : '') +
    (ganttFilters.showDataAndControlsTeam ? teamFormat('Data and Controls') : '') +
    (ganttFilters.showSoftwareTeam ? teamFormat('Software') : '') +
    `&overdue=${ganttFilters.showOnlyOverdue}` +
    `&expanded=${ganttFilters.expanded}`
  );
};

export const transformWorkPackageToGanttTask = (workPackage: WorkPackage, teamName: string): GanttTask => {
  return {
    id: wbsPipe(workPackage.wbsNum),
    name: wbsPipe(workPackage.wbsNum) + ' ' + workPackage.name,
    start: workPackage.startDate,
    end: workPackage.endDate,
    progress: 100,
    project: projectWbsPipe(workPackage.wbsNum),
    type: 'task',
    teamName,
    children: [],
    styles: {
      color: GanttWorkPackageTextColorPipe(workPackage.stage),
      backgroundColor: GanttWorkPackageStageColorPipe(workPackage.stage, workPackage.status)
    },
    onClick: () => {
      window.open(`/projects/${wbsPipe(workPackage.wbsNum)}`, '_blank');
    }
  };
};

export const getProjectTeamsName = (project: Project): string => {
  return project.teams.length === 0 ? NO_TEAM : project.teams.map((team) => team.teamName).join(', ');
};

export const transformProjectToGanttTask = (project: Project, expanded: boolean): GanttTask[] => {
  const teamName = getProjectTeamsName(project);

  const projectTask: GanttTask = {
    id: wbsPipe(project.wbsNum),
    name: wbsPipe(project.wbsNum) + ' - ' + project.name,
    start: project.startDate || new Date(),
    end: project.endDate || new Date(),
    progress: 100,
    type: 'project',
    hideChildren: !expanded,
    teamName,
    children: project.workPackages.map((wp) => transformWorkPackageToGanttTask(wp, teamName)),
    onClick: () => {
      window.open(`/projects/${wbsPipe(project.wbsNum)}`, '_blank');
    }
  };

  const workPackageTasks = project.workPackages
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .map((workPackage) => transformWorkPackageToGanttTask(workPackage, teamName));

  return [projectTask, ...workPackageTasks];
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
