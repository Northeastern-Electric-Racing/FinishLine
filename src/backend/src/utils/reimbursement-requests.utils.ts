/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  OtherProductReason,
  OtherReimbursementProductCreateArgs,
  ReimbursementProductCreateArgs,
  ReimbursementReceiptCreateArgs,
  ValidatedWbsReimbursementProductCreateArgs,
  isAdmin,
  wbsPipe,
  WbsReimbursementProductCreateArgs
} from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from './errors.utils';
import { Prisma, Receipt, Reimbursement_Product, Reimbursement_Request, Team, User } from '@prisma/client';
import authUserQueryArgs from '../prisma-query-args/auth-user.query-args';
import { isUserOnTeam } from './teams.utils';

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
 * Validates that the wbs elements exist and are not deleted for each reimbursement product
 * @param reimbursementProductCreateArgs the reimbursement products to add to the data base
 * @param reimbursementRequestId the id of the reimbursement request that the products belogn to
 * @returns the reimbursement products with the wbs element id added
 * @throws if any of the wbs elements are deleted or dont exist
 */
export const validateReimbursementProducts = async (
  otherReimbursementProductCreateArgs: OtherReimbursementProductCreateArgs[],
  wbsReimbursementProductsCreateArgs: WbsReimbursementProductCreateArgs[]
): Promise<{
  validatedOtherReimbursementProducts: OtherReimbursementProductCreateArgs[];
  validatedWbsReimbursementProducts: ValidatedWbsReimbursementProductCreateArgs[];
}> => {
  if (otherReimbursementProductCreateArgs.length + wbsReimbursementProductsCreateArgs.length === 0) {
    throw new HttpException(400, 'You must have at least one product to reimburse');
  }

  /**
   * Goes through each wbsNum and finds the wbs element associated with it
   * Checks if the wbs element exists and is not deleted
   */
  const validatedWbsReimbursementProductsPromises: Promise<ValidatedWbsReimbursementProductCreateArgs>[] =
    wbsReimbursementProductsCreateArgs.map(async (product) => {
      //check whether the reason is a WBS Number
      const wbsNum = product.reason;
      const wbsElement = await prisma.wBS_Element.findFirst({
        where: {
          carNumber: wbsNum.carNumber,
          projectNumber: wbsNum.projectNumber,
          workPackageNumber: wbsNum.workPackageNumber
        }
      });
      if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
      if (wbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));

      return {
        ...product,
        wbsElementId: wbsElement.wbsElementId,
        wbsNum
      };
    });

  const validatedOtherReimbursementProducts = otherReimbursementProductCreateArgs.map((product) => {
    return {
      ...product,
      reason: product.reason as OtherProductReason
    };
  });

  const validatedWbsReimbursementProducts = await Promise.all(validatedWbsReimbursementProductsPromises);

  return { validatedOtherReimbursementProducts, validatedWbsReimbursementProducts };
};

/**
 * This function updates any current reimbursement products associated with a reimbursement request, creates any new reimbursement products, and deletes any deleted reimbursement products
 * @param currentReimbursementProducts the current reimbursement products of a reimbursement request
 * @param updatedReimbursementProducts the new reimbursement products to compare
 * @param reimbursementRequestId the reimbursement request that is being changed id
 */
