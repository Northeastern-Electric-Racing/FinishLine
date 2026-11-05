/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  BaseWorkPackage,
  dbDateToLocalDate,
  RetrospectiveWorkPackage,
  WorkPackage,
  WorkPackageCard,
  WorkPackageDetail
} from 'shared';
import { implementedChangeTransformer } from './change-requests.transformers';
import { descriptionBulletTransformer } from './projects.transformers';
import { eventPreviewTransformer } from './calendar.transformer';

export const baseWorkPackageTransformer = (workPackage: BaseWorkPackage): BaseWorkPackage => ({
  ...workPackage,
  dateCreated: new Date(workPackage.dateCreated),
  startDate: dbDateToLocalDate(new Date(workPackage.startDate)),
  endDate: dbDateToLocalDate(new Date(workPackage.endDate))
});

export const workPackageDetailTransformer = (workPackage: WorkPackageDetail): WorkPackageDetail => ({
  ...workPackage,
  ...baseWorkPackageTransformer(workPackage),
  descriptionBullets: workPackage.descriptionBullets.map(descriptionBulletTransformer),
  changes: workPackage.changes.map((change) => ({ ...change, dateImplemented: new Date(change.dateImplemented) }))
});

export const workPackageCardTransformer = (workPackage: WorkPackageCard): WorkPackageCard => ({
  ...workPackage,
  ...baseWorkPackageTransformer(workPackage)
});

/**
 * @deprecated Use baseWorkPackageTransformer or a per-endpoint transformer. Still used by projects.transformers.ts and
 * gantt.utils.tsx until projects is refactored
 *
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

/** @deprecated Still used by projects.transformers.ts (retrospective timelines) until projects is refactored */
export const retrospectiveWorkPackageTransformer = (workPackage: RetrospectiveWorkPackage): RetrospectiveWorkPackage => {
  return {
    ...workPackageTransformer(workPackage),
    originalDuration: workPackage.originalDuration,
    originalStartDate: dbDateToLocalDate(new Date(workPackage.originalStartDate))
  };
};
