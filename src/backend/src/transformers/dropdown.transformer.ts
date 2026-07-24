/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import { MemberDropdownItem, ProjectDropdownItem, TeamDropdownItem, WorkPackageDropdownItem } from 'shared';
import {
  MemberDropdownQueryArgs,
  ProjectDropdownQueryArgs,
  TeamDropdownQueryArgs,
  WorkPackageDropdownQueryArgs
} from '../prisma-query-args/dropdown.query-args.js';
import { wbsNumOf } from '../utils/utils.js';

export const projectDropdownTransformer = (
  project: Prisma.ProjectGetPayload<ProjectDropdownQueryArgs>
): ProjectDropdownItem => ({
  id: project.projectId,
  name: project.wbsElement.name,
  wbsNum: wbsNumOf(project.wbsElement),
  carNumber: project.wbsElement.carNumber
});

export const workPackageDropdownTransformer = (
  workPackage: Prisma.Work_PackageGetPayload<WorkPackageDropdownQueryArgs>
): WorkPackageDropdownItem => ({
  id: workPackage.workPackageId,
  name: workPackage.wbsElement.name,
  wbsNum: wbsNumOf(workPackage.wbsElement),
  projectName: workPackage.project.wbsElement.name
});

export const memberDropdownTransformer = (user: Prisma.UserGetPayload<MemberDropdownQueryArgs>): MemberDropdownItem => ({
  userId: user.userId,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email
});

export const teamDropdownTransformer = (team: Prisma.TeamGetPayload<TeamDropdownQueryArgs>): TeamDropdownItem => ({
  teamId: team.teamId,
  name: team.teamName
});
