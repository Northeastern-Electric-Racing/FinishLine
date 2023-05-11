import { Club_Accounts, User } from '@prisma/client';
import { Club_Account } from 'shared';
import prisma from '../prisma/prisma';
import {
  ReimbursementProductCreateArgs,
  addReimbursementProducts,
  updateReimbursementProducts
} from '../utils/reimbursement-requests.utils';
import { AccessDeniedException, DeletedException, NotFoundException } from '../utils/errors.utils';

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
    reimbursementProducts: ReimbursementProductCreateArgs[],
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

    await addReimbursementProducts(reimbursementProducts, createdReimbursementRequest.reimbursementRequestId);

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
   * @returns the edited reimbursement requests id
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
    submitter: User
  ) {
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
        saboId
      }
    });

    return updatedReimbursementRequest.reimbursementRequestId;
  }

  /**
   * Function to create a vendor in our database
   * @param name the name of the vendor
   * @returns the id of the created vendor
   */
  static async createVendor(name: string) {
    const vendor = await prisma.vendor.create({
      data: {
        name
      }
    });

    return vendor.vendorId;
  }
}
