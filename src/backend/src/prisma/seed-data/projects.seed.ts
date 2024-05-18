/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from '@prisma/client';
import { DescriptionBulletPreview, LinkCreateArgs, WbsNumber } from 'shared';
import ProjectsService from '../../services/projects.services';

/**
 * Creates a project with the given data using service functions. This has to be done by:
 * 1) creating the project
 * 2) editing the project
 */
export const seedProject = async (
  creator: User,
  changeRequestId: number,
  carNumber: number,
  name: string,
  summary: string,
  teamIds: string[],
  editor: User,
  budget: number,
  links: LinkCreateArgs[],
  descriptionBullets: DescriptionBulletPreview[],
  projectLeadId: number | null,
  projectManagerId: number | null,
  organizationId: string
): Promise<{ projectWbsNumber: WbsNumber; projectId: number }> => {
  const project = await ProjectsService.createProject(
    creator,
    changeRequestId,
    carNumber,
    name,
    summary,
    teamIds,
    budget,
    links,
    descriptionBullets,
    projectLeadId,
    projectManagerId,
    organizationId
  );

  await ProjectsService.editProject(
    editor,
    project.id,
    changeRequestId,
    name,
    budget,
    summary,
    [],
    links,
    projectLeadId,
    projectManagerId,
    organizationId
  );

  return { projectWbsNumber: project.wbsNum, projectId: project.id };
};
