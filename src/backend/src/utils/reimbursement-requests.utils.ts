import { wbsPipe } from 'shared';
import prisma from '../prisma/prisma';
import { HttpException } from './errors.utils';
import { Reimbursement_Product } from '@prisma/client';

export interface ReimbursementProductCreateArgs {
  id?: string;
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
export const addReimbursementProducts = async (
  reimbursementProductCreateArgs: ReimbursementProductCreateArgs[],
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

/**
 * This function updates the current reimbursement products of a reimbursement request versus the new reimbursement products of a reimbursement request.
 * @param currentReimbursementProducts the current reimbursement products of a reimbursement request
 * @param updatedReimbursementProducts the new reimbursement products to compare
 * @param reimbursementRequestId the reimbursement request that is being changed id
 */
export const updateReimbursementProducts = async (
  currentReimbursementProducts: Reimbursement_Product[],
  updatedReimbursementProducts: ReimbursementProductCreateArgs[],
  reimbursementRequestId: string
) => {
  //if a product has an id that means it existed before and was updated
  const updatedProducts = updatedReimbursementProducts.filter((product) => product.id);

  //Check to make sure that the updated products actually exist in the database
  const prismaProductIds = currentReimbursementProducts.map((product) => product.reimbursementProductId);

  const missingProductIds = updatedProducts.filter((product) => !prismaProductIds.includes(product.id!));

  if (missingProductIds.length > 0) {
    throw new HttpException(
      400,
      `The following products do not exist: ${missingProductIds.map((product) => product.name).join(', ')}`
    );
  }

  const updatedProductIds = updatedProducts.map((product) => product.id!);

  //if the product does not have an id that means it is new
  const newProducts = updatedReimbursementProducts.filter((product) => !product.id);

  //if there are products that exist in the current database but were not included in this edit, that means they were deleted
  const deletedProducts = currentReimbursementProducts.filter(
    (product) => !updatedProductIds.includes(product.reimbursementProductId)
  );

  //update the deleted reimbursement products by setting their date deleted to now
  await prisma.reimbursement_Product.updateMany({
    where: { reimbursementProductId: { in: deletedProducts.map((product) => product.reimbursementProductId) } },
    data: {
      dateDeleted: new Date()
    }
  });

  //create the new reimbursement products
  await addReimbursementProducts(newProducts, reimbursementRequestId);

  //updates the cost and name of the remaining products, which should be products that existed before that were not deleted
  // Does not update wbs element id because we are requiring the user on the frontend to delete it from the wbs number and then adding it to another one
  for (const product of updatedProducts) {
    await prisma.reimbursement_Product.update({
      where: { reimbursementProductId: product.id },
      data: {
        name: product.name,
        cost: product.cost
      }
    });
  }
};
