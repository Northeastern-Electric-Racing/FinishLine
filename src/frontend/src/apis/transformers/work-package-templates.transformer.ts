/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WorkPackageTemplate } from 'shared';
import { descriptionBulletTransformer } from './projects.transformers';

/**
 * Transforms a work package template to ensure deep field transformation of date objects.
 *
 * @param workPackageTemplate Incoming work package object supplied by the HTTP response.
 * @returns Properly transformed work package template object.
 */
export const workPackageTemplateTransformer = (workPackageTemplate: WorkPackageTemplate): WorkPackageTemplate => {
  return {
    ...workPackageTemplate,
    dateCreated: new Date(workPackageTemplate.dateCreated),
    dateDeleted: workPackageTemplate.dateDeleted ? new Date(workPackageTemplate.dateDeleted) : undefined,
    descriptionBullets: workPackageTemplate.descriptionBullets.map(descriptionBulletTransformer)
  };
};
