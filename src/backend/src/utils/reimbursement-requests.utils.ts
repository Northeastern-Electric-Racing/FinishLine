/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

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
  if (newProducts.length !== 0) {
    await validateReimbursementProducts(newProducts);
    await prisma.reimbursement_Product.createMany({
      data: newProducts.map((product) => ({
        name: product.name,
        cost: product.cost,
        wbsElementId: product.wbsElementId,
        reimbursementRequestId
      }))
    });
  }

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
