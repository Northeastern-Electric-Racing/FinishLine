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
import { projectPreviewTranformer } from '../apis/transformers/projects.transformers';

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
  workPackageNumber: number;
  allWorkPackages: WorkPackage[];
  unblockedWorkPackages: WorkPackage[];
  blocking: WbsNumber[];

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

export type GanttChange = { id: string; element: WbsElement } & (
  | { type: 'change-end-date'; originalEnd: Date; newEnd: Date }
  | { type: 'shift-by-days'; days: number }
  | { type: 'create-project' }
  | { type: 'create-work-package' }
);

export type RequestEventChange = {
  changeId: string;
  element: WbsElement;
  prevStart: Date;
  prevEnd: Date;
  newStart: Date;
  newEnd: Date;
  type: 'create-project' | 'create-work-package' | 'edit-work-package';
};

export const getProjectStartDate = (project: ProjectPreview): Date => {
  return project.workPackages.reduce((acc, current) => {
    if (current.startDate < acc) return current.startDate;
    return acc;
  }, new Date(3000, 0, 1)); // Set Date to Year 3000, an arbitrary date in the future
};

export const getProjectEndDate = (project: ProjectPreview): Date => {
  return project.workPackages.reduce((acc, current) => {
    if (current.endDate > acc) return current.endDate;
    return acc;
  }, new Date(0));
};

export const transformProjectPreviewToProject = (projectPreview: ProjectPreview, team: Team): Project => {
  return {
    ...projectPreview,
    summary: '',
    budget: 0,
    links: [],
    descriptionBullets: [],
    materials: [],
    assemblies: [],
    duration: 0,
    tasks: [],
    favoritedBy: [],
    wbsElementId: '-1',
    teams: [team],
    changes: [],
    dateCreated: new Date()
  };
};

export const transformGanttTaskToWorkPackage = (task: GanttTask): WorkPackage => {
  return {
    id: task.id,
    wbsElementId: task.id,
    wbsNum: {
      carNumber: task.carNumber,
      projectNumber: task.projectNumber,
      workPackageNumber: task.workPackageNumber
    },
    dateCreated: new Date(),
    name: task.name,
    orderInProject: task.workPackageNumber,
    startDate: task.start,
    endDate: task.end,
    descriptionBullets: [],
    blockedBy: [],
    manager: task.manager,
    lead: task.lead,
    status: WbsElementStatus.Active,
    stage: task.stage,
    links: [],
    materials: [],
    assemblies: [],
    teamTypes: [],
    changes: [],
    blocking: task.blocking,
    projectName: '',
    duration: dayjs(task.end).diff(dayjs(task.start), 'week')
  };
};

/**
 * Applies the changes to all of the blocked work packages of the initial work package
 * @param initialWorkPackage The work package to get all of the blocked work packages for
 * @param totalWorkPackages The total list of work packages on the the initial work packages project
 * @param changeToApply The change to apply to all the blocked work package
 */
const applyChangesToBlockedBy = (
  initialWorkPackage: WorkPackage,
  totalWorkPackages: WorkPackage[],
  changeToApply: GanttChange
) => {
  const updatedBlockingWbsNums: Set<String> = new Set();

  const blockingUpdateQueue: string[] = initialWorkPackage.blocking.map(wbsPipe);
  while (blockingUpdateQueue.length > 0) {
    const currWbsNum = blockingUpdateQueue.pop(); // get the next blocking and remove it from the queue

    if (!currWbsNum) break; // this is more of a type check for pop becuase the while loop prevents this from not existing
    if (updatedBlockingWbsNums.has(currWbsNum)) continue; // if we've already seen it we skip it

    updatedBlockingWbsNums.add(currWbsNum);

    // get the work package object from the total work packages
    const currWbs = totalWorkPackages.find((wp) => wbsPipe(wp.wbsNum) === currWbsNum);

    if (currWbs?.wbsElementId === initialWorkPackage.wbsElementId) throw new Error('Circular dependency detected');

    if (!currWbs) throw new Error('Work package not found: ' + currWbsNum);

    if (changeToApply.type === 'change-end-date') {
      const timelineImpact = changeToApply.newEnd.getTime() - changeToApply.originalEnd.getTime();
      currWbs.startDate = new Date(currWbs.startDate.getTime() + timelineImpact);
      currWbs.endDate = new Date(currWbs.endDate.getTime() + timelineImpact);
    } else if (changeToApply.type === 'shift-by-days') {
      const newStartDate = dayjs(currWbs.startDate).add(changeToApply.days, 'day').toDate();
      currWbs.startDate = newStartDate;
      currWbs.endDate = dayjs(currWbs.endDate).add(changeToApply.days, 'day').toDate();
    }

    // get all the blockings of the current wbs and add them to the queue to update
    const newBlocking: string[] = currWbs.blocking.map(wbsPipe);
    blockingUpdateQueue.push(...newBlocking);
  }
};

