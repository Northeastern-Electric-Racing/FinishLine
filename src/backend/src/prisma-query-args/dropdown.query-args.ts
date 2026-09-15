/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';

/**
 * Minimal query args backing the `/dropdown` endpoints. Each selects only the id, display name, and
 * just enough context to render/disambiguate the item in a dropdown.
 */

export type ProjectDropdownQueryArgs = ReturnType<typeof getProjectDropdownQueryArgs>;
export type WorkPackageDropdownQueryArgs = ReturnType<typeof getWorkPackageDropdownQueryArgs>;
export type MemberDropdownQueryArgs = ReturnType<typeof getMemberDropdownQueryArgs>;
export type TeamDropdownQueryArgs = ReturnType<typeof getTeamDropdownQueryArgs>;

export const getProjectDropdownQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      projectId: true,
      wbsElement: {
        select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
      }
    }
  });

export const getWorkPackageDropdownQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      workPackageId: true,
      wbsElement: {
        select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
      },
      project: { select: { wbsElement: { select: { name: true } } } }
    }
  });

export const getMemberDropdownQueryArgs = () =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: { userId: true, firstName: true, lastName: true, email: true }
  });

export const getTeamDropdownQueryArgs = () =>
  Prisma.validator<Prisma.TeamDefaultArgs>()({
    select: { teamId: true, teamName: true }
  });
