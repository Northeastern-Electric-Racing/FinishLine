/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { dbDateToLocalDate, RetrospectiveWorkPackage, WorkPackage, WorkPackagePreview } from 'shared';
import { implementedChangeTransformer } from './change-requests.transformers';
import { descriptionBulletTransformer } from './projects.transformers';
import { eventPreviewTransformer } from './calendar.transformer';
import { taskTransformer } from './tasks.transformers';

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
    events: workPackage.events.map(eventPreviewTransformer),
    tasks: workPackage.tasks.map(taskTransformer)
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
