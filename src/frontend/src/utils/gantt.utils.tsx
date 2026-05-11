/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  addWeeksToDate,
  EventPreview,
  EventStatus,
  isWorkPackage,
  ProjectGantt,
  RetrospectiveProjectPreview,
  RetrospectiveWorkPackage,
  Task,
  TaskPriority,
  TaskStatus,
  TeamPreview,
  User,
  validateWBS,
  WbsElementPreview,
  WbsElementStatus,
  WbsNumber,
  wbsPipe,
  WorkPackage,
  WorkPackageStage
} from 'shared';
import { fullNamePipe, projectWbsPipe } from './pipes';
import dayjs from 'dayjs';
import { deepOrange, green, grey, indigo, orange, pink } from '@mui/material/colors';
import { projectGanttTransformer } from '../apis/transformers/projects.transformers';
import { ReactNode, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Typography, useTheme } from '@mui/material';
import { routes } from './routes';
import { workPackageTransformer } from '../apis/transformers/work-packages.transformers';
import { useHistory } from 'react-router-dom';
import { useQuery } from '../hooks/utils.hooks';

export const NO_TEAM = 'No Team';

export const GANTT_CHART_GAP_SIZE = '0.75rem';

// Gantt-specific task type for local state management (before API calls)
export interface GanttTaskCreate {
  id?: string; // actual task ID for existing tasks (when editing)
  taskId: string; // temporary ID for local tracking
  wbsNum: WbsNumber;
  title: string;
  notes: string;
  startDate?: Date;
  deadline?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeIds: string[]; // Just the IDs, not full user objects
}

export const GANTT_CHART_CELL_SIZE = '2.375rem';

export const timeFrameOptions = ['Week', 'Month', 'Year'];

export interface GanttCollection<E, T> {
  id: string;
  tasks: GanttTask<T>[];
  element: E;
  title: string;
}

export interface GanttEvent {
  date: Date;
  color: string;
  onClick: () => void;
  name: string;
}

export interface GanttToolTipProps {
  upperRightDisplay: ReactNode;
  lowerRightDisplay: ReactNode;
}

interface GanttRetroProps {
  comparativeStart?: Date;
  comparativeEnd?: Date;
}

interface GanttTaskStyles {
  color?: string;
  backgroundColor?: string;
  backgroundSelectedColor?: string;
}

export interface OnMouseOverOptions {
  start?: Date;
  end?: Date;
  name: string;
  tooltip?: GanttToolTipProps;
  styles?: GanttTaskStyles;
}

interface GanttTaskData<T> {
  id: string;
  element: T;

  name: string;
  start: Date;
  end: Date;
  blocking: GanttTaskData<T>[];
  children: GanttTaskData<T>[];
  events: GanttEvent[];
  overlays: GanttTaskData<T>[];

  // Optional Values
  styles?: GanttTaskStyles;
  tooltip?: GanttToolTipProps;
  retro?: GanttRetroProps;
  onClick?: () => void;
  root?: boolean;
}

export type Date_Event = { id: string; start: Date; end: Date; title: string };

export type GanttChange<T> = { id: string; element: T } & (
  | { type: 'change-end-date'; originalEnd: Date; newEnd: Date }
  | { type: 'shift-by-days'; days: number }
  | { type: 'create-task' }
  | { type: 'create-sub-task' }
);

export type RequestEventChange<T> = {
  changeId: string;
  element: T;
  prevStart?: Date;
  prevEnd?: Date;
  newStart: Date;
  newEnd: Date;
  type: 'create-task' | 'edit-task';
};

export const getProjectStartDate = (project: ProjectGantt): Date => {
  const candidates: Date[] = [
    ...project.workPackages.map((wp) => wp.startDate),
    ...project.tasks.map((t) => t.startDate).filter((d): d is Date => !!d)
  ];
  if (candidates.length === 0) return project.startDate ?? new Date();
  return new Date(Math.min(...candidates.map((d) => d.valueOf())));
};

export const getProjectEndDate = (project: ProjectGantt): Date => {
  const candidates: Date[] = [
    ...project.workPackages.map((wp) => wp.endDate),
    ...project.tasks.map((t) => t.deadline).filter((d): d is Date => !!d)
  ];
  if (candidates.length === 0) return project.endDate ?? new Date();
  return new Date(Math.max(...candidates.map((d) => d.valueOf())));
};

