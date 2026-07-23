/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import { SlimCar, SlimProject, SlimTeam, SlimUser, SlimWorkPackage } from 'shared';
import {
  SlimCarQueryArgs,
  SlimProjectQueryArgs,
  SlimTeamQueryArgs,
  SlimUserQueryArgs,
  SlimWorkPackageQueryArgs
} from '../prisma-query-args/dropdown.query-args.js';
import { wbsNumOf } from '../utils/utils.js';

export const slimCarTransformer = (car: Prisma.CarGetPayload<SlimCarQueryArgs>): SlimCar => ({
  id: car.carId,
  name: car.wbsElement.name,
  wbsNum: wbsNumOf(car.wbsElement)
});

export const slimProjectTransformer = (project: Prisma.ProjectGetPayload<SlimProjectQueryArgs>): SlimProject => ({
  id: project.projectId,
  name: project.wbsElement.name,
  wbsNum: wbsNumOf(project.wbsElement),
  carNumber: project.wbsElement.carNumber
});

export const slimWorkPackageTransformer = (
  workPackage: Prisma.Work_PackageGetPayload<SlimWorkPackageQueryArgs>
): SlimWorkPackage => ({
  id: workPackage.workPackageId,
  name: workPackage.wbsElement.name,
  wbsNum: wbsNumOf(workPackage.wbsElement),
  projectName: workPackage.project.wbsElement.name
});

export const slimUserTransformer = (user: Prisma.UserGetPayload<SlimUserQueryArgs>): SlimUser => ({
  userId: user.userId,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email
});

export const slimTeamTransformer = (team: Prisma.TeamGetPayload<SlimTeamQueryArgs>): SlimTeam => ({
  teamId: team.teamId,
  name: team.teamName
});
