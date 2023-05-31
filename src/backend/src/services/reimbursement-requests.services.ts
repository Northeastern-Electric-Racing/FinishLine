/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Club_Accounts, Reimbursement_Request, Reimbursement_Status_Type, User } from '@prisma/client';
import { ClubAccount, ReimbursementRequest, Vendor, isAdmin, isGuest } from 'shared';
import prisma from '../prisma/prisma';
import {
  ReimbursementProductCreateArgs,
  UserWithTeam,
  updateReimbursementProducts,
  validateReimbursementProducts,
  validateUserIsPartOfFinanceTeam
} from '../utils/reimbursement-requests.utils';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../utils/errors.utils';
import vendorTransformer from '../transformers/vendor.transformer';
import sendMailToAdvisor from '../utils/transporter.utils';
import reimbursementRequestQueryArgs from '../prisma-query-args/reimbursement-requests.query-args';
import reimbursementRequestTransformer from '../transformers/reimbursement-requests.transformer';

export default class ReimbursementRequestService {
  /**
   * Get all the vendors in the database.
   * @returns all the vendors
   */
  static async getAllVendors(): Promise<Vendor[]> {
    const vendors = await prisma.vendor.findMany();
    return vendors.map(vendorTransformer);
  }

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
    account: ClubAccount,
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
        recipientId: recipient.userId,
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
   * @param requestId the id of the reimbursement request we are editing
   * @param dateOfExpense the updated date of expense
   * @param vendorId the updated vendor id
   * @param account the updated account
   * @param expenseTypeId the updated expense type id
   * @param totalCost the updated total cost
   * @param reimbursementProducts the updated reimbursement products
   * @param saboId the updated saboId
   * @param receiptPictures the updated receipt pictures
   * @param submitter the person editing the reimbursement request
   * @returns the edited reimbursement request
   */
  static async editReimbursementRequest(
    requestId: string,
    dateOfExpense: Date,
    vendorId: string,
    account: Club_Accounts,
    expenseTypeId: string,
    totalCost: number,
    reimbursementProducts: ReimbursementProductCreateArgs[],
    receiptPictures: string[],
    submitter: User
  ): Promise<Reimbursement_Request> {
    const oldReimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId: requestId },
      include: {
        reimbursementProducts: true
      }
    });

    if (!oldReimbursementRequest) throw new NotFoundException('Reimbursement Request', requestId);
    if (oldReimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', requestId);
    if (oldReimbursementRequest.recipientId !== submitter.userId)
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
        receiptPictures
      }
    });

    return updatedReimbursementRequest;
  }

  /**
   * sends the pending advisor reimbursements to the advisor
   * @param sender the person sending the pending advisor list
   * @param saboNumbers the sabo numbers of the reimbursement requests to send
   */
  static async sendPendingAdvisorList(sender: UserWithTeam, saboNumbers: number[]) {
    await validateUserIsPartOfFinanceTeam(sender);

    if (saboNumbers.length === 0) throw new HttpException(400, 'Need to send at least one Sabo #!');

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        saboId: {
          in: saboNumbers
        }
      }
    });

    if (reimbursementRequests.length < saboNumbers.length) {
      const saboNumbersNotFound = saboNumbers.filter((saboNumber) => {
        return !reimbursementRequests.some((reimbursementRequest) => reimbursementRequest.saboId === saboNumber);
      });
      throw new HttpException(400, `The following sabo numbers do not exist: ${saboNumbersNotFound.join(', ')}`);
    }

    const deletedReimbursementRequests = reimbursementRequests.filter(
      (reimbursementRequest) => reimbursementRequest.dateDeleted
    );

    if (deletedReimbursementRequests.length > 0) {
      const saboNumbersDeleted = deletedReimbursementRequests.map((reimbursementRequest) => reimbursementRequest.saboId);
      throw new HttpException(
        400,
        `The following reimbursement requests with these sabo numbers have been deleted: ${saboNumbersDeleted.join(', ')}`
      );
    }

    const mailOptions = {
      subject: 'Reimbursement Requests To Be Approved By Advisor',
      text: `The following reimbursement requests need to be approved by you: ${saboNumbers.join(', ')}`
    };

    await sendMailToAdvisor(mailOptions.subject, mailOptions.text);

    reimbursementRequests.forEach((reimbursementRequest) => {
      prisma.reimbursement_Status.create({
        data: {
          type: Reimbursement_Status_Type.ADVISOR_APPROVED,
          userId: sender.userId,
          reimbursementRequestId: reimbursementRequest.reimbursementRequestId
        }
      });
    });
  }

  /**
   * Sets the given reimbursement request with the given sabo number
   *
   * @param reimbursementRequestId The id of the reimbursement request to add the sabo number to
   * @param saboNumber the sabo number you are adding to the reimbursement request
   * @param submitter the person adding the sabo number
   * @returns the reimbursement request with the sabo number
   */
  static async setSaboNumber(reimbursementRequestId: string, saboNumber: number, submitter: UserWithTeam) {
    await validateUserIsPartOfFinanceTeam(submitter);

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);

    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }

    const reimbursementRequestWithSaboNumber = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId },
      data: {
        saboId: saboNumber
      }
    });

    return reimbursementRequestWithSaboNumber;
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
