import { User } from '@prisma/client';
import { Club_Account, isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { addReimbursementProducts } from '../utils/reimbursement-requests.utils';
import { AccessDeniedAdminOnlyException, AccessDeniedException, NotFoundException } from '../utils/errors.utils';

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
   * Function to create a vendor in our database
   * @param submitter the user who is creating the vendor
   * @param name the name of the vendor
   * @returns the id of the created vendor
   */
  static async createVendor(submitter: User, name: string) {
    if (!isAdmin(submitter.role)) throw new AccessDeniedAdminOnlyException('create vendors');

    const vendor = await prisma.vendor.create({
      data: {
        name
      }
    });

    return vendor.vendorId;
  }
}
