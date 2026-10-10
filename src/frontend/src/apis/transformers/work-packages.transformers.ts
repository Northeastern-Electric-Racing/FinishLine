/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { dbDateToLocalDate, GanttChartWorkPackage, RetrospectiveWorkPackage, WorkPackage, WorkPackagePreview } from 'shared';
import { implementedChangeTransformer } from './change-requests.transformers';
import { descriptionBulletTransformer } from './projects.transformers';
import { eventPreviewTransformer } from './calendar.transformer';

/**
 * Transforms a gantt chart work package to ensure deep field transformation of date objects.
 * Generic so re-parsing a richer work package (e.g. one created locally on the gantt) keeps its other fields.
 *
 * @param workPackage Incoming gantt chart work package object supplied by the HTTP response.
 * @returns Properly transformed gantt chart work package object.
 */
export const ganttChartWorkPackageTransformer = <T extends GanttChartWorkPackage>(workPackage: T): T => {
  return {
    ...workPackage,
    dateCreated: new Date(workPackage.dateCreated),
    startDate: dbDateToLocalDate(new Date(workPackage.startDate)),
    endDate: dbDateToLocalDate(new Date(workPackage.endDate)),
    events: workPackage.events.map((event) => ({ ...event, dateScheduled: new Date(event.dateScheduled) }))
  };
};

/**
 * Transforms a work package to ensure deep field transformation of date objects.
 *
 * @param workPackage Incoming work package object supplied by the HTTP response.
 * @returns Properly transformed work package object.
 */
export const workPackageTransformer = (workPackage: WorkPackage): WorkPackage => {
  return {
    ...workPackage,
    dateCreated: new Date(workPackage.dateCreated),
    startDate: dbDateToLocalDate(new Date(workPackage.startDate)),
    endDate: dbDateToLocalDate(new Date(workPackage.endDate)),
    descriptionBullets: workPackage.descriptionBullets.map(descriptionBulletTransformer),
    changes: workPackage.changes.map(implementedChangeTransformer),
    events: workPackage.events.map(eventPreviewTransformer)
  };
};

export const retrospectiveWorkPackageTransformer = (workPackage: RetrospectiveWorkPackage): RetrospectiveWorkPackage => {
  return {
    ...workPackageTransformer(workPackage),
    originalDuration: workPackage.originalDuration,
    originalStartDate: dbDateToLocalDate(new Date(workPackage.originalStartDate))
  };
};

export const workPackagePreviewTransformer = (workPackage: WorkPackagePreview): WorkPackagePreview => {
  return {
    ...workPackage,
    startDate: dbDateToLocalDate(new Date(workPackage.startDate)),
    endDate: dbDateToLocalDate(new Date(workPackage.endDate))
  };
};