export const updateReimbursementProducts = async (
  currentReimbursementProducts: Reimbursement_Product[],
  updatedOtherReimbursementProducts: OtherReimbursementProductCreateArgs[],
  updatedWbsReimbursementProducts: WbsReimbursementProductCreateArgs[],
  reimbursementRequestId: string
) => {
  if (updatedOtherReimbursementProducts.length + updatedWbsReimbursementProducts.length === 0) {
    throw new HttpException(400, 'A reimbursement request must have at least one reimbursement product!');
  }

  //if a product has an id that means it existed before and was updated
  const updatedOtherExistingProducts = updatedOtherReimbursementProducts.filter((product) => product.id);

  const updatedWbsExistingProducts = updatedWbsReimbursementProducts.filter((product) => product.id);

  const updatedExistingProducts = (updatedOtherExistingProducts as ReimbursementProductCreateArgs[]).concat(
    updatedWbsExistingProducts as ReimbursementProductCreateArgs[]
  );

  validateUpdatedProductsExistInDatabase(currentReimbursementProducts, updatedExistingProducts);

  const updatedExistingProductIds = updatedExistingProducts.map((product) => product.id!);

  //if the product does not have an id that means it is new
  const newOtherProducts = updatedOtherReimbursementProducts.filter((product) => !product.id);

  const newWbsProducts = updatedWbsReimbursementProducts.filter((product) => !product.id);

  //if there are products that exist in the current database but were not included in this edit, that means they were deleted
  const deletedProducts = currentReimbursementProducts.filter(
    (product) => !updatedExistingProductIds.includes(product.reimbursementProductId)
  );

  await updateDeletedProducts(deletedProducts);

  await createNewProducts(newOtherProducts, newWbsProducts, reimbursementRequestId);

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
 * Validates and Creates the new products in the database
 * @param otherProducts the other reimbursement products to create
 * @param wbsProducts the wbs reimbursement products to create
 */
const createNewProducts = async (
  otherProducts: OtherReimbursementProductCreateArgs[],
  wbsProducts: WbsReimbursementProductCreateArgs[],
  reimbursementRequestId: string
) => {
  //create the new reimbursement products
  if (otherProducts.length + wbsProducts.length !== 0) {
    const validatedReimbursementProducts = await validateReimbursementProducts(otherProducts, wbsProducts);
    await createReimbursementProducts(
      validatedReimbursementProducts.validatedOtherReimbursementProducts,
      validatedReimbursementProducts.validatedWbsReimbursementProducts,
      reimbursementRequestId
    );
  }
};

/**
 * Takes in validated reimbursement products and create them in the database
 * @param validatedOtherReimbursementProducts the other reimbursement products to create
 * @param validatedWbsReimbursementProducts the wbs reimbursement products to create
 * @param reimbursementRequestId id of the reimbursement request to associate the reimbursement products with
 */
export const createReimbursementProducts = async (
  validatedOtherReimbursementProducts: OtherReimbursementProductCreateArgs[],
  validatedWbsReimbursementProducts: ValidatedWbsReimbursementProductCreateArgs[],
  reimbursementRequestId: string
): Promise<void> => {
  const otherReimbursementProductPromises = validatedOtherReimbursementProducts.map(async (product) => {
    const reimbursementProductReason = await prisma.reimbursement_Product_Reason.create({
      data: {
        otherReason: product.reason
      }
    });

    return await prisma.reimbursement_Product.create({
      data: {
        name: product.name,
        cost: product.cost,
        reimbursementRequestId,
        reimbursementProductReasonId: reimbursementProductReason.reimbursementProductReasonId
      }
    });
  });

  const wbsReimbursementProductPromises = validatedWbsReimbursementProducts.map(async (product) => {
    const reimbursementProductReason = await prisma.reimbursement_Product_Reason.create({
      data: {
        wbsElement: {
          connect: {
            wbsElementId: product.wbsElementId
          }
        }
      }
    });

    return await prisma.reimbursement_Product.create({
      data: {
        name: product.name,
        cost: product.cost,
        reimbursementRequestId,
        reimbursementProductReasonId: reimbursementProductReason.reimbursementProductReasonId
      }
    });
  });

  await Promise.all([...otherReimbursementProductPromises, ...wbsReimbursementProductPromises]);
};

/**
 * Validates that the given user is on the finance team.
 *
 * @param user The user to validate.
 * @throws {AccessDeniedException} Fails validation when user is not on the
 * finance team.
 */
export const validateUserIsPartOfFinanceTeam = async (user: User) => {
  const isUserAuthorized = await isUserOnFinanceTeam(user);

  if (!isUserAuthorized) {
    throw new AccessDeniedException(`You are not a member of the finance team!`);
  }
};

/**
 * Determines if a user is part of the finance team.
 *
 * To be used for Prisma input validation of a plain User, as opposed to
 * <code>isAuthUserOnFinance</code>, which uses the additional fields
 * produced by authUserQueryArgs that are not in the User type by default.
 *
 * @param user the user to authenticate
 * @returns whether the user is on the finance team
 * @throws {HttpException} if finance team not found in database
 */
export const isUserOnFinanceTeam = async (user: User): Promise<boolean> => {
  if (!process.env.FINANCE_TEAM_ID) {
    throw new HttpException(500, 'FINANCE_TEAM_ID not in env');
  }

  const financeTeam = await prisma.team.findUnique({
    where: { teamId: process.env.FINANCE_TEAM_ID },
    include: { head: true, leads: true, members: true }
  });

  if (!financeTeam) throw new HttpException(500, 'Finance team does not exist!');
  return isUserOnTeam(financeTeam, user);
};

/**
 * Determines if a user is lead or head of the finance team.
 *
 * To be used for Prisma input validation of a plain User, as opposed to
 * <code>isAuthUserAtLeastLeadForFinance</code>, which uses the additional fields
 * produced by authUserQueryArgs that are not in the User type by default.
 *
 * @param user the user to authenticate
 * @returns whether the user is lead or head of the finance team
 * @throws {HttpException} if finance team not found in database
 */
export const isUserLeadOrHeadOfFinanceTeam = async (user: User): Promise<boolean> => {
  if (!process.env.FINANCE_TEAM_ID) {
    throw new HttpException(500, 'FINANCE_TEAM_ID not in env');
  }

  const financeTeam = await prisma.team.findUnique({
    where: { teamId: process.env.FINANCE_TEAM_ID },
    include: { head: true, leads: true }
  });

  if (!financeTeam) throw new HttpException(500, 'Finance team does not exist!');

  return user.userId === financeTeam.headId || financeTeam.leads.map((u) => u.userId).includes(user.userId);
};

export const isAuthUserOnFinance = (user: Prisma.UserGetPayload<typeof authUserQueryArgs>) => {
  if (!process.env.FINANCE_TEAM_ID) return false;
  const financeTeamId = process.env.FINANCE_TEAM_ID;
  const { teamAsHead, teamsAsLead, teamsAsMember } = user;
  return (
    teamAsHead?.teamId === financeTeamId ||
    isTeamIdInList(financeTeamId, teamsAsLead) ||
    isTeamIdInList(financeTeamId, teamsAsMember)
  );
};

/**
 * Determines if the user is a finance lead or head.
 * @param user the user to check
 * @returns Whether they are a finance lead.
 */
export const isAuthUserAtLeastLeadForFinance = (user: Prisma.UserGetPayload<typeof authUserQueryArgs>) => {
  if (!process.env.FINANCE_TEAM_ID) return false;
  const financeTeamId = process.env.FINANCE_TEAM_ID;
  const { teamAsHead, teamsAsLead } = user;
  return teamAsHead?.teamId === financeTeamId || isTeamIdInList(financeTeamId, teamsAsLead);
};

export const isAuthUserHeadOfFinance = (user: Prisma.UserGetPayload<typeof authUserQueryArgs>) => {
  return user.teamAsHead?.teamId === process.env.FINANCE_TEAM_ID;
};

export const isUserAdminOrOnFinance = async (submitter: User) => {
  try {
    await validateUserIsPartOfFinanceTeam(submitter);
  } catch (error) {
    if (!isAdmin(submitter.role)) {
      throw new AccessDeniedException('Only Admins, Finance Team Leads, or Heads can edit vendors');
    }
  }
};

const isTeamIdInList = (teamId: string, teamsList: Team[]) => {
  return teamsList.map((team) => team.teamId).includes(teamId);
};

/**
 * Validates user has permission to edit the reimbursement request.
 * @param user the person editing the reimbursement request
 * @param reimbursementRequest the reimbursement request to edit
 */
export const validateUserEditRRPermissions = async (user: User, reimbursementRequest: Reimbursement_Request) => {
  try {
    await validateUserIsPartOfFinanceTeam(user);
  } catch {
    if (reimbursementRequest.recipientId !== user.userId)
      throw new AccessDeniedException('Only the creator or finance team can edit a reimbursement request');
  }
};
