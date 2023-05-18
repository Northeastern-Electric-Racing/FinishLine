/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Club_Accounts, Reimbursement_Request, User } from '@prisma/client';
import { Club_Account, isAdmin, isGuest } from 'shared';
import prisma from '../prisma/prisma';
import {
  ReimbursementProductCreateArgs,
  updateReimbursementProducts,
  validateReimbursementProducts
} from '../utils/reimbursement-requests.utils';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  DeletedException,
  NotFoundException
} from '../utils/errors.utils';

export default class ReimbursementRequestService {
  /**
   * Creates a reimbursement request in the database
   * @param recipient the user who is creating the reimbursement request
   * @param dateOfExpense the date that the expense occured
   * @param vendorId the id of the vendor that the expense was made for
   * @param account the account to be reimbursed from
   * @param receiptPictures the links for the receipt pictures in the google drive
   * @param reimbursementProducts the products that the user bought
   * @param expenseTypeId the id of the expense type the user made
   * @param totalCost the total cost of the reimbursement with tax
   * @returns the created reimbursement request
   */
  static async createReimbursementRequest(
    recipient: User,
    dateOfExpense: Date,
    vendorId: string,
    account: Club_Account,
    receiptPictures: string[],
    reimbursementProducts: ReimbursementProductCreateArgs[],
    expenseTypeId: string,
    totalCost: number
  ): Promise<Reimbursement_Request> {
    if (isGuest(recipient.role)) throw new AccessDeniedGuestException('Guests cannot create a reimbursement request');

    const vendor = await prisma.vendor.findUnique({
      where: { vendorId }
    });

    if (!vendor) throw new NotFoundException('Vendor', vendorId);

    const expenseType = await prisma.expense_Type.findUnique({
      where: { expenseTypeId }
    });

    if (!expenseType) throw new NotFoundException('Expense Type', expenseTypeId);

    await validateReimbursementProducts(reimbursementProducts);

    const createdReimbursementRequest = await prisma.reimbursement_Request.create({
      data: {
        recepientId: recipient.userId,
        dateOfExpense,
        vendorId: vendor.vendorId,
        account,
        receiptPictures,
        expenseTypeId: expenseType.expenseTypeId,
        totalCost,
        reimbursementsStatuses: {
          create: {
            type: 'PENDING_FINANCE',
            userId: recipient.userId
          }
        },
        reimbursementProducts: {
          createMany: {
            data: reimbursementProducts.map((reimbursementProductInfo) => {
              return {
                name: reimbursementProductInfo.name,
                cost: reimbursementProductInfo.cost,
                wbsElementId: reimbursementProductInfo.wbsElementId
              };
            })
          }
        }
      }
    });

    return createdReimbursementRequest;
  }

  /**
   * Edits the given reimbursement Request
   *
   * @param id the id of the reimbursement request we are editing
   * @param dateOfExpense the updated date of expense
   * @param vendorId the updated vendor id
   * @param account the updated account
   * @param expenseTypeId the updated expense type id
   * @param totalCost the updated total cost
   * @param reimbursementProducts the updated reimbursement products
   * @param saboId the updated saboId
   * @param submitter the person editing the reimbursement request
   * @returns the edited reimbursement request
   */
  static async editReimbursementRequest(
    id: string,
    dateOfExpense: Date,
    vendorId: string,
    account: Club_Accounts,
    expenseTypeId: string,
    totalCost: number,
    reimbursementProducts: ReimbursementProductCreateArgs[],
    saboId: number | null,
    receiptPictures: string[],
    submitter: User
  ): Promise<Reimbursement_Request> {
    const oldReimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId: id },
      include: {
        reimbursementProducts: true
      }
    });

    if (!oldReimbursementRequest) throw new NotFoundException('Reimbursement Request', id);
    if (oldReimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', id);
    if (oldReimbursementRequest.recepientId !== submitter.userId)
      throw new AccessDeniedException(
        'You do not have access to delete this reimbursement request, only the creator can edit a reimbursement request'
      );

    const vendor = await prisma.vendor.findUnique({
      where: { vendorId }
    });

    if (!vendor) throw new NotFoundException('Vendor', vendorId);

    const expenseType = await prisma.expense_Type.findUnique({
      where: { expenseTypeId }
    });

    if (!expenseType) throw new NotFoundException('Expense Type', expenseTypeId);

    await updateReimbursementProducts(
      oldReimbursementRequest.reimbursementProducts,
      reimbursementProducts,
      oldReimbursementRequest.reimbursementRequestId
    );

    const updatedReimbursementRequest = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId: oldReimbursementRequest.reimbursementRequestId },
      data: {
        dateOfExpense,
        account,
        totalCost,
        expenseTypeId,
        vendorId,
        receiptPictures,
        saboId
      }
    });

    return updatedReimbursementRequest;
  }

  /**
   * Function to create a vendor in our database
   * @param submitter the user who is creating the vendor
   * @param name the name of the vendor
   * @returns the created vendor
   */
  static async createVendor(submitter: User, name: string) {
    if (!isAdmin(submitter.role)) throw new AccessDeniedAdminOnlyException('create vendors');

    const vendor = await prisma.vendor.create({
      data: {
        name
      }
    });

    return vendor;
  }

  /**
   * Service function to create an expense type in our database
   * @param name The name of the expense type
   * @param code the expense type's SABO code
   * @param allowed whether or not this expense type is allowed
   * @returns the created expense type
   */
  static async createExpenseType(submitter: User, name: string, code: number, allowed: boolean) {
    if (!isAdmin(submitter.role)) throw new AccessDeniedAdminOnlyException('create expense types');
    const expense = await prisma.expense_Type.create({
      data: {
        name,
        allowed,
        code
      }
    });

    return expense;
  }
}
