/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { wbsPipe } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedException, HttpException } from './errors.utils';
import { Team, User } from '@prisma/client';

export interface ReimbursementProductCreateArgs {
  name: string;
  cost: number;
  wbsElementId: number;
}

/**
 * Adds a reimbursement product to the database
 * @param reimbursementProductCreateArgs the reimbursement products to add to the data base
 * @param reimbursementRequestId the id of the reimbursement request that the products belogn to
 * @throws if any of the wbs elements are deleted or dont exist
 */
export const validateReimbursementProducts = async (reimbursementProductCreateArgs: ReimbursementProductCreateArgs[]) => {
  if (reimbursementProductCreateArgs.length === 0) {
    throw new HttpException(400, 'You must have at least one product to reimburse');
  }

  const wbsElementIds = reimbursementProductCreateArgs.map(
    (reimbursementProductInfo) => reimbursementProductInfo.wbsElementId
  );
  const wbsElements = await prisma.wBS_Element.findMany({
    where: {
      wbsElementId: {
        in: wbsElementIds
      }
    }
  });

  const deletedWbsElements = wbsElements.filter((wbsElement) => wbsElement.dateDeleted);

  if (deletedWbsElements.length > 0) {
    const deletedWbsNumbers = deletedWbsElements.map(wbsPipe).join(', ');
    throw new HttpException(400, `The following projects or work packages have been deleted: ${deletedWbsNumbers}`);
  }

  if (wbsElements.length < reimbursementProductCreateArgs.length) {
    const prismaWbsElementIds = reimbursementProductCreateArgs.map((productInfo) => productInfo.wbsElementId);
    const missingWbsNumbers = wbsElements
      .filter((wbsElement) => prismaWbsElementIds.includes(wbsElement.wbsElementId))
      .map(wbsPipe);
    throw new HttpException(400, `The following projects or work packages do not exist: ${missingWbsNumbers.join(', ')}`);
  }
};

export type UserWithTeam = User & { teams: Team[] };

export const validateUserIsPartOfFinanceTeam = async (user: UserWithTeam) => {
  const financeTeam = await prisma.team.findUnique({
    where: { teamId: process.env.FINANCE_TEAM_ID }
  });

  if (!financeTeam) throw new HttpException(500, 'Finance team does not exist!');

  if (!user.teams.some((team) => team.teamId === process.env.FINANCE_TEAM_ID) && !(financeTeam.leaderId === user.userId)) {
    throw new AccessDeniedException(`You are not a member of the finance team!`);
  }
};
