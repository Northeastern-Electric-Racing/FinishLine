/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BaseWorkPackage, dbDateToLocalDate, WorkPackageCard, WorkPackageDetail } from 'shared';
import { baseDescriptionBulletTransformer } from './projects.transformers';

/** Converts the dates on any work package model; extended models spread it and convert what they add */
export const baseWorkPackageTransformer = <T extends BaseWorkPackage>(workPackage: T): T => ({
  ...workPackage,
  startDate: dbDateToLocalDate(new Date(workPackage.startDate)),
  endDate: dbDateToLocalDate(new Date(workPackage.endDate))
});

export const workPackageDetailTransformer = (workPackage: WorkPackageDetail): WorkPackageDetail => ({
  ...baseWorkPackageTransformer(workPackage),
  descriptionBullets: workPackage.descriptionBullets.map(baseDescriptionBulletTransformer),
  changes: workPackage.changes.map((change) => ({ ...change, dateImplemented: new Date(change.dateImplemented) }))
});

export const workPackageCardTransformer = (workPackage: WorkPackageCard): WorkPackageCard =>
  baseWorkPackageTransformer(workPackage);
