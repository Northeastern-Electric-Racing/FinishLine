/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet, Link, LinkType, Project, ProjectPreview } from 'shared';
import { implementedChangeTransformer } from './change-requests.transformers';
import { taskTransformer } from './tasks.transformers';
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
    dateDeleted: bullet.dateDeleted ? new Date(bullet.dateDeleted) : bullet.dateDeleted,
    dateChecked: bullet.dateChecked ? new Date(bullet.dateChecked) : bullet.dateChecked
  };
};

/**
 * Transforms a link to ensure deep field transformation of date objects.
 *
 * @param link Icoming link object supplied by the HTTP response.
 * @returns Properly transformed link object.
 */
const linkTransformer = (link: Link) => {
  return {
    ...link,
    dateCreated: new Date(link.dateCreated),
    linkType: linkTypeTransformer(link.linkType)
  };
};

/**
 * Transforms a link type to ensure deep field transformation of date objects.
 *
 * @param linkType Incoming link type to be transformed
 * @returns Properly transformed description bullet
 */
export const linkTypeTransformer = (linkType: LinkType) => {
  return {
    ...linkType,
    dateCreated: new Date(linkType.dateCreated)
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
    tasks: project.tasks.map(taskTransformer),
    links: project.links.map(linkTransformer)
  };
};

export const projectPreviewTranformer = (project: ProjectPreview): ProjectPreview => {
  return {
    ...project,
    workPackages: project.workPackages.map(workPackageTransformer)
  };
};
