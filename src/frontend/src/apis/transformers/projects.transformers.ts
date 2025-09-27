/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  DescriptionBullet,
  Link,
  LinkType,
  Project,
  ProjectOverview,
  ProjectGantt,
  ProjectPreview,
  RetrospectiveProjectPreview
} from 'shared';
import { implementedChangeTransformer } from './change-requests.transformers';
import { taskTransformer } from './tasks.transformers';
import { retrospectiveWorkPackageTransformer, workPackageTransformer } from './work-packages.transformers';

/**
 * Transforms a description bullet to ensure deep field transformation of date objects.
 *
 * @param bullet Incoming description bullet object supplied by the HTTP response.
 * @returns Properly transformed description bullet object.
 */
export const descriptionBulletTransformer = (bullet: DescriptionBullet) => {
  return {
    ...bullet,
    dateAdded: new Date(bullet.dateAdded),
    dateDeleted: bullet.dateDeleted ? new Date(bullet.dateDeleted) : bullet.dateDeleted,
    dateChecked: bullet.dateChecked ? new Date(bullet.dateChecked) : bullet.dateChecked
  };
};

/**
 * Transforms a project to ensure deep field transformation of date objects.
 *
 * @param project Incoming project object supplied by the HTTP response.
 * @returns Properly transformed project object.
 */
export const projectTransformer = (project: Project): Project => {
  return {
    ...project,
    dateCreated: new Date(project.dateCreated),
    startDate: project.startDate ? new Date(project.startDate) : undefined,
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    workPackages: project.workPackages.map(workPackageTransformer),
    descriptionBullets: project.descriptionBullets.map(descriptionBulletTransformer),
    changes: project.changes.map(implementedChangeTransformer),
    tasks: project.tasks.map(taskTransformer)
  };
};

export const retrospectiveProjectPreviewTransformer = (
  project: RetrospectiveProjectPreview
): RetrospectiveProjectPreview => {
  return {
    ...projectGanttTransformer(project),
    originalEndDate: project.originalEndDate ? new Date(project.originalEndDate) : undefined,
    originalStartDate: project.originalStartDate ? new Date(project.originalStartDate) : undefined,
    workPackages: project.workPackages.map(retrospectiveWorkPackageTransformer)
  };
};

export const projectGanttTransformer = (project: ProjectGantt): ProjectGantt => {
  return {
    ...project,
    dateCreated: new Date(project.dateCreated),
    startDate: project.startDate ? new Date(project.startDate) : undefined,
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    workPackages: project.workPackages.map(workPackageTransformer)
  };
};

export const projectPreviewTransformer = (project: ProjectPreview): ProjectPreview => {
  return {
    ...project,
    dateCreated: new Date(project.dateCreated),
    startDate: project.startDate ? new Date(project.startDate) : undefined,
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    workPackages: project.workPackages.map((wp) => ({
      ...wp,
      dateCreated: new Date(wp.dateCreated),
      startDate: new Date(wp.startDate),
      endDate: new Date(wp.endDate)
    }))
  };
};

export const projectOverviewTransformer = (project: ProjectOverview): ProjectOverview => {
  return {
    ...project,
    dateCreated: new Date(project.dateCreated),
    startDate: project.startDate ? new Date(project.startDate) : undefined,
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    workPackages: project.workPackages.map((wp) => ({
      ...wp,
      dateCreated: new Date(wp.dateCreated),
      startDate: new Date(wp.startDate),
      endDate: new Date(wp.endDate)
    })),
    links: project.links,
    tasks: project.tasks.map(taskTransformer)
  };
};

export const projectToProjectPreviewTransformer = (project: Project): ProjectGantt => {
  return {
    ...project
  };
};
