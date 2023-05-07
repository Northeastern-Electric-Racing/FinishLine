import { User } from '@prisma/client';
import { Club_Account } from 'shared';
import prisma from '../prisma/prisma';
import { addReimbursementProducts } from '../utils/reimbursement-requests.utils';
import { NotFoundException } from '../utils/errors.utils';
import { ReimbursementRequest } from '../../../shared/src/types/reimbursement-requests-types';
import reimbursementRequestQueryArgs from '../prisma-query-args/reimbursement-requests.query-args';
import reimbursementRequestTransformer from '../transformers/reimbursement-requests.transformer';

export default class ReimbursementRequestService {
  /**
   * Creates a reimbursement request in the database
   * @param receipient the user who is creating the reimbursement request
   * @param dateOfExpense the date that the expense occured
   * @param vendorId the id of the vendor that the expense was made for
   * @param account the account to be reimbursed from
   * @param receiptPictures the links to the s3 buckets to retrieve the pictures
   * @param reimbursementProducts the products that the user bought
   * @param expenseTypeId the id of the expense type the user made
   * @param totalCost the total cost of the reimbursement
   * @returns the id of the created reimbursement request
   */
  static async createReimbursementRequest(
    receipient: User,
    dateOfExpense: Date,
    vendorId: string,
    account: Club_Account,
    receiptPictures: string[],
    reimbursementProducts: { name: string; cost: number; wbsElementId: number }[],
    expenseTypeId: string,
    totalCost: number
  ): Promise<String> {
    const vendor = await prisma.vendor.findUnique({
      where: { vendorId }
    });

    if (!vendor) throw new NotFoundException('Vendor', vendorId);

    const expenseType = await prisma.expense_Type.findUnique({
      where: { expenseTypeId }
    });

    if (!expenseType) throw new NotFoundException('Expense Type', expenseTypeId);

    const createdReimbursementRequest = await prisma.reimbursement_Request.create({
      data: {
        recepientId: receipient.userId,
        dateOfExpense,
        vendorId: vendor.vendorId,
        account,
        receiptPictures,
        expenseTypeId: expenseType.expenseTypeId,
        totalCost
      }
    });

    addReimbursementProducts(reimbursementProducts, createdReimbursementRequest.reimbursementRequestId);

    prisma.reimbursement_Status.create({
      data: {
        type: 'PENDING_FINANCE',
        userId: receipient.userId,
        reimbursementRequestId: createdReimbursementRequest.reimbursementRequestId
      }
    });

    return createdReimbursementRequest.reimbursementRequestId;
  }

  /**
   * Gets all the reimbursement requests from the database
   * @returns an array of the prisma version of the reimbursement requests transformed to the shared version
   */
  static async getAllReimbursementRequests(): Promise<ReimbursementRequest[]> {
    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: { dateDeleted: null },
      ...reimbursementRequestQueryArgs
    });

    const outputReimbursementRequests = reimbursementRequests.map(reimbursementRequestTransformer);

    return outputReimbursementRequests;
  }
}
