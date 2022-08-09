/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackage } from 'shared';
import { implementedChangeTransformer } from './change-requests.transformers';
import { descriptionBulletTransformer } from './projects.transformers';

/**
 * Transforms a work package to ensure deep field transformation of date objects.
 *
 * @param workPackage Incoming work package object supplied by the HTTP response.
 * @returns Properly transformed work package object.
 */
export const workPackageTransformer = (workPackage: WorkPackage) => {
  return {
    ...workPackage,
    dateCreated: new Date(workPackage.dateCreated),
    startDate: new Date(workPackage.startDate),
    endDate: new Date(workPackage.endDate),
    expectedActivities: workPackage.expectedActivities.map(descriptionBulletTransformer),
    deliverables: workPackage.deliverables.map(descriptionBulletTransformer),
    changes: workPackage.changes.map(implementedChangeTransformer)
  };
};