/**
 * Applies the gantt changes to the wbs element and all of its children
 * @param ganttChanges The gantt changes to apply
 * @param wbsElement The wbs element to apply the changes to
 * @param parentProject The parent project of the wbs element, itself if it is a project
 */
export const applyChangesToWBSElement = (
  ganttChanges: GanttChange[],
  wbsElement: WbsElement,
  parentProject: ProjectPreview
): WbsElement => {
  const updatedElement = wbsElement;

  if (isWorkPackage(wbsElement.wbsNum)) {
    // If its a work package were gonna loop through and see if we need to apply changes
    const workPackage = wbsElement as WorkPackage;
    for (const change of ganttChanges) {
      if (wbsPipe(change.element.wbsNum) === wbsPipe(wbsElement.wbsNum)) {
        // If the change is for this work package then were gonna apply it
        if (change.type === 'create-work-package') {
          break; // We dont want to apply the changes to a new work package because the changes get tracked already when the user edit the created work package
        } else if (change.type === 'change-end-date') {
          workPackage.endDate = change.newEnd;
        } else if (change.type === 'shift-by-days') {
          workPackage.startDate = dayjs(workPackage.startDate).add(change.days, 'day').toDate();
          workPackage.endDate = dayjs(workPackage.endDate).add(change.days, 'day').toDate();
        }

        applyChangesToBlockedBy(workPackage, parentProject.workPackages, change); // Apply the changes to all of the blocked work packages
      }
    }
  }

  if (isProject(wbsElement.wbsNum)) {
    // If its a project we need to apply the changes to all of the work packages since a project doesnt have a timeline itself, it infers it from its children
    const project = wbsElement as Project;
    project.workPackages = project.workPackages.map((workPackage) =>
      applyChangesToWBSElement(ganttChanges, workPackage, parentProject)
    ) as WorkPackage[];
  }

  return updatedElement;
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

export const IsProjectPreviewsEqual = (x: ProjectPreview[], y: ProjectPreview[]): boolean => {
  if (x.length !== y.length) return false;

  for (let i = 0; i < x.length; i++) {
    if (wbsPipe(x[i].wbsNum) !== wbsPipe(y[i].wbsNum)) return false;
  }

  return true;
};

/**
 * Non mutating function that filters the projects based on the gantt filters and search text
 * @param projects The projects to filter
 * @param ganttFilters The filters to apply
 * @param searchText The search text to apply
 * @param team The team the projects are on
 */
export const filterGanttProjects = (
  projects: ProjectPreview[],
  ganttFilters: GanttFilters,
  searchText: string,
  team: Team
) => {
  let deepCopy: ProjectPreview[] = JSON.parse(JSON.stringify(projects)).map(projectPreviewTranformer);
  // inclusive filters
  if (ganttFilters.showCars.length > 0)
    deepCopy = deepCopy.filter((project) => ganttFilters.showCars.some((car) => project.wbsNum.carNumber === car));

  if (ganttFilters.showTeamTypes.length > 0)
    deepCopy = ganttFilters.showTeamTypes.some((teamType) => team.teamType && team.teamType.name === teamType)
      ? deepCopy
      : [];

  if (ganttFilters.showTeams.length > 0)
    deepCopy = ganttFilters.showTeams.some((teamName) => teamName === team.teamName) ? deepCopy : [];

  // shows only active and inactive projects
  deepCopy = deepCopy.filter((project) => project.status !== WbsElementStatus.Complete);

  if (ganttFilters.showOnlyOverdue) {
    deepCopy = deepCopy.filter((project) => getProjectEndDate(project) < new Date());
  }

  // apply the search
  deepCopy = deepCopy.filter((project) => project.name.toLowerCase().includes(searchText.toLowerCase()));

  // deepCopy = deepCopy.filter((project) => getProjectEndDate(project).getFullYear() !== 1969); // Filter out projects with no end date

  return deepCopy;
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

export const transformWorkPackageToGanttTask = (
  workPackage: WorkPackage,
  teamName: string,
  allWorkPackages: WorkPackage[]
): GanttTask => {
  return {
    id: wbsPipe(workPackage.wbsNum),
    name: wbsPipe(workPackage.wbsNum) + ' ' + workPackage.name,
    start: workPackage.startDate,
    end: workPackage.endDate,
    projectId: projectWbsPipe(workPackage.wbsNum),
    projectNumber: workPackage.wbsNum.projectNumber,
    carNumber: workPackage.wbsNum.carNumber,
    workPackageNumber: workPackage.wbsNum.workPackageNumber,
    teamName,
    stage: workPackage.stage,
    unblockedWorkPackages: [],
    allWorkPackages,
    blocking: workPackage.blocking,
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

export const transformProjectToGanttTask = (project: ProjectPreview, teamName: string): GanttTask => {
  const startDate = getProjectStartDate(project);

  const endDate = getProjectEndDate(project);

  return {
    id: wbsPipe(project.wbsNum),
    name: wbsPipe(project.wbsNum) + ' - ' + project.name,
    start: startDate.getFullYear() === 3000 ? new Date() : startDate,
    end: endDate.getFullYear() === 1969 ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 3) : endDate,
    projectNumber: project.wbsNum.projectNumber,
    carNumber: project.wbsNum.carNumber,
    workPackageNumber: 0,
    allWorkPackages: project.workPackages,
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

/**
 * Determines if the highlighted change is on the wbs elements project.
 * @param highlightedChange The highlighted change
 * @param wbsElement The wbs element to check
 */
export const isHighlightedChangeOnWbsProject = (highlightedChange: RequestEventChange, wbsNum: WbsNumber): boolean => {
  return highlightedChange && projectWbsPipe(wbsNum) === projectWbsPipe(highlightedChange.element.wbsNum);
};

/**
 * Determines if the highlighted change is on the wbs element.
 * @param highlightedChange The highlighted change
 * @param task The task to check
 */
export const isHighlightedChangeOnGanttTask = (highlightedChange: RequestEventChange, task: GanttTask): boolean => {
  return highlightedChange && wbsPipe(task) === wbsPipe(highlightedChange.element.wbsNum);
};

export const aggregateGanttChanges = (ganttChanges: GanttChange[], allWbsElements: WbsElement[]) => {
  const aggregatedMap: Map<string, GanttChange[]> = new Map();

  // Loop through each ganttChange and aggregate them by their wbsNumber
  ganttChanges.forEach((ganttChange) => {
    if (aggregatedMap.has(wbsPipe(ganttChange.element.wbsNum))) {
      aggregatedMap.get(wbsPipe(ganttChange.element.wbsNum))!.push(ganttChange);
    } else {
      aggregatedMap.set(wbsPipe(ganttChange.element.wbsNum), [ganttChange]);
    }
  });

  // We want to ignore any work packages that were created on a new project as we will add them in the project creation
  const filteredEvents = Array.from(aggregatedMap.entries()).filter(([wbsNum, _changeEvents]) => {
    const wbsElement: WbsElement | undefined = allWbsElements.find((wbsElement) => wbsPipe(wbsElement.wbsNum) === wbsNum);
    if (!wbsElement) {
      throw new Error('Task not found when filtering events for: ' + wbsNum);
    }

    if (isProject(wbsElement.wbsNum)) return true;

    const parentProject: WbsElement | undefined = allWbsElements.find(
      (e) => wbsPipe(e.wbsNum) === projectWbsPipe(wbsElement.wbsNum)
    );
    if (!parentProject) {
      throw new Error('Parent project not found when filtering events for: ' + wbsElement.wbsNum);
    }

    return parentProject.wbsElementId !== '-1';
  });

  const updatedEvents = filteredEvents.map(([wbsNum, changeEvents]) => {
    const wbsElement = allWbsElements.find((wbsElement) => wbsPipe(wbsElement.wbsNum) === wbsNum);
    if (!wbsElement) {
      throw new Error('Wbs Element not found when updating events for: ' + wbsNum);
    }

    let workPackageGanttChanges: GanttChange[] = [];

    if (isProject(wbsElement.wbsNum)) {
      const project = wbsElement as Project;
      const workPackages = allWbsElements.filter(
        (wbsElement) => projectWbsPipe(wbsElement.wbsNum) === wbsPipe(project.wbsNum) && isWorkPackage(wbsElement.wbsNum)
      );
      project.workPackages = workPackages as WorkPackage[];
      workPackageGanttChanges = project.workPackages.flatMap((workPackage) =>
        ganttChanges.filter((change) => wbsPipe(change.element.wbsNum) === wbsPipe(workPackage.wbsNum))
      );
    }

    const parentProject = allWbsElements.find((e) => wbsPipe(e.wbsNum) === projectWbsPipe(wbsElement.wbsNum));

    if (!parentProject) {
      throw new Error('Parent project not found when updating events for: ' + wbsElement.wbsNum);
    }

    const updatedEvent = applyChangesToWBSElement(
      changeEvents.concat(workPackageGanttChanges),
      wbsElement,
      parentProject as Project
    );

    const start = isProject(updatedEvent.wbsNum)
      ? getProjectStartDate(updatedEvent as Project)
      : (updatedEvent as WorkPackage).startDate;
    const end = isProject(updatedEvent.wbsNum)
      ? getProjectEndDate(updatedEvent as Project)
      : (updatedEvent as WorkPackage).endDate;

    const newWorkPackage = changeEvents.some((change) => change.type === 'create-work-package');

    const change: RequestEventChange = {
      changeId: updatedEvent.id,
      prevStart: isProject(wbsElement.wbsNum) ? new Date() : (wbsElement as WorkPackage).startDate,
      prevEnd: isProject(wbsElement.wbsNum) ? new Date() : (wbsElement as WorkPackage).endDate,
      newStart: start,
      newEnd: end,
      element: updatedEvent,
      type: isProject(wbsElement.wbsNum) ? 'create-project' : newWorkPackage ? 'create-work-package' : 'edit-work-package'
    };

    return change;
  });

  return updatedEvents;
};