export const transformDesignReviewEventToGanttEvent = (event: EventPreview): GanttEvent => {
  return {
    date: event.dateScheduled,
    color: ganttDesignReviewEventStatusColorPipe(event.status),
    onClick: () => window.open(`${routes.CALENDAR}/${event.eventId}`, '_blank'),
    name: event.wbsName
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
  changeToApply: GanttChange<WbsElementPreview | Task>
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
  ganttChanges: GanttChange<WbsElementPreview | Task>[],
  wbsElement: WbsElementPreview | Task,
  parentProject: ProjectGantt
): { updatedProject: ProjectGantt; updatedElement: WbsElementPreview | Task } => {
  const updatedElement = { ...wbsElement };
  const copiedProject = projectGanttTransformer(JSON.parse(JSON.stringify(parentProject)));

  // Check if it's a Task
  if ((updatedElement as Task).taskId !== undefined) {
    const task = updatedElement as Task;
    for (const change of ganttChanges) {
      if ((change.element as Task).taskId === task.taskId) {
        // Apply changes to the task
        if (change.type === 'shift-by-days') {
          // For tasks, we shift the deadline by the specified number of days
          task.deadline = task.deadline ? dayjs(task.deadline).add(change.days, 'day').toDate() : new Date();
          task.startDate = task.startDate ? dayjs(task.startDate).add(change.days, 'day').toDate() : undefined;
        } else if (change.type === 'change-end-date') {
          if (!task.startDate) {
            task.startDate = task.deadline;
          }
          task.deadline = change.newEnd;
        }

        // Update the task in the project's tasks array
        copiedProject.tasks = copiedProject.tasks.map((projectTask) =>
          projectTask.taskId === task.taskId ? task : projectTask
        );
      }
    }

    return { updatedProject: copiedProject, updatedElement: task };
  }

  if ((updatedElement as WbsElementPreview).wbsNum !== undefined && isWorkPackage(updatedElement as WbsElementPreview)) {
    // If its a work package were gonna loop through and see if we need to apply changes
    const workPackage = workPackageTransformer(JSON.parse(JSON.stringify(updatedElement)));
    for (const change of ganttChanges) {
      if (wbsPipe(change.element.wbsNum) === wbsPipe(wbsElement.wbsNum)) {
        // If the change is for this work package then were gonna apply it
        if (change.type === 'create-sub-task') {
          break; // We dont want to apply the changes to a new work package because the changes get tracked already when the user edit the created work package
        } else if (change.type === 'change-end-date') {
          workPackage.endDate = change.newEnd;
        } else if (change.type === 'shift-by-days') {
          workPackage.startDate = dayjs(workPackage.startDate).add(change.days, 'day').toDate();
          workPackage.endDate = dayjs(workPackage.endDate).add(change.days, 'day').toDate();
        }

        applyChangesToBlockedBy(workPackage, copiedProject.workPackages, change); // Apply the changes to all of the blocked work packages
        copiedProject.workPackages = copiedProject.workPackages.map((projectWorkPackage) =>
          projectWorkPackage.id === workPackage.id ? workPackage : projectWorkPackage
        );
      }
    }

    return { updatedProject: copiedProject, updatedElement: workPackage };
  }

  return { updatedProject: copiedProject, updatedElement };
};

export interface GanttFilters {
  showCars: number[];
  showTeamTypes: string[];
  showTeams: string[];
  showOnlyOverdue?: boolean;
  hideTasks?: boolean;
}

export interface GanttTask<T> extends GanttTaskData<T> {}

/**
 * Non mutating function that filters the projects based on the gantt filters and search text
 * @param projects The projects to filter
 * @param ganttFilters The filters to apply
 * @param searchText The search text to apply
 * @param team The team the projects are on
 */
export const filterGanttProjects = <T extends ProjectGantt>(
  projects: T[],
  ganttFilters: GanttFilters,
  searchText: string,
  team: TeamPreview,
  reparser: (project: T) => T
) => {
  let deepCopy: ProjectGantt[] = JSON.parse(JSON.stringify(projects)).map(reparser);

  // Show only projects on this team
  deepCopy = deepCopy.filter((project) => project.teams.some((projectTeam) => projectTeam.teamId === team.teamId));

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

  // filter out deleted projects
  deepCopy = deepCopy.filter((project) => !project.deleted);

  return deepCopy;
};

export interface RetroGanttFilters extends GanttFilters {
  startDate?: Date;
  endDate?: Date;
}

export const buildRetroGanttParams = (ganttFilters: RetroGanttFilters) => {
  const startFormat = (date: Date) => {
    return `&retro-start=${encodeURIComponent(date.toISOString())}`;
  };

  const endFormat = (date: Date) => {
    return `&retro-end=${encodeURIComponent(date.toISOString())}`;
  };

  const params =
    (ganttFilters.startDate ? startFormat(ganttFilters.startDate) : '') +
    (ganttFilters.endDate ? endFormat(ganttFilters.endDate) : '');

  return buildGanttSearchParams(ganttFilters, params);
};

export const buildGanttSearchParams = (ganttFilters: GanttFilters, additionalParams?: string): string => {
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
    (ganttFilters.showOnlyOverdue ? `&overdue=${ganttFilters.showOnlyOverdue}` : '') +
    (ganttFilters.hideTasks ? `&hideTasks=${ganttFilters.hideTasks}` : '') +
    (additionalParams ?? '');

  return newParams;
};

const UserDisplay = ({ user, label }: { user?: User; label: string }) => {
  const theme = useTheme();
  return (
    <Typography color={theme.palette.text.primary}>
      {label}: {fullNamePipe(user)}
    </Typography>
  );
};

const getBlockingGanttTasks = <T extends WorkPackage>(
  workPackage: T,
  allWorkPackages: T[],
  transformation: (wp: T, all: T[]) => GanttTaskData<T>
): GanttTaskData<T>[] => {
  return workPackage.blocking
    .map((wbsNum) => {
      const workPackage = allWorkPackages.find((wp) => wbsPipe(wp.wbsNum) === wbsPipe(wbsNum));
      if (workPackage) {
        return transformation(workPackage, allWorkPackages);
      }
      return undefined;
    })
    .filter((wp) => !!wp);
};

export const transformTaskToGanttTask = <T extends Task>(task: T, end: Date): GanttTask<T> => {
  return {
    id: task.taskId,
    element: task,

    name: task.title,
    start: new Date(task.startDate?.valueOf() ?? task.deadline?.valueOf() ?? end),
    end: new Date(task.deadline?.valueOf() ?? end.valueOf()),

    events: [],
    blocking: [],
    children: [],
    overlays: [],

    tooltip: {
      upperRightDisplay: <Typography>Creator: {fullNamePipe(task.createdBy)}</Typography>,
      lowerRightDisplay: <Typography>Assignees: {task.assignees.map(fullNamePipe).join(', ')}</Typography>
    },
    styles: {
      color: GanttWorkPackageTextColor,
      backgroundColor: ganttTaskColorPipe(task.status)
    },
    onClick: () => window.open(`/projects`, '_blank'),
    root: false
  };
};

export const transformWorkPackageToGanttTask = <T extends WorkPackage>(
  workPackage: T,
  allWorkPackages: T[]
): GanttTask<T> => {
  return {
    id: workPackage.id,
    element: workPackage,

    name: workPackage.name,
    start: workPackage.startDate,
    end: workPackage.endDate,

    events: workPackage.events.map(transformDesignReviewEventToGanttEvent),
    blocking: getBlockingGanttTasks(workPackage, allWorkPackages, transformWorkPackageToGanttTask),
    children: [],
    overlays: [],

    tooltip: {
      upperRightDisplay: <UserDisplay user={workPackage.lead} label="Lead" />,
      lowerRightDisplay: <UserDisplay user={workPackage.manager} label="Manager" />
    },
    styles: {
      color: GanttWorkPackageTextColor,
      backgroundColor: ganttWorkPackageStageColorPipe(workPackage.stage, workPackage.status)
    },
    onClick: () => window.open(`/projects/${wbsPipe(workPackage.wbsNum)}`, '_blank'),
    root: false
  };
};

export const transformProjectToGanttTask = (
  project: ProjectGantt,
  hideTasks: boolean = false
): GanttTask<WbsElementPreview | Task> => {
  const startDate = getProjectStartDate(project);

  const endDate = getProjectEndDate(project);

  const taskList = hideTasks ? [] : project.tasks;

  return {
    id: project.id,
    element: project,

    name: project.name,
    start: startDate,
    end: endDate,
    blocking: [],
    children: [
      ...project.workPackages.map((workPackage) => transformWorkPackageToGanttTask(workPackage, project.workPackages)),
      ...taskList.map((task) => transformTaskToGanttTask(task, endDate))
    ],
    overlays: [
      ...project.workPackages.map((wp) => transformWorkPackageToGanttTask(wp, project.workPackages)),
      ...taskList.map((task) => transformTaskToGanttTask(task, endDate))
    ],
    events: [],
    tooltip: {
      upperRightDisplay: <UserDisplay user={project.lead} label="Lead" />,
      lowerRightDisplay: <UserDisplay user={project.manager} label="Manager" />
    },
    onClick: () => window.open(`/projects/${wbsPipe(project.wbsNum)}`, '_blank'),
    root: true
  };
};

export const transformRetrospectiveProjectToGanttTask = (
  project: RetrospectiveProjectPreview,
  showTasks: boolean = true
): GanttTask<WbsElementPreview | Task> => {
  return {
    ...transformProjectToGanttTask(project, showTasks),
    children: project.workPackages
      .filter((wp) => wp.blockedBy.length === 0)
      .map((wp) => transformRetrospectiveWorkPackageToGanttTask(wp, project.workPackages)),
    retro: {
      comparativeEnd: project.originalEndDate,
      comparativeStart: project.originalStartDate
    }
  };
};

export const transformRetrospectiveWorkPackageToGanttTask = (
  workPackage: RetrospectiveWorkPackage,
  allWorkPackages: RetrospectiveWorkPackage[]
): GanttTask<RetrospectiveWorkPackage> => {
  return {
    ...transformWorkPackageToGanttTask(workPackage, allWorkPackages),
    blocking: getBlockingGanttTasks(workPackage, allWorkPackages, transformRetrospectiveWorkPackageToGanttTask),
    retro: {
      comparativeEnd: addWeeksToDate(workPackage.originalStartDate, workPackage.originalDuration),
      comparativeStart: workPackage.originalStartDate
    }
  };
};

export const constructCollectionsFromTeamPreviewAndProjects = <T extends ProjectGantt>(
  teams: TeamPreview[],
  projects: T[],
  filters: GanttFilters,
  searchText: string,
  projectTransformation: (project: T, hideTasks?: boolean) => GanttTaskData<WbsElementPreview | Task>,
  reparser: (project: T) => T
): GanttCollection<TeamPreview, WbsElementPreview | Task>[] => {
  const projectMap = new Map<string, ProjectGantt[]>();
  projects.forEach((project) => {
    project.teams.forEach((team) => {
      if (projectMap.has(team.teamId)) {
        projectMap.set(team.teamId, [...projectMap.get(team.teamId)!, project]);
      } else {
        projectMap.set(team.teamId, [project]);
      }
    });
  });

  const hideTasks = filters.hideTasks ?? false;

  return teams.map((team) => ({
    id: uuidv4(),
    element: team,
    tasks: filterGanttProjects((projectMap.get(team.teamId) ?? []) as T[], filters, searchText, team, reparser).map(
      (project) => projectTransformation(project as T, hideTasks)
    ),
    title: team.teamName
  }));
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

export const ganttDesignReviewEventStatusColorPipe = (status: EventStatus) => {
  return status !== EventStatus.UNCONFIRMED ? '#712f99' : '#876e96';
};

// Maps task status to the desired color for Gantt Chart
export const ganttTaskColorPipe = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.IN_BACKLOG:
      return '#80CBC4';
    case TaskStatus.IN_PROGRESS:
      return '#26A69A';
    case TaskStatus.DONE:
      return '#00695C';
  }
};

