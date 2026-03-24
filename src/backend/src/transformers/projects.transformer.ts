import { Prisma } from '@prisma/client';
import {
  Project,
  calculateProjectEndDate,
  calculateDuration,
  calculateProjectStartDate,
  ProjectGantt,
  RetrospectiveProjectPreview,
  calculateProjectOriginalEndDate,
  calculateProjectOriginalStartDate,
  ProjectPreview,
  calculateEndDate,
  WorkPackageStage,
  ProjectOverview
} from 'shared';
import { convertStatus, wbsNumOf } from '../utils/utils.js';
import taskTransformer from './tasks.transformer.js';
import { calculateProjectStatus } from '../utils/projects.utils.js';
import { descBulletConverter } from '../utils/description-bullets.utils.js';
import { userTransformer } from './user.transformer.js';
import {
  ProjectGanttQueryArgs,
  ProjectOverviewQueryArgs,
  ProjectPreviewQueryArgs,
  ProjectQueryArgs
} from '../prisma-query-args/projects.query-args.js';
import { teamPreviewTransformer } from './teams.transformer.js';
import workPackageTransformer, { retrospectiveWorkPackageTransformer } from './work-packages.transformer.js';
import { WorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args.js';

const projectTransformer = (project: Prisma.ProjectGetPayload<ProjectQueryArgs>): Project => {
  const { wbsElement } = project;
  const wbsNum = wbsNumOf(wbsElement);

  const { lead, manager } = wbsElement;

  return {
    wbsElementId: wbsElement.wbsElementId,
    id: project.projectId,
    wbsNum,
    dateCreated: wbsElement.dateCreated,
    name: wbsElement.name,
    status: calculateProjectStatus(project),
    lead: lead ? userTransformer(lead) : undefined,
    manager: manager ? userTransformer(manager) : undefined,
    changes: wbsElement.changes.map((change) => ({
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      changeRequestIdentifier: change.changeRequest.identifier,
      wbsNum,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    deleted: wbsElement.dateDeleted !== null,
    favoritedBy: project.favoritedBy.map(userTransformer),
    teams: project.teams.map(teamPreviewTransformer),
    summary: project.summary,
    budget: project.budget,
    links: project.wbsElement.links,
    duration: calculateDuration(project.workPackages),
    startDate: calculateProjectStartDate(project.workPackages),
    endDate: calculateProjectEndDate(project.workPackages),
    descriptionBullets: wbsElement.descriptionBullets.map(descBulletConverter),
    tasks: wbsElement.tasks.map(taskTransformer),
    workPackages: project.workPackages.map(workPackageTransformer),
    abbreviation: project.abbreviation ?? undefined
  };
};

export const projectGanttTransformer = (project: Prisma.ProjectGetPayload<ProjectGanttQueryArgs>): ProjectGantt => {
  const { wbsElement } = project;
  const wbsNum = wbsNumOf(wbsElement);

  const { lead, manager } = wbsElement;

  return {
    id: project.projectId,
    wbsElementId: project.wbsElementId,
    dateCreated: project.wbsElement.dateCreated,
    name: project.wbsElement.name,
    status: calculateProjectStatus(project),
    wbsNum,
    deleted: !!project.wbsElement.dateDeleted,
    lead: lead ? userTransformer(lead) : undefined,
    manager: manager ? userTransformer(manager) : undefined,
    budget: project.budget,
    teams: project.teams.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName
    })),
    duration: calculateDuration(project.workPackages),
    startDate: calculateProjectStartDate(project.workPackages),
    tasks: project.wbsElement.tasks.map(taskTransformer),
    workPackages: project.workPackages.map(workPackageTransformer),
    abbreviation: project.abbreviation ?? undefined
  };
};

export const projectPreviewTransformer = (project: Prisma.ProjectGetPayload<ProjectPreviewQueryArgs>): ProjectPreview => {
  const { wbsElement } = project;
  const wbsNum = wbsNumOf(wbsElement);

  const { lead, manager } = wbsElement;

  return {
    id: project.projectId,
    wbsElementId: wbsElement.wbsElementId,
    dateCreated: project.wbsElement.dateCreated,
    name: project.wbsElement.name,
    status: calculateProjectStatus(project),
    wbsNum,
    deleted: !!project.wbsElement.dateDeleted,
    lead: lead ? userTransformer(lead) : undefined,
    manager: manager ? userTransformer(manager) : undefined,
    budget: project.budget,
    duration: calculateDuration(project.workPackages),
    startDate: calculateProjectStartDate(project.workPackages),
    abbreviation: project.abbreviation ?? undefined,
    teams: project.teams,
    workPackages: project.workPackages.map((wp) => ({
      ...wp,
      status: convertStatus(wp.wbsElement.status),
      name: wp.wbsElement.name,
      wbsElementId: wp.wbsElement.wbsElementId,
      workPackageNumber: wp.wbsElement.workPackageNumber,
      id: wp.workPackageId,
      wbsNum: wbsNumOf(wp.wbsElement),
      dateCreated: wp.wbsElement.dateCreated,
      deleted: !!wp.wbsElement.dateDeleted,
      duration: wp.duration,
      startDate: wp.startDate,
      endDate: calculateEndDate(wp.startDate, wp.duration),
      stage: (wp.stage as WorkPackageStage) || undefined,
      projectName: project.wbsElement.name,
      projectId: project.projectId
    }))
  };
};

export const projectOverviewTransformer = (project: Prisma.ProjectGetPayload<ProjectOverviewQueryArgs>): ProjectOverview => {
  return {
    ...projectPreviewTransformer(project),
    tasksRemaining: project.wbsElement._count.tasks,
    links: project.wbsElement.links
  };
};

export type RetrospectiveWorkPackageQueryArgs = Prisma.Work_PackageGetPayload<WorkPackageQueryArgs> & {
  originalStartDate: Date;
  originalDuration: number;
};

export type RetrospectiveProjectPreviewQueryArgs = Omit<Prisma.ProjectGetPayload<ProjectGanttQueryArgs>, 'workPackages'> & {
  workPackages: RetrospectiveWorkPackageQueryArgs[];
};

export const retrospectiveProjectPreviewTransformer = (
  project: RetrospectiveProjectPreviewQueryArgs
): RetrospectiveProjectPreview => {
  return {
    ...projectGanttTransformer(project),
    workPackages: project.workPackages.map(retrospectiveWorkPackageTransformer),
    originalStartDate: calculateProjectOriginalStartDate(project.workPackages),
    originalEndDate: calculateProjectOriginalEndDate(project.workPackages)
  };
};

export default projectTransformer;
