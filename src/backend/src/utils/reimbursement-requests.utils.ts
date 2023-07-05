/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { wbsPipe } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedException, HttpException } from './errors.utils';
import { Receipt, Reimbursement_Product, Team, User } from '@prisma/client';

export interface ReimbursementProductCreateArgs {
  id?: string;
  name: string;
  cost: number;
  wbsElementId: number;
}

export interface ReimbursementReceiptCreateArgs {
  name: string;
  googleFileId: string;
}

export interface ReimbursementProductCreateArgs {
  name: string;
  cost: number;
  wbsElementId: number;
}

/**
 * This function removes any deleted receipts and adds any new receipts
 * @param receipts the new list of receipts to compare against the old ones
 * @param currentReceipts the current list of receipts on the request that's being edited
 */
export const removeDeletedReceiptPictures = async (
  newReceipts: ReimbursementReceiptCreateArgs[],
  currentReceipts: Receipt[],
  submitter: User
) => {
  if (currentReceipts.length === 0) return;
  const deletedReceipts = currentReceipts.filter(
    (currentReceipt) => !newReceipts.find((receipt) => receipt.googleFileId === currentReceipt.googleFileId)
  );

  //mark any deleted receipts as deleted in the database
  await prisma.receipt.updateMany({
    where: { receiptId: { in: deletedReceipts.map((receipt) => receipt.receiptId) } },
    data: {
      dateDeleted: new Date(),
      deletedByUserId: submitter.userId
    }
  });
};

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
 * This function updates any current reimbursement products associated with a reimbursement request, creates any new reimbursement products, and deletes any deleted reimbursement products
 * @param currentReimbursementProducts the current reimbursement products of a reimbursement request
 * @param updatedReimbursementProducts the new reimbursement products to compare
 * @param reimbursementRequestId the reimbursement request that is being changed id
 */
export const updateReimbursementProducts = async (
  currentReimbursementProducts: Reimbursement_Product[],
  updatedReimbursementProducts: ReimbursementProductCreateArgs[],
  reimbursementRequestId: string
) => {
  if (updatedReimbursementProducts.length === 0) {
    throw new HttpException(400, 'A reimbursement request must have at least one reimbursement product!');
  }

  //if a product has an id that means it existed before and was updated
  const updatedExistingProducts = updatedReimbursementProducts.filter((product) => product.id);

  validateUpdatedProductsExistInDatabase(currentReimbursementProducts, updatedExistingProducts);

  const updatedExistingProductIds = updatedExistingProducts.map((product) => product.id!);

  //if the product does not have an id that means it is new
  const newProducts = updatedReimbursementProducts.filter((product) => !product.id);

  //if there are products that exist in the current database but were not included in this edit, that means they were deleted
  const deletedProducts = currentReimbursementProducts.filter(
    (product) => !updatedExistingProductIds.includes(product.reimbursementProductId)
  );

  await updateDeletedProducts(deletedProducts);

  await createNewProducts(newProducts, reimbursementRequestId);

  await updateExistingProducts(updatedExistingProducts);
};

/**
 * updates the existing products in the database
 *
 * @param products the products to update
 */
const updateExistingProducts = async (products: ReimbursementProductCreateArgs[]) => {
  //updates the cost and name of the remaining products, which should be products that existed before that were not deleted
  // Does not update wbs element id because we are requiring the user on the frontend to delete it from the wbs number and then adding it to another one
  for (const product of products) {
    await prisma.reimbursement_Product.update({
      where: { reimbursementProductId: product.id },
      data: {
        name: product.name,
        cost: product.cost
      }
    });
  }
};

/**
 * validates that the products that should be updated in the database exist
 * @param currentReimbursementProducts The products that do exist in the database
 * @param updatedExistingProducts The products that are being updated that already have Ids
 */
const validateUpdatedProductsExistInDatabase = (
  currentReimbursementProducts: Reimbursement_Product[],
  updatedExistingProducts: ReimbursementProductCreateArgs[]
) => {
  //Check to make sure that the updated products actually exist in the database
  const prismaProductIds = currentReimbursementProducts.map((product) => product.reimbursementProductId);

  const missingProductIds = updatedExistingProducts.filter((product) => !prismaProductIds.includes(product.id!));

  if (missingProductIds.length > 0) {
    throw new HttpException(
      400,
      `The following products do not exist: ${missingProductIds.map((product) => product.name).join(', ')}`
    );
  }
};

/**
 * Soft deletes the given products in the database
 *
 * @param products the products to delete
 */
const updateDeletedProducts = async (products: Reimbursement_Product[]) => {
  //update the deleted reimbursement products by setting their date deleted to now
  await prisma.reimbursement_Product.updateMany({
    where: { reimbursementProductId: { in: products.map((product) => product.reimbursementProductId) } },
    data: {
      dateDeleted: new Date()
    }
  });
};

/**
 * Creates the new products in the database
 * @param products the products to create
 */
const createNewProducts = async (products: ReimbursementProductCreateArgs[], reimbursementRequestId: string) => {
  //create the new reimbursement products
  if (products.length !== 0) {
    await validateReimbursementProducts(products);
    await prisma.reimbursement_Product.createMany({
      data: products.map((product) => ({
        name: product.name,
        cost: product.cost,
        wbsElementId: product.wbsElementId,
        reimbursementRequestId
      }))
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

export const validateUserIsHeadOfFinanceTeam = async (user: User) => {
  const financeTeam = await prisma.team.findUnique({
    where: { teamId: process.env.FINANCE_TEAM_ID }
  });

  if (!financeTeam) throw new HttpException(500, 'Finance team does not exist!');

  if (!(financeTeam.leaderId === user.userId)) {
    throw new AccessDeniedException('You are not the head of the finance team!');
  }
};