// maps stage and status to the desired color for Gantt Chart
export const ganttWorkPackageStageColorPipe: (stage: WorkPackageStage | undefined, status: WbsElementStatus) => string = (
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
        return '#44a0b1';
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
        return '#55c7dd';
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
        return '#2d6b77';
      default:
        return grey[500];
    }
  }
};

export const GanttWorkPackageTextColor: string = '#ffffff';

export type HighlightTaskComparator<T> = (a: T, b: T) => boolean;
/**
 * Determines if the highlighted change is on a tasks root task.
 * @param highlightedChange The highlighted change
 * @param rootTask The root task of the current tasks
 */
export const isHighlightedChangeOnGanttTask = <T,>(
  highlightedChange: RequestEventChange<T>,
  rootTask: GanttTask<T>,
  highlightTaskComparator: HighlightTaskComparator<T>
): boolean => {
  return highlightedChange && highlightTaskComparator(highlightedChange.element, rootTask.element);
};

export const constructFinalizedChanges = (
  originalProjects: ProjectGantt[],
  updatedProjects: ProjectGantt[],
  changes: GanttChange<WbsElementPreview | Task>[]
) => {
  const aggregatedSet: Set<string> = new Set();

  // Determine which elements were affected
  changes.forEach((ganttChange) => aggregatedSet.add(projectWbsPipe(ganttChange.element.wbsNum)));

  const eventChanges: RequestEventChange<WbsElementPreview>[] = [];

  aggregatedSet.forEach((wbsString) => {
    const wbsNum = validateWBS(wbsString);
    const originalProject = originalProjects.find((project) => wbsPipe(project.wbsNum) === wbsPipe(wbsNum));
    const updatedProject = updatedProjects.find((project) => wbsPipe(project.wbsNum) === wbsPipe(wbsNum));

    if (originalProject && updatedProject) {
      eventChanges.push({
        changeId: uuidv4(),
        type: 'edit-task',
        prevEnd: getProjectEndDate(originalProject),
        prevStart: getProjectStartDate(originalProject),
        newStart: getProjectStartDate(updatedProject),
        newEnd: getProjectEndDate(updatedProject),
        element: updatedProject
      });
    } else if (updatedProject) {
      eventChanges.push({
        changeId: uuidv4(),
        type: 'create-task',
        prevEnd: undefined,
        prevStart: undefined,
        newStart: getProjectStartDate(updatedProject),
        newEnd: getProjectEndDate(updatedProject),
        element: updatedProject
      });
    }
  });

  return eventChanges;
};

