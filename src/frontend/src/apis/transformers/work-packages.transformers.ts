/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  BaseWorkPackage,
  dbDateToLocalDate,
  RetrospectiveWorkPackage,
  WorkPackage,
  WorkPackageGanttItem,
  WorkPackagePreview
} from 'shared';
import { implementedChangeTransformer } from './change-requests.transformers';
import { descriptionBulletTransformer } from './projects.transformers';
import { eventPreviewTransformer } from './calendar.transformer';

/**
 * Transforms any work package model that extends BaseWorkPackage, converting Base's date fields.
 *
 * @param workPackage Incoming work package supplied by the HTTP response.
 * @returns Properly transformed work package.
 */
export const baseWorkPackageTransformer = <T extends BaseWorkPackage>(workPackage: T): T => ({
  ...workPackage,
  dateCreated: new Date(workPackage.dateCreated),
  startDate: dbDateToLocalDate(new Date(workPackage.startDate)),
  endDate: dbDateToLocalDate(new Date(workPackage.endDate))
});

/**
 * Transforms a gantt chart work package bar, converting its date fields.
 * Generic so re-parsing a richer work package (e.g. one created locally on the gantt) keeps its other fields.
 *
 * @param workPackage Incoming gantt work package supplied by the HTTP response.
 * @returns Properly transformed gantt work package.
 */
export const workPackageGanttItemTransformer = <T extends WorkPackageGanttItem>(workPackage: T): T => {
  return {
    ...baseWorkPackageTransformer(workPackage),
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
