/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Reimbursement_Request, User } from '@prisma/client';
import { Club_Account, isGuest } from 'shared';
import prisma from '../prisma/prisma';
import { ReimbursementProductCreateArgs, validateReimbursementProducts } from '../utils/reimbursement-requests.utils';
import { AccessDeniedGuestException, NotFoundException } from '../utils/errors.utils';

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
}