export const isProjectPreview = (wbsPreview: WbsElementPreview | Task): wbsPreview is ProjectGantt => {
  return 'workPackages' in wbsPreview;
};

export const useGanttFilters = (key: string) => {
  const query = useQuery();
  const history = useHistory();

  const filters: RetroGanttFilters = useMemo(() => {
    const showCars = query.getAll('car').map((car) => parseInt(car));

    const showTeamTypes = query.getAll('teamType');

    const showTeams = query.getAll('team');

    const showOnlyOverdue = query.get('overdue') ? query.get('overdue') === 'true' : undefined;

    const hideTasks = query.get('hideTasks') ? query.get('hideTasks') === 'true' : undefined;

    const retroStartDate = query.get('retro-start') ? new Date(query.get('retro-start')!) : undefined;

    const retroEndDate = query.get('retro-end') ? new Date(query.get('retro-end')!) : undefined;

    return {
      showCars,
      showTeamTypes,
      showTeams,
      showOnlyOverdue,
      hideTasks,
      startDate: retroStartDate,
      endDate: retroEndDate
    };
  }, [query]);

  const setFilters = (updates: RetroGanttFilters) => {
    history.push({ search: buildRetroGanttParams(updates) }, { replace: false });
    localStorage.setItem(key, JSON.stringify(updates));
  };

  useEffect(() => {
    const hasQueryParams = Array.from(query.entries()).length > 0;
    if (!hasQueryParams) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const saved = JSON.parse(stored);
        history.push(
          {
            search: buildRetroGanttParams({
              ...saved,
              startDate: saved.startDate ? new Date(saved.startDate) : undefined,
              endDate: saved.endDate ? new Date(saved.endDate) : undefined
            })
          },
          { replace: false }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { filters, setFilters };
};
