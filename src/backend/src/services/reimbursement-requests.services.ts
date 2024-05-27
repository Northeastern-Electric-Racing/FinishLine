/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Multer } from 'multer';
import { Club_Accounts, Reimbursement_Request, Reimbursement_Status_Type, User } from '@prisma/client';
import {
  ClubAccount,
  Reimbursement,
  ReimbursementReceiptCreateArgs,
  ReimbursementRequest,
  ReimbursementStatusType,
  Vendor,
  isAdmin,
  isGuest,
  isHead,
  WbsReimbursementProductCreateArgs,
  OtherReimbursementProductCreateArgs,
  AccountCode
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
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import { downloadImageFile, sendMailToAdvisor, uploadFile } from '../utils/google-integration.utils';
import {
  accountCodeTransformer,
  reimbursementRequestTransformer,
  reimbursementStatusTransformer,
  reimbursementTransformer,
  vendorTransformer
} from '../transformers/reimbursement-requests.transformer';
import { UserWithSecureSettings } from '../utils/auth.utils';
import {
  sendReimbursementRequestCreatedNotification,
  sendReimbursementRequestDeniedNotification
} from '../utils/slack.utils';
import { userHasPermission } from '../utils/users.utils';
import { getReimbursementRequestQueryArgs } from '../prisma-query-args/reimbursement-requests.query-args';
import { getReimbursementQueryArgs } from '../prisma-query-args/reimbursement.query-args';
import { getReimbursementStatusQueryArgs } from '../prisma-query-args/reimbursement-statuses.query-args';
import { reactToMessage } from '../integrations/slack';

export default class ReimbursementRequestService {
  /**
   * Returns all reimbursement requests in the database that are created by the given user and for the currently selected organization.
   * @param recipient The user retrieving their reimbursement requests
   * @param organizationId The organization the user is currently in
   */
  static async getUserReimbursementRequests(recipient: User, organizationId: string): Promise<ReimbursementRequest[]> {
    const userReimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: { dateDeleted: null, recipientId: recipient.userId, organizationId },
      ...getReimbursementRequestQueryArgs(organizationId)
    });
    return userReimbursementRequests.map(reimbursementRequestTransformer);
  }

  /**
   * Returns all reimbursements in the database that are created by the given user and for the currently selected organization.
   * @param user ther user retrieving the reimbursements
   * @param organizationId the organization the user is currently in
   * @returns all reimbursements for the given user
   */
  static async getUserReimbursements(user: User, organizationId: string): Promise<Reimbursement[]> {
    const userReimbursements = await prisma.reimbursement.findMany({
      where: { userSubmittedId: user.userId, organizationId },
      ...getReimbursementQueryArgs(organizationId)
    });
    return userReimbursements.map(reimbursementTransformer);
  }

  /**
   * Returns all the reimbursements in the database
   * @param user The user retrieving all the reimbursements
   * @param organizationId The organization the user is currently in
   * @returns All the reimbursements in the database
   */
  static async getAllReimbursements(user: User, organizationId: string): Promise<Reimbursement[]> {
    await isUserAdminOrOnFinance(user, organizationId);

    const reimbursements = await prisma.reimbursement.findMany({
      where: {
        organizationId
      },
      ...getReimbursementQueryArgs(organizationId)
    });

    return reimbursements.map(reimbursementTransformer);
  }

  /**
   * Get all the vendors in the database.
   * @param organizationId The organization the user is currently in
   * @returns All the non-deleted vendors
   */
  static async getAllVendors(organizationId: string): Promise<Vendor[]> {
    const vendors = await prisma.vendor.findMany({ where: { dateDeleted: null, organizationId } });
    return vendors.map(vendorTransformer);
  }

  /**
   * Creates a reimbursement request in the database
   * @param recipient the user who is creating the reimbursement request
   * @param dateOfExpense the date that the expense occured
   * @param vendorId the id of the vendor that the expense was made for
   * @param account the account to be reimbursed from
   * @param reimbursementProducts the products that the user bought
   * @param accountCodeId the id of the account code the user made
   * @param totalCost the total cost of the reimbursement with tax
   * @param organizationId the organization the user is currently in
   * @returns the created reimbursement request
   */
  static async createReimbursementRequest(
    recipient: UserWithSecureSettings,
    dateOfExpense: Date,
    vendorId: string,
    account: ClubAccount,
    otherReimbursementProducts: OtherReimbursementProductCreateArgs[],
    wbsReimbursementProducts: WbsReimbursementProductCreateArgs[],
    acccountCodeId: string,
    totalCost: number,
    organizationId: string
  ): Promise<Reimbursement_Request> {
    if (await userHasPermission(recipient.userId, organizationId, isGuest))
      throw new AccessDeniedGuestException('Guests cannot create a reimbursement request');

    if (!recipient.userSecureSettings) throw new HttpException(500, 'User does not have their finance settings set up');

    const vendor = await ReimbursementRequestService.getSingleVendor(vendorId, organizationId);
    const accountCode = await ReimbursementRequestService.getSingleAccountCode(acccountCodeId, organizationId);

    if (!accountCode.allowed) throw new HttpException(400, `The Account Code ${accountCode.name} is not allowed!`);
    if (!accountCode.allowedRefundSources.includes(account)) {
      throw new HttpException(400, 'The submitted refund source is not allowed to be used with the submitted Account Code');
    }

    const validatedReimbursementProducts = await validateReimbursementProducts(
      otherReimbursementProducts,
      wbsReimbursementProducts,
      organizationId
    );

    const numReimbursementRequests = await prisma.reimbursement_Request.count({
      where: { organizationId }
    });

    const createdReimbursementRequest = await prisma.reimbursement_Request.create({
      data: {
        recipient: { connect: { userId: recipient.userId } },
        dateOfExpense,
        vendor: { connect: { vendorId: vendor.vendorId } },
        account,
        accountCode: { connect: { accountCodeId: accountCode.accountCodeId } },
        totalCost,
        reimbursementStatuses: {
          create: {
            type: ReimbursementStatusType.PENDING_FINANCE,
            userId: recipient.userId
          }
        },
        identifier: numReimbursementRequests + 1,
        organization: { connect: { organizationId } }
      }
    });

    await sendReimbursementRequestCreatedNotification(createdReimbursementRequest.reimbursementRequestId, recipient.userId);

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
   * @param organizationId the organization the user is currently in
   * @returns the created reimbursement
   */
  static async reimburseUser(
    amount: number,
    dateReceived: string,
    submitter: User,
    organizationId: string
  ): Promise<Reimbursement> {
    if (await userHasPermission(submitter.userId, organizationId, isGuest)) {
      throw new AccessDeniedException('Guests cannot reimburse a user for their expenses.');
    }

    const totalOwed = await prisma.reimbursement_Request
      .findMany({
        where: { recipientId: submitter.userId, dateDeleted: null, accountCode: { organizationId } }
      })
      .then((userReimbursementRequests: Reimbursement_Request[]) => {
        return userReimbursementRequests.reduce((acc: number, curr: Reimbursement_Request) => acc + curr.totalCost, 0);
      });

    const totalReimbursed = await prisma.reimbursement
      .findMany({
        where: { purchaserId: submitter.userId, organizationId },
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
        userSubmittedId: submitter.userId,
        organizationId
      },
      ...getReimbursementQueryArgs(organizationId)
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
   * @param accountCodeId the updated account code id
   * @param totalCost the updated total cost
   * @param reimbursementProducts the updated reimbursement products
   * @param saboId the updated saboId
   * @param receiptPictures the old receipts that haven't been deleted (new receipts must be separately uploaded)
   * @param submitter the person editing the reimbursement request
   * @param organizationId the organization the user is currently in
   * @returns the edited reimbursement request
   */
  static async editReimbursementRequest(
    requestId: string,
    dateOfExpense: Date,
    vendorId: string,
    account: ClubAccount,
    accountCodeId: string,
    totalCost: number,
    otherReimbursementProducts: OtherReimbursementProductCreateArgs[],
    wbsReimbursementProducts: WbsReimbursementProductCreateArgs[],
    receiptPictures: ReimbursementReceiptCreateArgs[],
    submitter: User,
    organizationId: string
  ): Promise<Reimbursement_Request> {
    const oldReimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId: requestId },
      include: {
        reimbursementProducts: true,
        receiptPictures: true,
        accountCode: true
      }
    });

    if (!oldReimbursementRequest) throw new NotFoundException('Reimbursement Request', requestId);
    if (oldReimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', requestId);
    if (oldReimbursementRequest.organizationId !== organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    await validateUserEditRRPermissions(submitter, oldReimbursementRequest, organizationId);

    const vendor = await ReimbursementRequestService.getSingleVendor(vendorId, organizationId);
    const accountCode = await ReimbursementRequestService.getSingleAccountCode(accountCodeId, organizationId);

    if (!accountCode.allowed) throw new HttpException(400, 'Account Code Not Allowed');
    if (!accountCode.allowedRefundSources.includes(account)) {
      throw new HttpException(400, 'The submitted refund source is not allowed to be used with the submitted Account Code');
    }

    await updateReimbursementProducts(
      oldReimbursementRequest.reimbursementProducts,
      otherReimbursementProducts,
      wbsReimbursementProducts,
      oldReimbursementRequest.reimbursementRequestId,
      organizationId
    );

    const updatedReimbursementRequest = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId: oldReimbursementRequest.reimbursementRequestId },
      data: {
        dateOfExpense,
        account,
        totalCost,
        accountCodeId: accountCode.accountCodeId,
        vendorId: vendor.vendorId
      }
    });

    //set any deleted receipts with a dateDeleted
    await removeDeletedReceiptPictures(receiptPictures, oldReimbursementRequest.receiptPictures || [], submitter);

    return updatedReimbursementRequest;
  }

  /**
   * Edits the given reimbursement
   * @param reimbursementId The id of the reimbursement to be edited
   * @param editor The user editing the reimbursement
   * @param amount The new amount of the reimbursement
   * @param dateCreated The new date the reimbursement was created
   * @param organizationId The organization the user is currently in
   * @returns The updatd reimbursement
   */
  static async editReimbursement(
    reimbursementId: string,
    editor: User,
    amount: number,
    dateCreated: Date,
    organizationId: string
  ) {
    const request = await prisma.reimbursement.findUnique({
      where: { reimbursementId }
    });

    if (!request) throw new NotFoundException('Reimbursement', reimbursementId);
    if (request.userSubmittedId !== editor.userId)
      throw new AccessDeniedException(
        'You do not have access to edit this refund, only the submitter can edit their refund'
      );
    if (request.organizationId !== organizationId) throw new InvalidOrganizationException('Reimbursement');

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
   * @param organizationId the organization the user is currently in
   */
  static async deleteReimbursementRequest(
    requestId: string,
    submitter: User,
    organizationId: string
  ): Promise<Reimbursement_Request> {
    const request = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId: requestId },
      include: {
        reimbursementStatuses: true
      }
    });

    if (!request) throw new NotFoundException('Reimbursement Request', requestId);
    if (request.organizationId !== organizationId) throw new InvalidOrganizationException('Reimbursement Request');
    if (request.dateDeleted) throw new DeletedException('Reimbursement Request', requestId);
    if (
      request.reimbursementStatuses.some(
        (reimbursementStatus) => reimbursementStatus.type === Reimbursement_Status_Type.SABO_SUBMITTED
      )
    )
      throw new AccessDeniedException('You cannot delete this reimbursement request. It has already been approved');

    if (request.recipientId !== submitter.userId && !(await isUserLeadOrHeadOfFinanceTeam(submitter, organizationId)))
      throw new AccessDeniedException(
        'You do not have access to delete this reimbursement request, reimbursement requests can only be deleted by their creator or finance leads and above'
      );

    const deletedRequest = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId: requestId },
      data: { dateDeleted: new Date() }
    });

    return deletedRequest;
  }

  /**
   * Returns all reimbursement requests that do not have an advisor approved reimbursement status.
   * @param requester the user requesting the reimbursement requests
   * @param organizationId the organization the user is currently in
   * @returns reimbursement requests with no advisor approved reimbursement status
   */
  static async getPendingAdvisorList(requester: User, organizationId: string): Promise<ReimbursementRequest[]> {
    await validateUserIsPartOfFinanceTeam(requester, organizationId);

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
        },
        accountCode: { organizationId }
      },
      ...getReimbursementRequestQueryArgs(organizationId)
    });

    return requestsPendingAdvisors.map(reimbursementRequestTransformer);
  }

  /**
   * sends the pending advisor reimbursements to the advisor
   * @param sender the person sending the pending advisor list
   * @param saboNumbers the sabo numbers of the reimbursement requests to send
   * @param organizationId the organization the user is currently in
   */
  static async sendPendingAdvisorList(sender: User, saboNumbers: number[], organizationId: string) {
    await validateUserIsPartOfFinanceTeam(sender, organizationId);

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

    const reimbursementRequestsNotInOrganization = reimbursementRequests.filter(
      (reimbursementRequest) => reimbursementRequest.organizationId !== organizationId
    );
    if (reimbursementRequestsNotInOrganization.length > 0) throw new InvalidOrganizationException('Reimbursement Request');

    const mailOptions = {
      subject: 'Reimbursement Requests To Be Approved By Advisor',
      text: `The following reimbursement requests need to be approved by you: ${saboNumbers.join(', ')}`
    };

    await sendMailToAdvisor(mailOptions.subject, mailOptions.text);


    const processReimbursementRequests = async () => {
      for (const reimbursementRequest of reimbursementRequests) {
        await prisma.reimbursement_Status.create({
          data: {
            type: Reimbursement_Status_Type.ADVISOR_APPROVED,
            userId: sender.userId,
            reimbursementRequestId: reimbursementRequest.reimbursementRequestId
          }
        });

        const notification = await prisma.message_Info.findFirst({
          where: {
            reimbursementRequestId: reimbursementRequest.reimbursementRequestId
          }
        });

        if (notification) {
          await reactToMessage(notification.channelId, notification.timestamp, 'thumbs_up');
        }
      }
    };

    await processReimbursementRequests();
  }
  /**
   * Sets the given reimbursement request with the given sabo number
   *
   * @param reimbursementRequestId The id of the reimbursement request to add the sabo number to
   * @param saboNumber the sabo number you are adding to the reimbursement request
   * @param submitter the person adding the sabo number
   * @param organizationId the organization the user is currently in
   * @returns the reimbursement request with the sabo number
   */
  static async setSaboNumber(reimbursementRequestId: string, saboNumber: number, submitter: User, organizationId: string) {
    await validateUserIsPartOfFinanceTeam(submitter, organizationId);

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }
    if (reimbursementRequest.organizationId !== organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

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
   * @param organizationId the organization the user is currently in
   * @returns the created vendor
   */
  static async createVendor(submitter: User, name: string, organizationId: string) {
    const isAuthorized =
      (await userHasPermission(submitter.userId, organizationId, isAdmin)) ||
      (await isUserLeadOrHeadOfFinanceTeam(submitter, organizationId));
    if (!isAuthorized) throw new AccessDeniedException('Only admins, finance leads, and finance heads can create vendors.');

    const existingVendor = await prisma.vendor.findUnique({
      where: { uniqueVendor: { name, organizationId } }
    });

    if (existingVendor && existingVendor.dateDeleted) {
      await prisma.vendor.update({
        where: { vendorId: existingVendor.vendorId },
        data: { dateDeleted: null }
      });
      return existingVendor;
    } else if (existingVendor) throw new HttpException(400, 'This vendor already exists');

    const vendor = await prisma.vendor.create({
      data: {
        name,
        organizationId
      }
    });

    return vendor;
  }

  /**
   * Service function to create an account code in our database
   * @param submitter user who is creating the Account Code
   * @param name The name of the Account Code
   * @param code the Account Code's SABO code
   * @param allowed whether or not this Account Code is allowed
   * @param allowedRefundSources an array of Club_Accounts representing allowed refund sources
   * @param organizationId the organization the user is currently in
   * @returns the created Account Code
   */
  static async createAccountCode(
    submitter: User,
    name: string,
    code: number,
    allowed: boolean,
    allowedRefundSources: Club_Accounts[],
    organizationId: string
  ) {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create Account Codes');

    const expense = await prisma.account_Code.create({
      data: {
        name,
        allowed,
        code,
        allowedRefundSources,
        organizationId
      }
    });

    return expense;
  }

  /**
   * Edits an Account Code
   * @param accountCodeId the requested account code to be edited
   * @param code the new Account Code code number
   * @param name the new Account Code code name
   * @param allowed the new Account Code allowed value
   * @param submitter the person editing account code code number
   * @param allowedRefundSources the new allowed refund sources
   * @param orgainzationId the organization the user is currently in
   * @returns the updated account code
   */
  static async editAccountCode(
    accountCodeId: string,
    code: number,
    name: string,
    allowed: boolean,
    submitter: User,
    allowedRefundSources: Club_Accounts[],
    organizationId: string
  ) {
    if (!(await userHasPermission(submitter.userId, organizationId, isHead)))
      throw new AccessDeniedException('Only the head or admin can update account code number and name');

    const accountCode = await ReimbursementRequestService.getSingleAccountCode(accountCodeId, organizationId);

    const accountCodeUpdated = await prisma.account_Code.update({
      where: { accountCodeId: accountCode.accountCodeId },
      data: {
        name,
        code,
        allowed,
        allowedRefundSources
      }
    });

    return accountCodeUpdated;
  }

  /**
   * Service function to upload a picture to the receipts folder in the NER google drive
   * @param reimbursementRequestId id for the reimbursement request we're tying the receipt to
   * @param file The file data for the image
   * @param submitter user who is uploading the receipt
   * @param organizationId the organization the user is currently in
   * @returns the google drive id for the file
   */
  static async uploadReceipt(
    reimbursementRequestId: string,
    file: Express.Multer.File,
    submitter: User,
    organizationId: string
  ) {
    if (await userHasPermission(submitter.userId, organizationId, isGuest))
      throw new AccessDeniedGuestException('Guests cannot upload receipts');

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }
    if (reimbursementRequest.organizationId !== organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');
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
   * Gets all the account codes for the given organization
   * @param organizationId The organization the user is currently in
   * @returns The account codes for the given organization
   */
  static async getAllAccountCodes(organizationId: string): Promise<AccountCode[]> {
    const accountCodes = await prisma.account_Code.findMany({
      where: {
        dateDeleted: null,
        organizationId
      }
    });

    return accountCodes.map(accountCodeTransformer);
  }

  /**
   * Gets all the reimbursement requests from the database that have no dateDeleted and are in the organization the user is currently in
   * @param user the user getting the reimbursement requests
   * @param organizationId the organization the user is currently in
   * @returns an array of the prisma version of the reimbursement requests transformed to the shared version
   */
  static async getAllReimbursementRequests(user: User, organizationId: string): Promise<ReimbursementRequest[]> {
    await isUserAdminOrOnFinance(user, organizationId);

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: { dateDeleted: null, accountCode: { organizationId } },
      ...getReimbursementRequestQueryArgs(organizationId)
    });

    return reimbursementRequests.map(reimbursementRequestTransformer);
  }

  /**
   * Service function to mark a reimbursement request as delivered
   * @param submitter The User marking the request as delivered
   * @param requestId The ID of the reimbursement request to be marked as delivered
   * @param organizationId The organization the user is currently in
   * @throws NotFoundException if the id is invalid or not there
   * @throws AccessDeniedException if the creator of the request is not the submitter
   * @returns the updated reimbursement request
   */
  static async markReimbursementRequestAsDelivered(submitter: User, reimbursementRequestId: string, organizationId: string) {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDelivered) throw new AccessDeniedException('Can only be marked as delivered once');
    if (submitter.userId !== reimbursementRequest.recipientId)
      throw new AccessDeniedException('Only the creator of the reimbursement request can mark as delivered');
    if (reimbursementRequest.organizationId !== organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

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
   * @param organizationId the organization the user is currently in
   * @throws AccessDeniedException if the submitter of the request is not on the finance team
   * @throws HttpException if the finance team does not exist
   * @throws NotFoundException if the id is invalid or not there
   * @throws HttpException if the reimbursement request is already marked as reimbursed or has been denied
   * @returns the created reimbursment status
   */
  static async markReimbursementRequestAsReimbursed(
    reimbursementRequestId: string,
    submitter: User,
    organizationId: string
  ) {
    await validateUserIsPartOfFinanceTeam(submitter, organizationId);

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
    if (reimbursementRequest.organizationId !== organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');
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
      ...getReimbursementStatusQueryArgs(organizationId)
    });

    const notification = await prisma.message_Info.findFirst({
      where: {
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      }
    });

    if (notification) {
      await reactToMessage(notification.channelId, notification.timestamp, 'money_with_wings');
    }

    return reimbursementStatusTransformer(reimbursementStatus);
  }

  /**
   * Gets a single reimbursement request for the given id
   * @param user the user getting the reimbursement request
   * @param reimbursementRequestId the id of thereimbursement request to get
   * @param organizationId the organization the user is currently in
   * @returns the reimbursement request with the given id
   */
  static async getSingleReimbursementRequest(
    user: User,
    reimbursementRequestId: string,
    organizationId: string
  ): Promise<ReimbursementRequest> {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      ...getReimbursementRequestQueryArgs(organizationId)
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.organizationId !== organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    try {
      await validateUserIsPartOfFinanceTeam(user, organizationId);
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
   * @param organizationId the organization the user is currently in
   * @returns the created reimbursment status
   */
  static async approveReimbursementRequest(reimbursementRequestId: string, submitter: User, organizationId: string) {
    await validateUserIsPartOfFinanceTeam(submitter, organizationId);

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
    if (reimbursementRequest.organizationId !== organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

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
      ...getReimbursementStatusQueryArgs(organizationId)
    });

    const notification = await prisma.message_Info.findFirst({
      where: {
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      }
    });

    if (notification) {
      await reactToMessage(notification.channelId, notification.timestamp, 'white_check_mark');
    }

    return reimbursementStatusTransformer(reimbursementStatus);
  }

  /**
   * Adds a reimbursement status with type denied to the given reimbursement request
   *
   * @param reimbursementRequestId the id of the reimbursement request to deny
   * @param submitter the user who is denying the reimbursement request
   * @param organizationId the organization the user is currently in
   * @returns the created reimbursment status
   */
  static async denyReimbursementRequest(reimbursementRequestId: string, submitter: User, organizationId: string) {
    await validateUserIsPartOfFinanceTeam(submitter, organizationId);

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
    if (reimbursementRequest.organizationId !== organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');
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
      ...getReimbursementStatusQueryArgs(organizationId)
    });

    const recipientSettings = await prisma.user_Settings.findUnique({
      where: { userId: reimbursementRequest.recipientId }
    });

    if (!recipientSettings) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);

    await sendReimbursementRequestDeniedNotification(recipientSettings.slackId, reimbursementRequestId);

    const notification = await prisma.message_Info.findFirst({
      where: {
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      }
    });

    if (notification) {
      await reactToMessage(notification.channelId, notification.timestamp, 'x');
    }
    
    return reimbursementStatusTransformer(reimbursementStatus);
  }

  /**
   * Downloads the receipt image file with the given google file id
   *
   * @param fileId the google file id of the receipt image
   * @param submitter the user who is downloading the receipt image
   * @param organizationId the organization the user is currently in
   * @returns a buffer of the image data and the image type
   */
  static async downloadReceiptImage(fileId: string, submitter: User, organizationId: string) {
    await validateUserIsPartOfFinanceTeam(submitter, organizationId);

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
   * @param organizationId the organization the user is currently in
   * @returns the updated vendor
   */
  static async editVendor(name: string, vendorId: string, submitter: User, organizationId: string) {
    await isUserAdminOrOnFinance(submitter, organizationId);

    const oldVendor = await ReimbursementRequestService.getSingleVendor(vendorId, organizationId);
    if (oldVendor.name === name) throw new HttpException(400, 'Vendor name is the same as the current name');

    const desiredName = await prisma.vendor.findUnique({
      where: { uniqueVendor: { name, organizationId } }
    });
    if (desiredName) throw new HttpException(400, 'vendor name already exists');

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
   * @param organizationId the organization the user is currently in
   * @returns the 'deleted' vendor
   */
  static async deleteVendor(vendorId: string, submitter: User, organizationId: string) {
    await isUserAdminOrOnFinance(submitter, organizationId);

    const vendor = await ReimbursementRequestService.getSingleVendor(vendorId, organizationId);

    const deletedVendor = await prisma.vendor.update({
      where: { vendorId: vendor.vendorId },
      data: { dateDeleted: new Date() }
    });

    return vendorTransformer(deletedVendor);
  }

  /**
   * Gets the vendor with the given id
   * @param vendorId The id of the vendor to get
   * @param organizationId The organization the user is currently in
   * @returns The vendor with the given id
   */
  static async getSingleVendor(vendorId: string, organizationId: string): Promise<Vendor> {
    const vendor = await prisma.vendor.findUnique({
      where: { vendorId }
    });

    if (!vendor) throw new NotFoundException('Vendor', vendorId);
    if (vendor.dateDeleted) throw new DeletedException('Vendor', vendorId);
    if (vendor.organizationId !== organizationId) throw new AccessDeniedException('You do not have access to this vendor');

    return vendorTransformer(vendor);
  }

  /**
   * Gets the account code with the given id
   * @param accountCodeId The id of the account code to get
   * @param organizationId The organization the user is currently in
   * @returns The account code with the given id
   */
  static async getSingleAccountCode(accountCodeId: string, organizationId: string): Promise<AccountCode> {
    const accountCode = await prisma.account_Code.findUnique({
      where: { accountCodeId }
    });

    if (!accountCode) throw new NotFoundException('Account Code', accountCodeId);
    if (accountCode.dateDeleted) throw new DeletedException('Account Code', accountCode.name);
    if (accountCode.organizationId !== organizationId)
      throw new AccessDeniedException('You do not have access to this Account Code');

    return accountCodeTransformer(accountCode);
  }
}
