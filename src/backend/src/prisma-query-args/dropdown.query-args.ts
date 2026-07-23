/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';

/**
 * Minimal query args backing the `/slim` dropdown endpoints. Each selects only the id, display name,
 * and just enough context to render/disambiguate the item in a dropdown.
 */

export type SlimCarQueryArgs = ReturnType<typeof getSlimCarQueryArgs>;
export type SlimProjectQueryArgs = ReturnType<typeof getSlimProjectQueryArgs>;
export type SlimWorkPackageQueryArgs = ReturnType<typeof getSlimWorkPackageQueryArgs>;
export type SlimUserQueryArgs = ReturnType<typeof getSlimUserQueryArgs>;
export type SlimTeamQueryArgs = ReturnType<typeof getSlimTeamQueryArgs>;

export const getSlimCarQueryArgs = () =>
  Prisma.validator<Prisma.CarDefaultArgs>()({
    select: {
      carId: true,
      wbsElement: {
        select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
      }
    }
  });

export const getSlimProjectQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      projectId: true,
      wbsElement: {
        select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
      }
    }
  });

export const getSlimWorkPackageQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      workPackageId: true,
      wbsElement: {
        select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
      },
      project: { select: { wbsElement: { select: { name: true } } } }
    }
  });

export const getSlimUserQueryArgs = () =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: { userId: true, firstName: true, lastName: true, email: true }
  });

export const getSlimTeamQueryArgs = () =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    select: { teamId: true, teamName: true }
  });
