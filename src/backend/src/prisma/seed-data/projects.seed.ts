/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from '@prisma/client';
import { LinkCreateArgs, WbsNumber } from 'shared';
import projectQueryArgs from '../../prisma-query-args/projects.query-args';
import ProjectsService from '../../services/projects.services';
import prisma from '../prisma';

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
  rules: string[],
  goals: string[],
  features: string[],
  otherConstraints: string[],
  links: LinkCreateArgs[],
  projectLeadId: number | null,
  projectManagerId: number | null
): Promise<{ projectWbsNumber: WbsNumber; projectId: number }> => {
  const projectWbsNumber = await ProjectsService.createProject(
    creator,
    changeRequestId,
    carNumber,
    name,
    summary,
    teamIds,
    budget,
    links,
    rules,
    goals.map((element) => {
      return { id: -1, detail: element };
    }),
    features.map((element) => {
      return { id: -1, detail: element };
    }),
    otherConstraints.map((element) => {
      return { id: -1, detail: element };
    }),
    projectLeadId,
    projectManagerId
  );

  const { projectId } = await prisma.project.findFirstOrThrow({
    where: {
      wbsElement: {
        carNumber: projectWbsNumber.carNumber,
        projectNumber: projectWbsNumber.projectNumber,
        workPackageNumber: projectWbsNumber.workPackageNumber
      }
    },
    ...projectQueryArgs
  });

  await ProjectsService.editProject(
    editor,
    projectId,
    changeRequestId,
    name,
    budget,
    summary,
    rules,
    goals.map((element) => {
      return { id: -1, detail: element };
    }),
    features.map((element) => {
      return { id: -1, detail: element };
    }),
    otherConstraints.map((element) => {
      return { id: -1, detail: element };
    }),
    links,
    projectLeadId,
    projectManagerId
  );

  return { projectWbsNumber, projectId };
};
