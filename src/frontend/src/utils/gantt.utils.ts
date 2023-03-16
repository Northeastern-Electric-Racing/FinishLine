/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project, WbsNumber } from 'shared';

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
