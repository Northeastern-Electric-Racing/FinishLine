import { wbsPipe } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedException, HttpException } from './errors.utils';
import { Team, User } from '@prisma/client';

/**
 * Adds a reimbursement product to the database
 * @param reimbursementProductCreateArgs the reimbursement products to add to the data base
 * @param reimbursementRequestId the id of the reimbursement request that the products belogn to
 * @throws if any of the wbs elements are deleted or dont exist
 */
export const addReimbursementProducts = async (
  reimbursementProductCreateArgs: { name: string; cost: number; wbsElementId: number }[],
  reimbursementRequestId: string
) => {
  if (reimbursementProductCreateArgs.length > 0) {
    const wbsElements = await prisma.wBS_Element.findMany({
      where: {
        wbsElementId: {
          in: reimbursementProductCreateArgs.map((reimbursementProductInfo) => reimbursementProductInfo.wbsElementId)
        }
      }
    });

    const deletedWbsElements = wbsElements.filter((wbsElement) => wbsElement.dateDeleted);
    if (deletedWbsElements.length > 0) {
      const deletedWbsNumbers = deletedWbsElements
        .map((wbsElement) =>
          wbsPipe({
            carNumber: wbsElement.carNumber,
            projectNumber: wbsElement.projectNumber,
            workPackageNumber: wbsElement.workPackageNumber
          })
        )
        .join(', ');
      throw new HttpException(400, `The following projects or work packages have been deleted: ${deletedWbsNumbers}`);
    }

    if (wbsElements.length < reimbursementProductCreateArgs.length) {
      const prismaWbsElementIds = reimbursementProductCreateArgs.map((productInfo) => productInfo.wbsElementId);
      const missingWbsNumbers = wbsElements
        .filter((wbsElement) => prismaWbsElementIds.includes(wbsElement.wbsElementId))
        .map((wbsElement) =>
          wbsPipe({
            carNumber: wbsElement.carNumber,
            projectNumber: wbsElement.projectNumber,
            workPackageNumber: wbsElement.workPackageNumber
          })
        );
      throw new HttpException(400, `The following projects or work packages do not exist: ${missingWbsNumbers.join(', ')}`);
    }

    await prisma.reimbursement_Product.createMany({
      data: reimbursementProductCreateArgs.map((reimbursementProductInfo) => {
        return {
          name: reimbursementProductInfo.name,
          cost: reimbursementProductInfo.cost,
          wbsElementId: reimbursementProductInfo.wbsElementId,
          reimbursementRequestId
        };
      })
    });
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
