import { wbsPipe } from 'shared';
import prisma from '../prisma/prisma';
import { HttpException } from './errors.utils';

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
    return;
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
