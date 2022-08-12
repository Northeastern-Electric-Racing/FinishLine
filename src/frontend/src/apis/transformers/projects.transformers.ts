/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet, Project } from 'shared';
import { implementedChangeTransformer } from './change-requests.transformers';
import { workPackageTransformer } from './work-packages.transformers';

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
    dateDeleted: bullet.dateDeleted ? new Date(bullet.dateDeleted) : bullet.dateDeleted
  };
};

/**
 * Transforms a project to ensure deep field transformation of date objects.
 *
 * @param project Incoming project object supplied by the HTTP response.
 * @returns Properly transformed project object.
 */
export const projectTransformer = (project: Project) => {
  return {
    ...project,
    dateCreated: new Date(project.dateCreated),
    workPackages: project.workPackages.map(workPackageTransformer),
    goals: project.goals.map(descriptionBulletTransformer),
    features: project.features.map(descriptionBulletTransformer),
    otherConstraints: project.otherConstraints.map(descriptionBulletTransformer),
    changes: project.changes.map(implementedChangeTransformer)
  };
};
