import { Prisma } from '@prisma/client';
import {
  Project,
  calculateProjectEndDate,
  calculateDuration,
  calculateProjectStartDate,
  ProjectPreview,
  RetrospectiveProjectPreview,
  calculateProjectOriginalEndDate,
  calculateProjectOriginalStartDate
} from 'shared';
import { wbsNumOf } from '../utils/utils';
import taskTransformer from './tasks.transformer';
import { calculateProjectStatus } from '../utils/projects.utils';
import { linkTransformer } from './links.transformer';
import { descBulletConverter } from '../utils/description-bullets.utils';
import { userTransformer } from './user.transformer';
import { ProjectManyQueryArgs, ProjectQueryArgs } from '../prisma-query-args/projects.query-args';
import { teamPreviewTransformer } from './teams.transformer';
import workPackageTransformer, { retrospectiveWorkPackageTransformer } from './work-packages.transformer';
import { WorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args';

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
    links: project.wbsElement.links.map(linkTransformer),
    duration: calculateDuration(project.workPackages),
    startDate: calculateProjectStartDate(project.workPackages),
    endDate: calculateProjectEndDate(project.workPackages),
    descriptionBullets: wbsElement.descriptionBullets.map(descBulletConverter),
    tasks: wbsElement.tasks.map(taskTransformer),
    workPackages: project.workPackages.map(workPackageTransformer)
  };
};

export const projectPreviewTransformer = (project: Prisma.ProjectGetPayload<ProjectManyQueryArgs>): ProjectPreview => {
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
    teams: project.teams.map(teamPreviewTransformer),
    links: project.wbsElement.links.map(linkTransformer),
    duration: calculateDuration(project.workPackages),
    startDate: calculateProjectStartDate(project.workPackages),
    tasks: project.wbsElement.tasks.map(taskTransformer),
    workPackages: project.workPackages.map(workPackageTransformer)
  };
};

export type RetrospectiveWorkPackageQueryArgs = Prisma.Work_PackageGetPayload<WorkPackageQueryArgs> & {
  originalStartDate: Date;
  originalDuration: number;
};

export type RetrospectiveProjectPreviewQueryArgs = Omit<Prisma.ProjectGetPayload<ProjectManyQueryArgs>, 'workPackages'> & {
  workPackages: RetrospectiveWorkPackageQueryArgs[];
};

export const retrospectiveProjectPreviewTransformer = (
  project: RetrospectiveProjectPreviewQueryArgs
): RetrospectiveProjectPreview => {
  return {
    ...projectPreviewTransformer(project),
    workPackages: project.workPackages.map(retrospectiveWorkPackageTransformer),
    originalStartDate: calculateProjectOriginalStartDate(project.workPackages),
    originalEndDate: calculateProjectOriginalEndDate(project.workPackages)
  };
};

export default projectTransformer;
