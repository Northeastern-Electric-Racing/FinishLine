/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  BaseDescriptionBullet,
  BaseProject,
  dbDateToLocalDate,
  DescriptionBullet,
  DesignReviewMarker,
  GanttWorkPackage,
  ProjectDetail,
  ProjectGanttItem,
  ProjectOverviewCard,
  RetrospectiveProject
} from 'shared';
import { baseTaskTransformer } from './tasks.transformers';
import { baseWorkPackageTransformer } from './work-packages.transformers';

/**
 * Converts the dates on a description bullet from a page model, which filters deleted bullets out before sending them.
 *
 * @param bullet Incoming description bullet object supplied by the HTTP response.
 * @returns Properly transformed description bullet object.
 */
export const baseDescriptionBulletTransformer = (bullet: BaseDescriptionBullet): BaseDescriptionBullet => ({
  ...bullet,
  dateAdded: new Date(bullet.dateAdded),
  dateChecked: bullet.dateChecked ? new Date(bullet.dateChecked) : undefined
});

/**
 * Converts the dates on a full description bullet, which still has dateDeleted (e.g. on templates).
 *
 * @param bullet Incoming description bullet object supplied by the HTTP response.
 * @returns Properly transformed description bullet object.
 */
export const descriptionBulletTransformer = (bullet: DescriptionBullet): DescriptionBullet => ({
  ...baseDescriptionBulletTransformer(bullet),
  dateDeleted: bullet.dateDeleted ? new Date(bullet.dateDeleted) : undefined
});

// project start and end dates are date-only values, stored as midnight UTC
const optionalDbDate = (date?: Date) => (date ? dbDateToLocalDate(new Date(date)) : undefined);

/** Converts the dates on any project model; extended models spread it and convert what they add */
export const baseProjectTransformer = <T extends BaseProject>(project: T): T => ({
  ...project,
  startDate: optionalDbDate(project.startDate),
  endDate: optionalDbDate(project.endDate)
});

export const projectOverviewCardTransformer = (project: ProjectOverviewCard): ProjectOverviewCard => ({
  ...baseProjectTransformer(project),
  activeWorkPackages: project.activeWorkPackages.map(baseWorkPackageTransformer)
});

const designReviewMarkerTransformer = (event: DesignReviewMarker): DesignReviewMarker => ({
  ...event,
  dateScheduled: new Date(event.dateScheduled)
});

export const ganttWorkPackageTransformer = <T extends GanttWorkPackage>(workPackage: T): T => ({
  ...baseWorkPackageTransformer(workPackage),
  events: workPackage.events.map(designReviewMarkerTransformer)
});

export const projectGanttItemTransformer = (project: ProjectGanttItem): ProjectGanttItem => ({
  ...baseProjectTransformer(project),
  workPackages: project.workPackages.map(ganttWorkPackageTransformer),
  tasks: project.tasks.map((task) => ({ ...baseTaskTransformer(task), startDate: optionalDbDate(task.startDate) }))
});

export const projectDetailTransformer = (project: ProjectDetail): ProjectDetail => ({
  ...baseProjectTransformer(project),
  descriptionBullets: project.descriptionBullets.map(baseDescriptionBulletTransformer),
  changes: project.changes.map((change) => ({ ...change, dateImplemented: new Date(change.dateImplemented) })),
  workPackages: project.workPackages.map(ganttWorkPackageTransformer)
});

export const retrospectiveProjectTransformer = (project: RetrospectiveProject): RetrospectiveProject => ({
  ...baseProjectTransformer(project),
  originalStartDate: optionalDbDate(project.originalStartDate),
  originalEndDate: optionalDbDate(project.originalEndDate),
  tasks: project.tasks.map((task) => ({ ...baseTaskTransformer(task), startDate: optionalDbDate(task.startDate) })),
  workPackages: project.workPackages.map((workPackage) => ({
    ...ganttWorkPackageTransformer(workPackage),
    originalStartDate: dbDateToLocalDate(new Date(workPackage.originalStartDate))
  }))
});
