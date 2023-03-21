/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project, WbsNumber, wbsPipe, WorkPackage } from 'shared';
import { Task } from '../pages/GanttPage/GanttPackage/types/public-types';
import { projectWbsPipe } from './pipes';

export const NO_TEAM = 'No Team';

export interface GanttFilters {
  showCar0: boolean;
  showCar1: boolean;
  showCar2: boolean;
  status: string;
  selectedTeam: string;
  start: Date | null;
  end: Date | null;
  expanded: boolean;
}

export interface GanttTask extends Task {
  teamName: string;
}

export const filterGanttProjects = (projects: Project[], ganttFilters: GanttFilters): Project[] => {
  const decodedTeam = decodeURIComponent(ganttFilters.selectedTeam);
  const car0Check = (project: Project) => {
    return project.wbsNum.carNumber !== 0;
  };
  const car1Check = (project: Project) => {
    return project.wbsNum.carNumber !== 1;
  };
  const car2Check = (project: Project) => {
    return project.wbsNum.carNumber !== 2;
  };
  const statusCheck = (project: Project) => {
    return project.status.toString() === ganttFilters.status;
  };
  const teamCheck = (project: Project) => {
    return project.team?.teamName === decodedTeam;
  };
  const startCheck = (project: Project) => {
    return project.startDate && ganttFilters.start ? project.startDate >= ganttFilters.start : false;
  };
  const endCheck = (project: Project) => {
    return project.endDate && ganttFilters.end ? project.endDate <= ganttFilters.end : false;
  };
  if (!ganttFilters.showCar0) {
    projects = projects.filter(car0Check);
  }
  if (!ganttFilters.showCar1) {
    projects = projects.filter(car1Check);
  }
  if (!ganttFilters.showCar2) {
    projects = projects.filter(car2Check);
  }
  if (ganttFilters.status !== 'All Statuses') {
    projects = projects.filter(statusCheck);
  }
  if (decodedTeam !== 'All Teams') {
    projects = projects.filter(teamCheck);
  }
  if (ganttFilters.start) {
    projects = projects.filter(startCheck);
  }
  if (ganttFilters.end) {
    projects = projects.filter(endCheck);
  }
  return projects;
};

export const buildGanttSearchParams = (ganttFilters: GanttFilters): string => {
  return (
    `?status=${ganttFilters.status}` +
    `&showCar0=${ganttFilters.showCar0}` +
    `&showCar1=${ganttFilters.showCar1}` +
    `&showCar2=${ganttFilters.showCar2}` +
    `&selectedTeam=${encodeURIComponent(ganttFilters.selectedTeam)}` +
    `&expanded=${ganttFilters.expanded}` +
    `&start=${ganttFilters.start?.toLocaleDateString() ?? null}` +
    `&end=${ganttFilters.end?.toLocaleDateString() ?? null}`
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
    onClick: () => {
      window.open(`/projects/${wbsPipe(workPackage.wbsNum)}`, '_blank');
    }
  };
};

export const transformProjectToGanttTask = (project: Project, expanded: boolean): GanttTask[] => {
  const teamName = project.team?.teamName || NO_TEAM;

  const projectTask: GanttTask = {
    id: wbsPipe(project.wbsNum),
    name: wbsPipe(project.wbsNum) + ' ' + project.name,
    start: project.startDate || new Date(),
    end: project.endDate || new Date(),
    progress: 100,
    type: 'project',
    hideChildren: !expanded,
    teamName,
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
