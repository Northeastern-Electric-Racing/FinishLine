/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Reimbursement_Request, Reimbursement_Status_Type, User } from '@prisma/client';
import {
  ClubAccount,
  ExpenseType,
  ReimbursementProductCreateArgs,
  ReimbursementRequest,
  ReimbursementStatusType,
  Vendor,
  isAdmin,
  isGuest
} from 'shared';
import prisma from '../prisma/prisma';
import {
  ReimbursementReceiptCreateArgs,
  UserWithTeam,
  removeDeletedReceiptPictures,
  updateReimbursementProducts,
  validateReimbursementProducts,
  validateUserIsHeadOfFinanceTeam,
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
import { sendMailToAdvisor, uploadFile } from '../utils/google-integration.utils';
import reimbursementRequestQueryArgs from '../prisma-query-args/reimbursement-requests.query-args';
import {
  expenseTypeTransformer,
  reimbursementRequestTransformer,
  reimbursementStatusTransformer
} from '../transformers/reimbursement-requests.transformer';

export default class ReimbursementRequestService {
  /**
   * Returns all reimbursement requests in the database that are created by the given user.
   * @param recipient the user retrieving their reimbursement requests
   */
  static async getUserReimbursementRequests(recipient: User): Promise<ReimbursementRequest[]> {
    const userReimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: { dateDeleted: null, recipientId: recipient.userId },
      ...reimbursementRequestQueryArgs
    });
    return userReimbursementRequests.map(reimbursementRequestTransformer);
  }

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

    const validatedReimbursementProudcts = await validateReimbursementProducts(reimbursementProducts);

    const createdReimbursementRequest = await prisma.reimbursement_Request.create({
      data: {
        recipientId: recipient.userId,
        dateOfExpense,
        vendorId: vendor.vendorId,
        account,
        expenseTypeId: expenseType.expenseTypeId,
        totalCost,
        reimbursementStatuses: {
          create: {
            type: ReimbursementStatusType.PENDING_FINANCE,
            userId: recipient.userId
          }
        },
        reimbursementProducts: {
          createMany: {
            data: validatedReimbursementProudcts.map((reimbursementProductInfo) => {
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
   * @param receiptPictures the old receipts that haven't been deleted (new receipts must be separately uploaded)
   * @param submitter the person editing the reimbursement request
   * @returns the edited reimbursement request
   */
  static async editReimbursementRequest(
    requestId: string,
    dateOfExpense: Date,
    vendorId: string,
    account: ClubAccount,
    expenseTypeId: string,
    totalCost: number,
    reimbursementProducts: ReimbursementProductCreateArgs[],
    receiptPictures: ReimbursementReceiptCreateArgs[],
    submitter: User
  ): Promise<Reimbursement_Request> {
    const oldReimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId: requestId },
      include: {
        reimbursementProducts: true,
        receiptPictures: true
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
        vendorId
      }
    });

    //set any deleted receipts with a dateDeleted
    await removeDeletedReceiptPictures(receiptPictures, oldReimbursementRequest.receiptPictures || [], submitter);

    return updatedReimbursementRequest;
  }

  /**
   * Soft-deletes the given reimbursement request
   *
   * @param requestId the reimbursement request to be deleted
   * @param submitter the user deleting the reimbursement request
   */
  static async deleteReimbursementRequest(requestId: string, submitter: User): Promise<Reimbursement_Request> {
    const request = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId: requestId },
      include: {
        reimbursementStatuses: true
      }
    });

    if (!request) throw new NotFoundException('Reimbursement Request', requestId);
    if (request.recipientId !== submitter.userId)
      throw new AccessDeniedException(
        'You do not have access to delete this reimbursement request, only the creator can delete a reimbursement request'
      );
    if (request.dateDeleted) throw new DeletedException('Reimbursement Request', requestId);
    if (
      request.reimbursementStatuses.some(
        (reimbursementStatus) => reimbursementStatus.type === Reimbursement_Status_Type.SABO_SUBMITTED
      )
    )
      throw new AccessDeniedException('You cannot delete this reimbursement request. It has already been approved');

    const deletedRequest = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId: requestId },
      data: { dateDeleted: new Date() }
    });

    return deletedRequest;
  }

  /**
   * Returns all reimbursement requests that do not have an advisor approved reimbursement status.
   * @param requester the user requesting the reimbursement requests
   * @returns reimbursement requests with no advisor approved reimbursement status
   */
  static async getPendingAdvisorList(requester: User): Promise<ReimbursementRequest[]> {
    await validateUserIsHeadOfFinanceTeam(requester);

    const requestsPendingAdvisors = await prisma.reimbursement_Request.findMany({
      where: {
        saboId: { not: null },
        reimbursementStatuses: {
          some: {
            type: Reimbursement_Status_Type.SABO_SUBMITTED
          },
          none: {
            type: Reimbursement_Status_Type.ADVISOR_APPROVED
          }
        }
      },
      ...reimbursementRequestQueryArgs
    });

    return requestsPendingAdvisors.map(reimbursementRequestTransformer);
  }

  /**
   * sends the pending advisor reimbursements to the advisor
   * @param sender the person sending the pending advisor list
   * @param saboNumbers the sabo numbers of the reimbursement requests to send
   */
  static async sendPendingAdvisorList(sender: UserWithTeam, saboNumbers: number[]) {
    await validateUserIsHeadOfFinanceTeam(sender);

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
   * Service function to upload a picture to the receipts folder in the NER google drive
   * @param reimbursementRequestId id for the reimbursement request we're tying the receipt to
   * @param file The file data for the image
   * @param submitter user who is uploading the receipt
   * @returns the google drive id for the file
   */
  static async uploadReceipt(reimbursementRequestId: string, file: Express.Multer.File, submitter: User) {
    if (isGuest(submitter.role)) throw new AccessDeniedGuestException('Guests cannot upload receipts');

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);

    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }

    if (reimbursementRequest.recipientId !== submitter.userId) {
      throw new AccessDeniedException(
        'You do not have access to upload a receipt for this reimbursement request, only the creator can edit a reimbursement request'
      );
    }

    const imageData = await uploadFile(file);

    if (!imageData.name) {
      throw new HttpException(500, 'Image Name not found');
    }

    const receipt = await prisma.receipt.create({
      data: {
        googleFileId: imageData.id,
        name: imageData.name,
        reimbursementRequestId,
        createdByUserId: submitter.userId
      }
    });

    return receipt;
  }

  /**
   * Gets all the expense types in the database
   * @returns all the expense types in the database
   */
  static async getAllExpenseTypes(): Promise<ExpenseType[]> {
    const expenseTypes = await prisma.expense_Type.findMany();
    return expenseTypes.map(expenseTypeTransformer);
  }

  /**
   * Gets all the reimbursement requests from the database that have no dateDeleted
   * @param user the user getting the reimbursement requests
   * @returns an array of the prisma version of the reimbursement requests transformed to the shared version
   */
  static async getAllReimbursementRequests(user: UserWithTeam): Promise<ReimbursementRequest[]> {
    await validateUserIsPartOfFinanceTeam(user);

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: { dateDeleted: null },
      ...reimbursementRequestQueryArgs
    });

    return reimbursementRequests.map(reimbursementRequestTransformer);
  }

  /**
   * Service function to mark a reimbursement request as delivered
   * @param submitter is the User marking the request as delivered
   * @param requestId is the ID of the reimbursement request to be marked as delivered
   * @throws NotFoundException if the id is invalid or not there
   * @throws AccessDeniedException if the creator of the request is not the submitter
   * @returns the updated reimbursement request
   */
  static async markReimbursementRequestAsDelivered(submitter: User, reimbursementRequestId: string) {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);

    if (reimbursementRequest.dateDelivered) throw new AccessDeniedException('Can only be marked as delivered once');

    if (submitter.userId !== reimbursementRequest.recipientId)
      throw new AccessDeniedException('Only the creator of the reimbursement request can mark as delivered');

    const reimbursementRequestDelivered = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId },
      data: {
        dateDelivered: new Date()
      }
    });

    return reimbursementRequestDelivered;
  }

  /**
   * Gets a single reimbursement request for the given id
   * @param user the user getting the reimbursement request
   * @param reimbursementRequestId the id of thereimbursement request to get
   * @returns the reimbursement request with the given id
   */
  static async getSingleReimbursementRequest(
    user: UserWithTeam,
    reimbursementRequestId: string
  ): Promise<ReimbursementRequest> {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      ...reimbursementRequestQueryArgs
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);

    if (reimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', reimbursementRequestId);

    try {
      await validateUserIsPartOfFinanceTeam(user);
    } catch {
      if (user.userId !== reimbursementRequest.recipientId)
        throw new AccessDeniedException('You do not have access to this reimbursement request');
    }

    return reimbursementRequestTransformer(reimbursementRequest);
  }

  /**
   * Adds a reimbursement status with type sabo submitted to the given reimbursement request
   *
   * @param reimbursementRequestId the id of the reimbursement request to approve
   * @param submitter the user who is approving the reimbursement request
   * @returns the created reimbursment status
   */
  static async approveReimbursementRequest(reimbursementRequestId: string, submitter: UserWithTeam) {
    await validateUserIsPartOfFinanceTeam(submitter);

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      include: {
        reimbursementStatuses: true
      }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);

    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }

    if (
      reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.SABO_SUBMITTED)
    ) {
      throw new HttpException(400, 'This reimbursement request has already been approved');
    }

    const reimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        type: ReimbursementStatusType.SABO_SUBMITTED,
        userId: submitter.userId,
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      },
      include: {
        user: true
      }
    });

    return reimbursementStatusTransformer(reimbursementStatus);
  }
}
