/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Reimbursement_Request, Reimbursement_Status_Type, User } from '@prisma/client';
import { Club_Account, isAdmin, isGuest } from 'shared';
import prisma from '../prisma/prisma';
import {
  ReimbursementProductCreateArgs,
  UserWithTeam,
  validateReimbursementProducts,
  validateUserIsPartOfFinanceTeam
} from '../utils/reimbursement-requests.utils';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../utils/errors.utils';
import sendMailToAdvisor from '../utils/transporter.utils';

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
}
