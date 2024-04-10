/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Multer } from 'multer';
import { Club_Accounts, Reimbursement_Request, Reimbursement_Status_Type, User } from '@prisma/client';
import {
  ClubAccount,
  ExpenseType,
  Reimbursement,
  ReimbursementReceiptCreateArgs,
  ReimbursementRequest,
  ReimbursementStatusType,
  Vendor,
  isAdmin,
  isGuest,
  isHead,
  WbsReimbursementProductCreateArgs,
  OtherReimbursementProductCreateArgs
} from 'shared';
import prisma from '../prisma/prisma';
import {
  isUserAdminOrOnFinance,
  createReimbursementProducts,
  isUserLeadOrHeadOfFinanceTeam,
  removeDeletedReceiptPictures,
  updateReimbursementProducts,
  validateReimbursementProducts,
  validateUserEditRRPermissions,
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
import { downloadImageFile, sendMailToAdvisor, uploadFile } from '../utils/google-integration.utils';
import reimbursementRequestQueryArgs from '../prisma-query-args/reimbursement-requests.query-args';
import {
  expenseTypeTransformer,
  reimbursementRequestTransformer,
  reimbursementStatusTransformer,
  reimbursementTransformer,
  vendorTransformer
} from '../transformers/reimbursement-requests.transformer';
import reimbursementQueryArgs from '../prisma-query-args/reimbursement.query-args';
import { UserWithSecureSettings } from '../utils/auth.utils';
import { sendReimbursementRequestDeniedNotification } from '../utils/slack.utils';

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
   * Returns all reimbursements in the database that are created by the given user
   * @param user ther user retrieving the reimbursements
   * @returns all reimbursements for the given user
   */
  static async getUserReimbursements(user: User): Promise<Reimbursement[]> {
    const userReimbursements = await prisma.reimbursement.findMany({
      where: { userSubmittedId: user.userId },
      ...reimbursementQueryArgs
    });
    return userReimbursements.map(reimbursementTransformer);
  }

  /**
   * Returns all the reimbursements in the database
   * @param user the user retrieving all the reimbursements
   * @returns all the reimbursements in the database
   */
  static async getAllReimbursements(user: User): Promise<Reimbursement[]> {
    await isUserAdminOrOnFinance(user);

    const reimbursements = await prisma.reimbursement.findMany({ ...reimbursementQueryArgs });
    return reimbursements.map(reimbursementTransformer);
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
    recipient: UserWithSecureSettings,
    dateOfExpense: Date,
    vendorId: string,
    account: ClubAccount,
    otherReimbursementProducts: OtherReimbursementProductCreateArgs[],
    wbsReimbursementProducts: WbsReimbursementProductCreateArgs[],
    expenseTypeId: string,
    totalCost: number
  ): Promise<Reimbursement_Request> {
    if (isGuest(recipient.role)) throw new AccessDeniedGuestException('Guests cannot create a reimbursement request');

    if (!recipient.userSecureSettings) throw new HttpException(500, 'User does not have their finance settings set up');

    const vendor = await prisma.vendor.findUnique({
      where: { vendorId }
    });

    if (!vendor) throw new NotFoundException('Vendor', vendorId);

    const expenseType = await prisma.expense_Type.findUnique({
      where: { expenseTypeId }
    });

    if (!expenseType) throw new NotFoundException('Expense Type', expenseTypeId);

    if (!expenseType.allowed) throw new HttpException(400, `The expense type ${expenseType.name} is not allowed!`);

    if (!expenseType.allowedRefundSources.includes(account)) {
      throw new HttpException(400, 'The submitted refund source is not allowed to be used with the submitted expense type');
    }

    const validatedReimbursementProducts = await validateReimbursementProducts(
      otherReimbursementProducts,
      wbsReimbursementProducts
    );

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
        }
      }
    });

    await createReimbursementProducts(
      validatedReimbursementProducts.validatedOtherReimbursementProducts,
      validatedReimbursementProducts.validatedWbsReimbursementProducts,
      createdReimbursementRequest.reimbursementRequestId
    );

    return createdReimbursementRequest;
  }

  /**
   * Function to reimburse a user for their expenses.
   *
   * @param amount the amount to be reimbursed
   * @param dateReceived the date the amount was received
   * @param submitter the person performing the reimbursement
   * @returns the created reimbursement
   */
  static async reimburseUser(amount: number, dateReceived: string, submitter: User): Promise<Reimbursement> {
    if (isGuest(submitter.role)) {
      throw new AccessDeniedException('Guests cannot reimburse a user for their expenses.');
    }

    const totalOwed = await prisma.reimbursement_Request
      .findMany({
        where: { recipientId: submitter.userId, dateDeleted: null }
      })
      .then((userReimbursementRequests: Reimbursement_Request[]) => {
        return userReimbursementRequests.reduce((acc: number, curr: Reimbursement_Request) => acc + curr.totalCost, 0);
      });

    const totalReimbursed = await prisma.reimbursement
      .findMany({
        where: { purchaserId: submitter.userId },
        select: { amount: true }
      })
      .then((reimbursements: { amount: number }[]) =>
        reimbursements.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0)
      );

    if (amount > totalOwed - totalReimbursed) {
      throw new HttpException(400, 'Reimbursement is greater than the total amount owed to the user');
    }

    // make the date object but add 12 hours so that the time isn't 00:00 to avoid timezone problems
    const dateCreated = new Date(dateReceived.split('T')[0]);
    dateCreated.setTime(dateCreated.getTime() + 12 * 60 * 60 * 1000);

    const newReimbursement = await prisma.reimbursement.create({
      data: {
        purchaserId: submitter.userId,
        amount,
        dateCreated: dateReceived,
        userSubmittedId: submitter.userId
      },
      ...reimbursementQueryArgs
    });

    return reimbursementTransformer(newReimbursement);
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
    otherReimbursementProducts: OtherReimbursementProductCreateArgs[],
    wbsReimbursementProducts: WbsReimbursementProductCreateArgs[],
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
    await validateUserEditRRPermissions(submitter, oldReimbursementRequest);

    const vendor = await prisma.vendor.findUnique({
      where: { vendorId }
    });

    if (!vendor) throw new NotFoundException('Vendor', vendorId);

    const expenseType = await prisma.expense_Type.findUnique({
      where: { expenseTypeId }
    });

    if (!expenseType) throw new NotFoundException('Expense Type', expenseTypeId);
    if (!expenseType.allowed) throw new HttpException(400, 'Expense Type Not Allowed');
    if (!expenseType.allowedRefundSources.includes(account)) {
      throw new HttpException(400, 'The submitted refund source is not allowed to be used with the submitted expense type');
    }

    await updateReimbursementProducts(
      oldReimbursementRequest.reimbursementProducts,
      otherReimbursementProducts,
      wbsReimbursementProducts,
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

  static async editReimbursement(reimbursementId: string, editor: User, amount: number, dateCreated: Date) {
    const request = await prisma.reimbursement.findUnique({
      where: { reimbursementId }
    });

    if (!request) throw new NotFoundException('Reimbursement', reimbursementId);
    if (request.userSubmittedId !== editor.userId)
      throw new AccessDeniedException(
        'You do not have access to edit this refund, only the submitter can edit their refund'
      );

    const updatedReimbursement = await prisma.reimbursement.update({
      where: { reimbursementId },
      data: { dateCreated, amount }
    });

    return updatedReimbursement;
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
    await validateUserIsPartOfFinanceTeam(requester);

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
  static async sendPendingAdvisorList(sender: User, saboNumbers: number[]) {
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
  static async setSaboNumber(reimbursementRequestId: string, saboNumber: number, submitter: User) {
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
    const failedAuthorizationException = new AccessDeniedException(
      'Only admins, finance leads, and finance heads can create vendors.'
    );

    const existingVendor = await prisma.vendor.findUnique({
      where: { name }
    });

    if (existingVendor != null) throw new HttpException(400, 'This vendor already exists');

    const isAuthorized = isAdmin(submitter.role) || (await isUserLeadOrHeadOfFinanceTeam(submitter));
    if (!isAuthorized) throw failedAuthorizationException;

    const vendor = await prisma.vendor.create({
      data: {
        name
      }
    });

    return vendor;
  }

  /**
   * Service function to create an expense type in our database
   * @param submitter user who is creating the expense type
   * @param name The name of the expense type
   * @param code the expense type's SABO code
   * @param allowed whether or not this expense type is allowed
   * @param allowedRefundSources an array of Club_Accounts representing allowed refund sources
   * @returns the created expense type
   */
  static async createExpenseType(
    submitter: User,
    name: string,
    code: number,
    allowed: boolean,
    allowedRefundSources: Club_Accounts[]
  ) {
    if (!isAdmin(submitter.role)) throw new AccessDeniedAdminOnlyException('create expense types');
    const expense = await prisma.expense_Type.create({
      data: {
        name,
        allowed,
        code,
        allowedRefundSources
      }
    });

    return expense;
  }

  /**
   * Edits an expense type
   * @param expenseTypeId the requested expense type to be edited
   * @param code the new expense type code number
   * @param name the new expense type code name
   * @param allowed the new expense type allowed value
   * @param submitter the person editing expense type code number
   * @returns the updated expense type
   */
  static async editExpenseType(
    expenseTypeId: string,
    code: number,
    name: string,
    allowed: boolean,
    submitter: User,
    allowedRefundSources: Club_Accounts[]
  ) {
    if (!isHead(submitter.role))
      throw new AccessDeniedException('Only the head or admin can update account code number and name');

    const expenseType = await prisma.expense_Type.findUnique({
      where: { expenseTypeId }
    });

    if (!expenseType) throw new NotFoundException('Expense Type', expenseTypeId);

    const expenseTypeUpdated = await prisma.expense_Type.update({
      where: { expenseTypeId },
      data: {
        name,
        code,
        allowed,
        allowedRefundSources
      }
    });

    return expenseTypeUpdated;
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

    if (!imageData?.name) {
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
  static async getAllReimbursementRequests(user: User): Promise<ReimbursementRequest[]> {
    await isUserAdminOrOnFinance(user);

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
   * Adds a reimbursement status with type reimbursed to the given reimbursement request
   *
   * @param reimbursementRequestId the id of the reimbursement request to mark reimbursed
   * @param submitter the user who is marking the reimbursement request as reimbursed
   * @throws AccessDeniedException if the submitter of the request is not on the finance team
   * @throws HttpException if the finance team does not exist
   * @throws NotFoundException if the id is invalid or not there
   * @throws HttpException if the reimbursement request is already marked as reimbursed or has been denied
   * @returns the created reimbursment status
   */
  static async markReimbursementRequestAsReimbursed(reimbursementRequestId: string, submitter: User) {
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

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.REIMBURSED)) {
      throw new HttpException(400, 'This reimbursement request has already been marked as reimbursed');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
    }

    const reimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        type: ReimbursementStatusType.REIMBURSED,
        userId: submitter.userId,
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      },
      include: {
        user: true
      }
    });

    return reimbursementStatusTransformer(reimbursementStatus);
  }

  /**
   * Gets a single reimbursement request for the given id
   * @param user the user getting the reimbursement request
   * @param reimbursementRequestId the id of thereimbursement request to get
   * @returns the reimbursement request with the given id
   */
  static async getSingleReimbursementRequest(user: User, reimbursementRequestId: string): Promise<ReimbursementRequest> {
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
  static async approveReimbursementRequest(reimbursementRequestId: string, submitter: User) {
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

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
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

  /**
   * Adds a reimbursement status with type denied to the given reimbursement request
   *
   * @param reimbursementRequestId the id of the reimbursement request to deny
   * @param submitter the user who is denying the reimbursement request
   * @returns the created reimbursment status
   */
  static async denyReimbursementRequest(reimbursementRequestId: string, submitter: User) {
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

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.REIMBURSED)) {
      throw new HttpException(400, 'This reimbursement request has already been reimbursed');
    }

    const reimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        type: ReimbursementStatusType.DENIED,
        userId: submitter.userId,
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      },
      include: {
        user: true
      }
    });

    const recipientSettings = await prisma.user_Settings.findUnique({
      where: { userId: reimbursementRequest.recipientId }
    });

    if (!recipientSettings) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);

    await sendReimbursementRequestDeniedNotification(recipientSettings.slackId, reimbursementRequestId);

    return reimbursementStatusTransformer(reimbursementStatus);
  }

  /**
   * Downloads the receipt image file with the given google file id
   *
   * @param fileId the google file id of the receipt image
   * @param submitter the user who is downloading the receipt image
   * @returns a buffer of the image data and the image type
   */
  static async downloadReceiptImage(fileId: string, submitter: User) {
    await validateUserIsPartOfFinanceTeam(submitter);

    const fileData = await downloadImageFile(fileId);

    if (!fileData) throw new NotFoundException('Image File', fileId);
    return fileData;
  }

  /**
   * Edits the vendor name
   *
   * @param name the new vendor name
   * @param vendorId the requested vendor to be edited
   * @param submitter the user editing the vendor name
   * @returns the updated vendor
   */
  static async editVendors(name: string, vendorId: string, submitter: User) {
    await isUserAdminOrOnFinance(submitter);

    const vendorUniqueName = await prisma.vendor.findUnique({
      where: { name }
    });

    if (!!vendorUniqueName) throw new HttpException(400, 'vendor name already exists');

    const vendor = await prisma.vendor.update({
      where: { vendorId },
      data: { name }
    });

    return vendorTransformer(vendor);
  }

  /**
   * Deletes the vendor
   *
   * @param vendorId the requested vendor to be deleted
   * @param submitter the user deleting the vendor
   * @returns the 'deleted' vendor
   */
  static async deleteVendor(vendorId: string, submitter: User) {
    await isUserAdminOrOnFinance(submitter);

    const vendorDelete = await prisma.vendor.findUnique({
      where: { vendorId }
    });

    if (!vendorDelete) throw new NotFoundException('Vendor', vendorId);

    if (vendorDelete.dateDeleted) throw new DeletedException('Vendor', vendorId);

    const vendor = await prisma.vendor.update({
      where: { vendorId },
      data: { dateDeleted: new Date() }
    });

    return vendorTransformer(vendor);
  }
}
