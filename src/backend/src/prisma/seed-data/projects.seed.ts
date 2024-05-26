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
  changeRequestId: string,
  carNumber: number,
  name: string,
  summary: string,
  teamIds: string[],
  editor: User,
  budget: number,
  links: LinkCreateArgs[],
  descriptionBullets: DescriptionBulletPreview[],
  leadId: string | null,
  managerId: string | null,
  organizationId: string
): Promise<{ projectWbsNumber: WbsNumber; projectId: string }> => {
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
    leadId,
    managerId,
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
    leadId,
    managerId,
    organizationId
  );

  return { projectWbsNumber: project.wbsNum, projectId: project.id };
};
