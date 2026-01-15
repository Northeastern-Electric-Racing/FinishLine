/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Reimbursement_Request, Reimbursement_Status_Type, Organization } from '@prisma/client';
import {
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
  AccountCode,
  ReimbursementStatus,
  startOfDay,
  IndexCode,
  OtherProductReason,
  notGuest,
  User
} from 'shared';
import prisma from '../prisma/prisma';
import {
  createReimbursementProducts,
  isUserLeadOrHeadOfFinanceTeam,
  removeDeletedReceiptPictures,
  updateReimbursementProducts,
  validateReimbursementProducts,
  validateUserEditRRPermissions,
  validateRefund,
  validateUserIsPartOfFinanceTeamOrHead,
  isUserOnFinanceTeam
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
import { downloadFile, sendMailToAdvisor, uploadFile } from '../utils/google-integration.utils';
import {
  accountCodeTransformer,
  indexCodeTransformer,
  otherProductReasonTransformer,
  reimbursementRequestCommentTransformer,
  reimbursementRequestTransformer,
  reimbursementStatusTransformer,
  reimbursementTransformer,
  vendorTransformer
} from '../transformers/reimbursement-requests.transformer';
import { UserWithSecureSettings } from '../utils/auth.utils';
import {
  sendPendingSaboSubmissionNotification,
  sendReimbursementRequestChangesRequestedNotification,
  sendReimbursementRequestCreatedNotificationAndCreateMessageInfo,
  sendReimbursementRequestDeniedNotification,
  sendReimbursementRequestLeadershipApprovedNotification,
  sendReimbursementRequestPendingFinanceNotification,
  sendSubmittedToSaboNotification,
  sendThreadResponse
} from '../utils/slack.utils';
import { getUsers, userHasPermission } from '../utils/users.utils';
import { getReimbursementRequestQueryArgs } from '../prisma-query-args/reimbursement-requests.query-args';
import { getReimbursementQueryArgs } from '../prisma-query-args/reimbursement.query-args';
import { getReimbursementStatusQueryArgs } from '../prisma-query-args/reimbursement-statuses.query-args';
import { getVendorQueryArgs } from '../prisma-query-args/vendor.query-args';
import { getAccountCodeQueryArgs } from '../prisma-query-args/account-code.query-args';
import { getIndexCodeQueryArgs } from '../prisma-query-args/index-code.query-args';
import { getReimbursementProductOtherReasonQueryArgs } from '../prisma-query-args/reimbursement-product-other-reason.query-args';
import { getReimbursementRequestCommentQueryArgs } from '../prisma-query-args/reimbursement-comment.query-args';
import { encrypt } from '../utils/encryption.utils';
import { Description } from '@slack/web-api/dist/types/response/StarsListResponse';

export default class ReimbursementRequestService {
  /**
   * Returns all reimbursement requests in the database that are created by the given user and for the currently selected organization.
   * @param recipient The user retrieving their reimbursement requests
   * @param organizationId The organization the user is currently in
   */
  static async getUserReimbursementRequests(recipient: User, organization: Organization): Promise<ReimbursementRequest[]> {
    const userReimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: { dateDeleted: null, recipientId: recipient.userId, organizationId: organization.organizationId },
      ...getReimbursementRequestQueryArgs(organization.organizationId)
    });
    return userReimbursementRequests.map(reimbursementRequestTransformer);
  }

  /**
   * Returns all reimbursement requests that are assigned to the given user in the organization
   * @param assignee the assignee
   * @param organization the organization
   * @returns the reimbursement requests assigned to that user
   */
  static async getUserAssignedReimbursementRequests(
    assignee: User,
    organization: Organization
  ): Promise<ReimbursementRequest[]> {
    const assignedReimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: { dateDeleted: null, assigneeId: assignee.userId, organizationId: organization.organizationId },
      ...getReimbursementRequestQueryArgs(organization.organizationId)
    });
    return assignedReimbursementRequests.map(reimbursementRequestTransformer);
  }

  /**
   * Returns all reimbursement requests in the database that are created by any user in the given user's team and for the currently selected organization.
   * @param recipient The user retrieving their teams reimbursement requests
   * @param organizationId The organization the user is currently in
   */
  static async getUsersTeamsReimbursementRequests(
    recipient: User,
    organization: Organization
  ): Promise<ReimbursementRequest[]> {
    const teams = await prisma.team.findMany({
      where: {
        organizationId: organization.organizationId,
        OR: [
          {
            headId: recipient.userId
          },
          {
            leads: {
              some: {
                userId: recipient.userId
              }
            }
          },
          {
            members: {
              some: {
                userId: recipient.userId
              }
            }
          }
        ]
      },
      include: {
        members: true,
        leads: true
      }
    });

    const teamUserIds = new Set<string>();

    teams.forEach((team) => {
      if (team.headId) teamUserIds.add(team.headId);
      team.leads.forEach((lead) => teamUserIds.add(lead.userId));
      team.members.forEach((member) => teamUserIds.add(member.userId));
    });

    const teamsReimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: {
        dateDeleted: null,
        recipientId: { in: Array.from(teamUserIds) },
        organizationId: organization.organizationId
      },
      ...getReimbursementRequestQueryArgs(organization.organizationId)
    });

    return teamsReimbursementRequests.map(reimbursementRequestTransformer);
  }

  /**
   * Returns all reimbursements in the database that are created by the given user and for the currently selected organization.
   * @param user ther user retrieving the reimbursements
   * @param organizationId the organization the user is currently in
   * @returns all reimbursements for the given user
   */
  static async getUserReimbursements(user: User, organization: Organization): Promise<Reimbursement[]> {
    const userReimbursements = await prisma.reimbursement.findMany({
      where: { userSubmittedId: user.userId, organizationId: organization.organizationId },
      ...getReimbursementQueryArgs(organization.organizationId)
    });
    return userReimbursements.map(reimbursementTransformer);
  }

  /**
   * Returns all the reimbursements in the database
   * @param user The user retrieving all the reimbursements
   * @param organizationId The organization the user is currently in
   * @returns All the reimbursements in the database
   */
  static async getAllReimbursements(user: User, organization: Organization): Promise<Reimbursement[]> {
    const isUserAuthorized =
      (await isUserOnFinanceTeam(user, organization.organizationId)) ||
      (await userHasPermission(user.userId, organization.organizationId, isHead));
    if (!isUserAuthorized) {
      throw new AccessDeniedException(`You are not a member of the finance team!`);
    }

    const reimbursements = await prisma.reimbursement.findMany({
      where: {
        organizationId: organization.organizationId
      },
      ...getReimbursementQueryArgs(organization.organizationId)
    });

    return reimbursements.map(reimbursementTransformer);
  }

  /**
   * Get all the vendors in the database.
   * @param organizationId The organization the user is currently in
   * @returns All the non-deleted vendors
   */
  static async getAllVendors(organization: Organization): Promise<Vendor[]> {
    const vendors = await prisma.vendor.findMany({
      where: { dateDeleted: null, organizationId: organization.organizationId },
      ...getVendorQueryArgs(organization.organizationId)
    });
    return vendors.map(vendorTransformer);
  }

  /**
   * Creates a reimbursement request in the database
   * @param recipient the user who is creating the reimbursement request
   * @param dateOfExpense the date that the expense occured
   * @param vendorId the id of the vendor that the expense was made for
   * @param indexCodeId the id of the index code to be reimbursed from
   * @param reimbursementProducts the products that the user bought
   * @param accountCodeId the id of the account code the user made
   * @param totalCost the total cost of the reimbursement with tax
   * @param organizationId the organization the user is currently in
   * @returns the created reimbursement request
   */
  static async createReimbursementRequest(
    recipient: UserWithSecureSettings,
    vendorId: string,
    indexCodeId: string,
    otherReimbursementProducts: OtherReimbursementProductCreateArgs[],
    wbsReimbursementProducts: WbsReimbursementProductCreateArgs[],
    acccountCodeId: string,
    totalCost: number,
    organization: Organization,
    dateOfExpense?: Date,
    description?: string
  ): Promise<ReimbursementRequest> {
    if (await userHasPermission(recipient.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create a reimbursement request');

    if (!recipient.userSecureSettings) throw new HttpException(500, 'User does not have their finance settings set up');

    const vendor = await ReimbursementRequestService.getSingleVendor(vendorId, organization);
    const indexCode = await ReimbursementRequestService.getSingleIndexCode(indexCodeId, organization);
    const accountCode = await ReimbursementRequestService.getSingleAccountCode(acccountCodeId, organization);

    if (!accountCode.allowed) throw new HttpException(400, `The Account Code ${accountCode.name} is not allowed!`);
    if (!accountCode.indexCodes.some((refundSource) => refundSource.indexCodeId === indexCodeId)) {
      throw new HttpException(400, 'The submitted refund source is not allowed to be used with the submitted Account Code');
    }

    const validatedReimbursementProducts = await validateReimbursementProducts(
      otherReimbursementProducts,
      wbsReimbursementProducts,
      organization.organizationId
    );

    const numReimbursementRequests = await prisma.reimbursement_Request.count({
      where: { organizationId: organization.organizationId }
    });

    const createdReimbursementRequest = await prisma.reimbursement_Request.create({
      data: {
        recipient: { connect: { userId: recipient.userId } },
        dateOfExpense: dateOfExpense ?? null,
        vendor: { connect: { vendorId: vendor.vendorId } },
        indexCode: { connect: { indexCodeId: indexCode.indexCodeId } },
        accountCode: { connect: { accountCodeId: accountCode.accountCodeId } },
        totalCost,
        reimbursementStatuses: {
          create: {
            type: ReimbursementStatusType.PENDING_LEADERSHIP_APPROVAL,
            userId: recipient.userId
          }
        },
        identifier: numReimbursementRequests + 1,
        organization: { connect: { organizationId: organization.organizationId } },
        description
      }
    });

    await createReimbursementProducts(
      validatedReimbursementProducts.validatedOtherReimbursementProducts,
      validatedReimbursementProducts.validatedWbsReimbursementProducts,
      createdReimbursementRequest.reimbursementRequestId
    );

    await sendReimbursementRequestCreatedNotificationAndCreateMessageInfo(
      createdReimbursementRequest.reimbursementRequestId,
      createdReimbursementRequest.identifier,
      recipient.userId,
      organization.organizationId
    );

    const finalizedReimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: {
        reimbursementRequestId: createdReimbursementRequest.reimbursementRequestId
      },
      ...getReimbursementRequestQueryArgs(organization.organizationId)
    });

    if (!finalizedReimbursementRequest) throw new HttpException(500, 'Unable to retrieve created reimbursement request');

    return reimbursementRequestTransformer(finalizedReimbursementRequest);
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
    organization: Organization
  ): Promise<Reimbursement> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest)) {
      throw new AccessDeniedException('Guests cannot reimburse a user for their expenses.');
    }

    await validateRefund(submitter, amount, organization.organizationId);

    // make the date object but add 12 hours so that the time isn't 00:00 to avoid timezone problems
    const dateCreated = new Date(dateReceived.split('T')[0]);
    dateCreated.setTime(dateCreated.getTime() + 12 * 60 * 60 * 1000);

    const newReimbursement = await prisma.reimbursement.create({
      data: {
        purchaserId: submitter.userId,
        amount,
        dateCreated: dateReceived,
        userSubmittedId: submitter.userId,
        organizationId: organization.organizationId
      },
      ...getReimbursementQueryArgs(organization.organizationId)
    });

    return reimbursementTransformer(newReimbursement);
  }

  /**
   * Edits the given reimbursement Request
   *
   * @param requestId the id of the reimbursement request we are editing
   * @param dateOfExpense the updated date of expense
   * @param vendorId the updated vendor id
   * @param indexCodeId the updated index code id
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
    vendorId: string,
    indexCodeId: string,
    accountCodeId: string,
    totalCost: number,
    otherReimbursementProducts: OtherReimbursementProductCreateArgs[],
    wbsReimbursementProducts: WbsReimbursementProductCreateArgs[],
    receiptPictures: ReimbursementReceiptCreateArgs[],
    submitter: User,
    organization: Organization,
    dateOfExpense?: Date,
    description?: string
  ): Promise<Reimbursement_Request> {
    const oldReimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId: requestId },
      include: {
        reimbursementProducts: true,
        receiptPictures: true,
        accountCode: true,
        reimbursementStatuses: true
      }
    });

    if (!oldReimbursementRequest) throw new NotFoundException('Reimbursement Request', requestId);
    if (oldReimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', requestId);
    if (oldReimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    await validateUserEditRRPermissions(submitter, oldReimbursementRequest, organization.organizationId);

    const vendor = await ReimbursementRequestService.getSingleVendor(vendorId, organization);
    const accountCode = await ReimbursementRequestService.getSingleAccountCode(accountCodeId, organization);

    if (!accountCode.allowed) throw new HttpException(400, 'Account Code Not Allowed');
    if (!accountCode.indexCodes.some((refundSource) => refundSource.indexCodeId === indexCodeId)) {
      throw new HttpException(400, 'The submitted refund source is not allowed to be used with the submitted Account Code');
    }

    await updateReimbursementProducts(
      oldReimbursementRequest.reimbursementProducts,
      otherReimbursementProducts,
      wbsReimbursementProducts,
      oldReimbursementRequest.reimbursementRequestId,
      organization.organizationId
    );

    const updatedReimbursementRequest = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId: oldReimbursementRequest.reimbursementRequestId },
      data: {
        dateOfExpense: dateOfExpense ?? null,
        indexCodeId,
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
   * Assigns a finance member to a reimbursement request to keep track of it
   * @param assigner the user making the assignment
   * @param organization the organization
   * @param requestId the reimbursement request being assigned to
   * @param assigneeId the user being assigned to the rr
   * @returns the updated RR
   */
  static async assignFinanceMember(assigner: User, organization: Organization, requestId: string, assigneeId: string) {
    if (!(await userHasPermission(assigner.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedException('Only members can assign reimbursement requests');
    }

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: {
        reimbursementRequestId: requestId
      }
    });

    if (!reimbursementRequest) {
      throw new NotFoundException('Reimbursement Request', requestId);
    }

    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', requestId);
    }

    if (reimbursementRequest.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Reimbursement Request');
    }

    const assignee = await prisma.user.findUnique({
      where: {
        userId: assigneeId
      }
    });

    if (!assignee) {
      throw new NotFoundException('User', assigneeId);
    }

    const updatedRR = await prisma.reimbursement_Request.update({
      where: {
        reimbursementRequestId: requestId
      },
      data: {
        assignee: {
          connect: {
            userId: assigneeId
          }
        }
      },
      ...getReimbursementQueryArgs
    });

    return updatedRR;
  }

  /**
   * Edits the given reimbursement
   * @param reimbursementId The id of the reimbursement to be edited
   * @param editor The user editing the reimbursement
   * @param amount The new amount of the reimbursement
   * @param dateCreated The new date the reimbursement was created
   * @param organizationId The organization the user is currently in
   * @returns The updated reimbursement
   */
  static async editReimbursement(
    reimbursementId: string,
    editor: User,
    amount: number,
    dateCreated: Date,
    organization: Organization
  ) {
    const request = await prisma.reimbursement.findUnique({
      where: { reimbursementId }
    });

    if (!request) throw new NotFoundException('Reimbursement', reimbursementId);
    if (request.userSubmittedId !== editor.userId)
      throw new AccessDeniedException(
        'You do not have access to edit this refund, only the submitter can edit their refund'
      );
    if (request.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Reimbursement');

    const difference = amount - request.amount;

    if (difference > 0) await validateRefund(editor, difference, organization.organizationId);

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
    organization: Organization
  ): Promise<Reimbursement_Request> {
    const request = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId: requestId },
      include: {
        reimbursementStatuses: true
      }
    });

    if (!request) throw new NotFoundException('Reimbursement Request', requestId);
    if (request.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');
    if (request.dateDeleted) throw new DeletedException('Reimbursement Request', requestId);
    if (
      request.reimbursementStatuses.some(
        (reimbursementStatus) => reimbursementStatus.type === Reimbursement_Status_Type.SABO_SUBMITTED
      )
    )
      throw new AccessDeniedException('You cannot delete this reimbursement request. It has already been approved');

    if (
      request.recipientId !== submitter.userId &&
      !(await isUserLeadOrHeadOfFinanceTeam(submitter, organization.organizationId))
    )
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
  static async getPendingAdvisorList(requester: User, organization: Organization): Promise<ReimbursementRequest[]> {
    await validateUserIsPartOfFinanceTeamOrHead(requester, organization.organizationId);

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
        accountCode: { organizationId: organization.organizationId }
      },
      ...getReimbursementRequestQueryArgs(organization.organizationId)
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
    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      include: { advisor: true }
    });

    if (!organization) throw new NotFoundException('Organization', organizationId);

    await validateUserIsPartOfFinanceTeamOrHead(sender, organizationId);

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
      (reimbursementRequest) => reimbursementRequest.organizationId !== organization.organizationId
    );
    if (reimbursementRequestsNotInOrganization.length > 0) throw new InvalidOrganizationException('Reimbursement Request');

    const mailOptions = {
      subject: 'Reimbursement Requests To Be Approved By Advisor',
      text: `The following reimbursement requests need to be approved by you: ${saboNumbers.join(', ')}`
    };

    if (!organization.advisor) throw new HttpException(400, 'Organization does not have an advisor');

    await sendMailToAdvisor(mailOptions.subject, mailOptions.text, organization.advisor);

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
   * @param organizationId the organization the user is currently in
   * @returns the reimbursement request with the sabo number
   */

  static async setSaboNumber(
    reimbursementRequestId: string,
    saboNumber: number,
    submitter: User,
    organization: Organization
  ) {
    await validateUserIsPartOfFinanceTeamOrHead(submitter, organization.organizationId);
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }
    if (reimbursementRequest.organizationId !== organization.organizationId)
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
   * @param submitter user creating the vendor
   * @param name vendor name
   * @param organization current organziation
   * @param username vendor username
   * @param password vendor password
   * @param notes vendor notes
   * @param addedByUserId userId that added the vendor
   * @param twoFactorContacts two-factor contact ids
   * @param discountCode vendor discount code
   * @returns
   */
  static async createVendor(
    submitter: User,
    name: string,
    organization: Organization,
    taxExempt: boolean,
    twoFactorContacts: string[],
    notes?: string,
    username?: string,
    password?: string,
    discountCode?: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedException('create vendors');
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: { uniqueVendor: { name, organizationId: organization.organizationId } },
      ...getVendorQueryArgs(organization.organizationId)
    });

    if (existingVendor && existingVendor.dateDeleted) {
      await prisma.vendor.update({
        where: { vendorId: existingVendor.vendorId },
        data: { dateDeleted: null }
      });
      return existingVendor;
    } else if (existingVendor) throw new HttpException(400, 'This vendor already exists');

    const twoFactorContactUsers = await getUsers(twoFactorContacts);

    const vendor = await prisma.vendor.create({
      data: {
        name,
        organizationId: organization.organizationId,
        username,
        password: password ? encrypt(password) : undefined,
        taxExempt,
        discountCode,
        twoFactorContacts: { connect: twoFactorContactUsers.map((user) => ({ userId: user.userId })) },
        notes,
        addedByUserId: submitter.userId
      },
      ...getVendorQueryArgs(organization.organizationId)
    });

    return vendor;
  }

  /**
   * Service function to create an account code in our database
   * @param submitter user who is creating the Account Code
   * @param name The name of the Account Code
   * @param code the Account Code's SABO code
   * @param allowed whether or not this Account Code is allowed
   * @param indexCodeIds an array of index code ids representing allowed refund sources
   * @param organizationId the organization the user is currently in
   * @param amount the monetary amount in cents for the Account Code
   * @returns the created Account Code
   */
  static async createAccountCode(
    submitter: User,
    name: string,
    code: number,
    allowed: boolean,
    indexCodeIds: string[],
    organization: Organization,
    amount?: number
  ): Promise<AccountCode> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create Account Codes');

    const existingAccount = await prisma.account_Code.findUnique({
      where: { uniqueExpenseType: { name, organizationId: organization.organizationId } }
    });

    if (existingAccount && existingAccount.dateDeleted) {
      const updatedExistingAccount = await prisma.account_Code.update({
        where: { accountCodeId: existingAccount.accountCodeId },
        data: { dateDeleted: null },
        ...getAccountCodeQueryArgs(organization.organizationId)
      });
      return accountCodeTransformer(updatedExistingAccount);
    } else if (existingAccount) throw new HttpException(400, 'This Account Code already exists');

    const expense = await prisma.account_Code.create({
      data: {
        name,
        allowed,
        code,
        amount,
        indexCodes: { connect: indexCodeIds.map((id) => ({ indexCodeId: id })) },
        organizationId: organization.organizationId
      },
      ...getAccountCodeQueryArgs(organization.organizationId)
    });

    return accountCodeTransformer(expense);
  }

  /**
   * Edits an Account Code
   * @param accountCodeId the requested account code to be edited
   * @param code the new Account Code code number
   * @param name the new Account Code code name
   * @param allowed the new Account Code allowed value
   * @param submitter the person editing account code code number
   * @param indexCodeIds the new allowed refund sources
   * @param orgainzationId the organization the user is currently in
   * @param amount the monetary amount in dollars for the Account Code
   * @returns the updated account code
   */
  static async editAccountCode(
    accountCodeId: string,
    code: number,
    name: string,
    allowed: boolean,
    submitter: User,
    indexCodeIds: string[],
    organization: Organization,
    amount?: number
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only the head or admin can update account code number and name');

    const accountCode = await ReimbursementRequestService.getSingleAccountCode(accountCodeId, organization);

    const accountCodeUpdated = await prisma.account_Code.update({
      where: { accountCodeId: accountCode.accountCodeId },
      data: {
        name,
        code,
        allowed,
        amount: amount ?? null,
        indexCodes: { set: indexCodeIds.map((id) => ({ indexCodeId: id })) }
      },
      ...getAccountCodeQueryArgs(organization.organizationId)
    });

    return accountCodeTransformer(accountCodeUpdated);
  }

  /**
   * Deletes the Account Code with the given id
   *
   * @param accountCodeId the requested account code to be deleted
   * @param submitter the user deleting the account code
   * @param organizationId the organization the user is currently in
   * @returns the 'deleted' account code
   */
  static async deleteAccountCode(accountCodeId: string, submitter: User, organization: Organization) {
    const isUserAuthorized =
      (await isUserOnFinanceTeam(submitter, organization.organizationId)) ||
      (await userHasPermission(submitter.userId, organization.organizationId, isHead));
    if (!isUserAuthorized) {
      throw new AccessDeniedException(`You are not a member of the finance team!`);
    }

    const accountCode = await ReimbursementRequestService.getSingleAccountCode(accountCodeId, organization);

    const deletedAccountCode = await prisma.account_Code.update({
      where: { accountCodeId: accountCode.accountCodeId },
      data: { dateDeleted: new Date() },
      ...getAccountCodeQueryArgs(organization.organizationId)
    });

    return accountCodeTransformer(deletedAccountCode);
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
    organization: Organization
  ) {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('Guests cannot upload receipts');

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    const numReceipts = await prisma.receipt.count({
      where: { reimbursementRequest: { organizationId: organization.organizationId } }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');
    if (
      reimbursementRequest.recipientId !== submitter.userId &&
      !(await isUserLeadOrHeadOfFinanceTeam(submitter, organization.organizationId))
    ) {
      throw new AccessDeniedException(
        'You do not have access to upload a receipt for this reimbursement request, only the creator or a finance lead can edit a reimbursement request'
      );
    }

    file.filename = 'receipt' + numReceipts;
    const imageData = await uploadFile(file);

    if (!imageData?.name) {
      throw new HttpException(500, 'Image Name not found');
    }

    const comment = `${submitter.firstName}  ${submitter.lastName} Uploaded Receipt`;

    await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: submitter.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

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
  static async getAllAccountCodes(organization: Organization): Promise<AccountCode[]> {
    const accountCodes = await prisma.account_Code.findMany({
      where: {
        dateDeleted: null,
        organizationId: organization.organizationId
      },
      ...getAccountCodeQueryArgs(organization.organizationId)
    });

    return accountCodes.map(accountCodeTransformer);
  }

  /**
   * Gets all the reimbursement requests from the database that have no dateDeleted and are in the organization the user is currently in
   * @param user the user getting the reimbursement requests
   * @param organizationId the organization the user is currently in
   * @returns an array of the prisma version of the reimbursement requests transformed to the shared version
   */
  static async getAllReimbursementRequests(user: User, organization: Organization): Promise<ReimbursementRequest[]> {
    const isUserAuthorized =
      (await isUserOnFinanceTeam(user, organization.organizationId)) ||
      (await userHasPermission(user.userId, organization.organizationId, isHead));
    if (!isUserAuthorized) {
      throw new AccessDeniedException(`You are not a member of the finance team!`);
    }

    const reimbursementRequests = await prisma.reimbursement_Request.findMany({
      where: { dateDeleted: null, accountCode: { organizationId: organization.organizationId } },
      ...getReimbursementRequestQueryArgs(organization.organizationId)
    });

    return reimbursementRequests.map(reimbursementRequestTransformer);
  }

  /**
   * Service function to mark a reimbursement request as delivered
   * @param submitter The User marking the request as delivered
   * @param requestId The ID of the reimbursement request to be marked as delivered
   * @param organizationId The organization the user is currently in
   * @param dateDelivered The date the reimbursed items were delivered
   * @throws NotFoundException if the id is invalid or not there
   * @throws AccessDeniedException if the creator of the request is not the submitter
   * @returns the updated reimbursement request
   */
  static async markReimbursementRequestAsDelivered(
    submitter: User,
    reimbursementRequestId: string,
    organization: Organization,
    dateDelivered: Date
  ) {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDelivered) throw new AccessDeniedException('Can only be marked as delivered once');
    if (submitter.userId !== reimbursementRequest.recipientId)
      throw new AccessDeniedException('Only the creator of the reimbursement request can mark as delivered');
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');
    if (reimbursementRequest.dateOfExpense && startOfDay(dateDelivered) < startOfDay(reimbursementRequest.dateOfExpense))
      throw new HttpException(400, 'Items cannot be delivered before the expense date.');
    if (startOfDay(dateDelivered) > startOfDay(new Date()))
      throw new HttpException(400, 'Delivery date cannot be in the future.');

    const comment = `${submitter.firstName}  ${submitter.lastName} Marked As Delivered`;

    await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: submitter.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    const reimbursementRequestDelivered = await prisma.reimbursement_Request.update({
      where: { reimbursementRequestId },
      data: { dateDelivered }
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
    organization: Organization
  ) {
    await validateUserIsPartOfFinanceTeamOrHead(submitter, organization.organizationId);

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
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');
    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.REIMBURSED)) {
      throw new HttpException(400, 'This reimbursement request has already been marked as reimbursed');
    }
    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
    }

    const comment = `${submitter.firstName}  ${submitter.lastName} Marked As Reimbursed`;

    await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: submitter.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    const reimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        type: ReimbursementStatusType.REIMBURSED,
        userId: submitter.userId,
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      },
      ...getReimbursementStatusQueryArgs(organization.organizationId)
    });

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
    organization: Organization
  ): Promise<ReimbursementRequest> {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      ...getReimbursementRequestQueryArgs(organization.organizationId)
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    try {
      await validateUserIsPartOfFinanceTeamOrHead(user, organization.organizationId);
    } catch {
      if (user.userId !== reimbursementRequest.recipientId)
        throw new AccessDeniedException('You do not have access to this reimbursement request');
    }

    return reimbursementRequestTransformer(reimbursementRequest);
  }

  /**
   * Adds a reimbursement status with type Leadership Approved to the given reimbursement request
   *
   * @param reimbursementRequestId The id of the reimbursement request to approve
   * @param submitter The person approving the reimbursement request
   * @param organizationId The organization the user is currently in
   * @returns The Leadership Approved reimbursement status
   */
  static async leadershipApproveReimbursementRequest(
    reimbursementRequestId: string,
    submitter: User,
    organization: Organization
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only a head or admin can approve reimbursement requests');

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      include: {
        reimbursementStatuses: true,
        notificationSlackThreads: true
      }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    if (
      reimbursementRequest.reimbursementStatuses.some(
        (reimbursementStatus) => reimbursementStatus.type === Reimbursement_Status_Type.LEADERSHIP_APPROVED
      )
    )
      throw new HttpException(400, 'This reimbursement request has already been approved by leadership');

    const comment = `${submitter.firstName}  ${submitter.lastName} Leadership Approved`;

    await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: submitter.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    const reimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        type: ReimbursementStatusType.LEADERSHIP_APPROVED,
        userId: submitter.userId,
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      },
      ...getReimbursementStatusQueryArgs(organization.organizationId)
    });
    try {
      // Only send notification if the submitter is not the recipient
      if (submitter.userId !== reimbursementRequest.recipientId) {
        await sendReimbursementRequestLeadershipApprovedNotification(
          reimbursementRequest.notificationSlackThreads,
          submitter.userId,
          reimbursementRequest.recipientId
        );
      }
    } catch (e: unknown) {
      console.error('Error sending reimbursement request leadership approved notification:', e);
    }

    return reimbursementStatusTransformer(reimbursementStatus);
  }

  /**
   * Adds a reimbursement status with type pending_sabo_submission to the given reimbursement request
   * This marks the reimbursement request as inputted in SABO by the finance team
   *
   * @param reimbursementRequestId the id of the reimbursement request to input in SABO
   * @param submitter the user who is inputting the reimbursement request in SABO (finance team member)
   * @param organization the organization the user is currently in
   * @returns the created reimbursement status
   */
  static async inputReimbursementRequestInSabo(reimbursementRequestId: string, submitter: User, organization: Organization) {
    await validateUserIsPartOfFinanceTeamOrHead(submitter, organization.organizationId);

    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      include: {
        reimbursementStatuses: true,
        notificationSlackThreads: true
      }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    if (
      !reimbursementRequest.reimbursementStatuses.some(
        (status) => status.type === ReimbursementStatusType.LEADERSHIP_APPROVED
      )
    ) {
      throw new HttpException(400, 'This reimbursement request has not been approved by leadership');
    }
    if (
      !reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.PENDING_FINANCE)
    ) {
      throw new HttpException(400, 'This reimbursement request has not been set as pending finance');
    }
    if (
      reimbursementRequest.reimbursementStatuses.some(
        (status) => status.type === ReimbursementStatusType.PENDING_SABO_SUBMISSION
      )
    ) {
      throw new HttpException(400, 'This reimbursement request has already been inputted in SABO');
    }
    if (
      reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.SABO_SUBMITTED)
    ) {
      throw new HttpException(400, 'This reimbursement request has already been approved by SABO');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
    }

    const comment = `${submitter.firstName}  ${submitter.lastName} Inputted in SABO`;

    await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: submitter.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    const reimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        type: ReimbursementStatusType.PENDING_SABO_SUBMISSION,
        userId: submitter.userId,
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      },
      ...getReimbursementStatusQueryArgs(organization.organizationId)
    });

    try {
      await sendPendingSaboSubmissionNotification(
        reimbursementRequest.notificationSlackThreads,
        submitter.userId,
        reimbursementRequest.recipientId
      );
    } catch (e: unknown) {
      console.error('Error sending pending SABO submission notification:', e);
    }

    return reimbursementStatusTransformer(reimbursementStatus);
  }

  /**
   * Adds a reimbursement status with type sabo_submitted to the given reimbursement request
   * This should be called after the user has approved the reimbursement request in Concur
   *
   * @param reimbursementRequestId the id of the reimbursement request to mark as approved by SABO
   * @param submitter the user marking as approved by SABO (should be the recipient who approved in Concur)
   * @param organization the organization the user is currently in
   * @returns the created reimbursment status
   */
  static async markReimbursementRequestAsSaboSubmitted(
    reimbursementRequestId: string,
    submitter: User,
    organization: Organization
  ) {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      include: {
        reimbursementStatuses: true,
        notificationSlackThreads: true
      }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    if (submitter.userId !== reimbursementRequest.recipientId) {
      throw new AccessDeniedException('Only the recipient of the reimbursement request can mark as submitted to SABO');
    }
    if (
      !reimbursementRequest.reimbursementStatuses.some(
        (status) => status.type === ReimbursementStatusType.PENDING_SABO_SUBMISSION
      )
    ) {
      throw new HttpException(400, 'This reimbursement request has not been inputted into SABO yet');
    }
    if (
      reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.SABO_SUBMITTED)
    ) {
      throw new HttpException(400, 'This reimbursement request has already been submitted to SABO');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
    }

    const comment = `${submitter.firstName}  ${submitter.lastName} submitted to SABO`;

    await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: submitter.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    const reimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        type: ReimbursementStatusType.SABO_SUBMITTED,
        userId: submitter.userId,
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      },
      ...getReimbursementStatusQueryArgs(organization.organizationId)
    });

    try {
      await sendSubmittedToSaboNotification(reimbursementRequest.notificationSlackThreads);
    } catch (e: unknown) {
      console.error('Error sending submitted to SABO notification:', e);
    }

    return reimbursementStatusTransformer(reimbursementStatus);
  }

  /**
   * Adds a reimbursement status with type denied to the given reimbursement request
   *
   * @param reimbursementRequestId the id of the reimbursement request to deny
   * @param submitter the user who is denying the reimbursement request
   * @param organization the organization the user is currently in
   * @returns the created reimbursment status
   */
  static async denyReimbursementRequest(reimbursementRequestId: string, submitter: User, organization: Organization) {
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
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');
    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.REIMBURSED)) {
      throw new HttpException(400, 'This reimbursement request has already been reimbursed');
    }

    if (submitter.userId !== reimbursementRequest.recipientId) {
      await validateUserIsPartOfFinanceTeamOrHead(submitter, organization.organizationId);
    }

    const comment = `${submitter.firstName}  ${submitter.lastName} Denied This Request`;

    await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: submitter.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    const reimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        type: ReimbursementStatusType.DENIED,
        userId: submitter.userId,
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId
      },
      ...getReimbursementStatusQueryArgs(organization.organizationId)
    });

    const recipientSettings = await prisma.user_Settings.findUnique({
      where: { userId: reimbursementRequest.recipientId }
    });

    if (!recipientSettings)
      throw new HttpException(
        400,
        'Reimbursement Request successfully updated, however no slack message was sent as recipient is missing their settings!'
      );

    try {
      await sendReimbursementRequestDeniedNotification(recipientSettings.slackId, reimbursementRequestId);
    } catch (e: unknown) {
      console.error('Error sending reimbursement request denied notification:', e);
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
  static async downloadReceiptImage(fileId: string, submitter: User, organization: Organization) {
    await validateUserIsPartOfFinanceTeamOrHead(submitter, organization.organizationId);

    const fileData = await downloadFile(fileId);

    if (!fileData) throw new NotFoundException('Image File', fileId);
    return fileData;
  }

  /**
   * Edits the vendor name
   *
   * @param name the new vendor name
   * @param vendorId the requested vendor to be edited
   * @param username the new vendor username
   * @param password the new vendor password
   * @param discountCode the new vendor discount code
   * @param taxExempt the new vendor tax exempt status
   * @param twoFactorContacts the new two-factor contact ids
   * @param notes the new vendor notes
   * @param submitter the user editing the vendor name
   * @param organizationId the organization the user is currently in
   * @returns the updated vendor
   */
  static async editVendor(
    name: string,
    vendorId: string,
    username: string,
    password: string,
    discountCode: string,
    taxExempt: boolean,
    twoFactorContacts: string[],
    notes: string,
    submitter: User,
    organization: Organization
  ): Promise<Vendor> {
    const existingVendor = await prisma.vendor.findUnique({
      where: { vendorId, dateDeleted: null },
      include: { twoFactorContacts: { select: { userId: true } } }
    });

    if (!existingVendor) {
      throw new NotFoundException('Vendor', vendorId);
    }

    if (existingVendor.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Vendor');
    }

    const isUserAuthorized =
      existingVendor.addedByUserId === submitter.userId ||
      (await isUserOnFinanceTeam(submitter, organization.organizationId)) ||
      (await userHasPermission(submitter.userId, organization.organizationId, isHead));
    if (!isUserAuthorized) {
      throw new AccessDeniedException(`You are not a member of the finance team!`);
    }

    const users = await getUsers(twoFactorContacts);

    const existingContactIds = existingVendor?.twoFactorContacts.map((contact) => ({ userId: contact.userId })) || [];

    const newContactIds = users.map((user) => ({ userId: user.userId }));

    const vendor = await prisma.vendor.update({
      where: { vendorId },
      data: {
        name,
        organizationId: organization.organizationId,
        username,
        password: password ? encrypt(password) : undefined,
        taxExempt,
        discountCode,
        twoFactorContacts: {
          disconnect: existingContactIds,
          connect: newContactIds
        },
        notes
      },
      ...getVendorQueryArgs(organization.organizationId)
    });

    return vendorTransformer(vendor);
  }

  static async setVendorTaxExemptStatus(
    vendorId: string,
    taxExempt: boolean,
    submitter: User,
    organization: Organization
  ): Promise<Vendor> {
    const existingVendor = await prisma.vendor.findUnique({
      where: { vendorId, dateDeleted: null },
      include: { twoFactorContacts: { select: { userId: true } } }
    });

    if (!existingVendor) {
      throw new NotFoundException('Vendor', vendorId);
    }

    if (existingVendor.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Vendor');
    }

    const isUserAuthorized =
      existingVendor.addedByUserId === submitter.userId ||
      (await isUserOnFinanceTeam(submitter, organization.organizationId)) ||
      (await userHasPermission(submitter.userId, organization.organizationId, isHead));
    if (!isUserAuthorized) {
      throw new AccessDeniedException(`You are not a member of the finance team!`);
    }

    const updatedVendor = await prisma.vendor.update({
      where: { vendorId },
      data: { taxExempt },
      ...getVendorQueryArgs(organization.organizationId)
    });

    return vendorTransformer(updatedVendor);
  }

  /**
   * Deletes the vendor
   *
   * @param vendorId the requested vendor to be deleted
   * @param submitter the user deleting the vendor
   * @param organizationId the organization the user is currently in
   * @returns the 'deleted' vendor
   */
  static async deleteVendor(vendorId: string, submitter: User, organization: Organization) {
    const existingVendor = await prisma.vendor.findUnique({
      where: { vendorId, dateDeleted: null }
    });

    if (!existingVendor) {
      throw new NotFoundException('Vendor', vendorId);
    }

    if (existingVendor.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Vendor');
    }

    const isUserAuthorized =
      existingVendor.addedByUserId === submitter.userId ||
      (await isUserOnFinanceTeam(submitter, organization.organizationId)) ||
      (await userHasPermission(submitter.userId, organization.organizationId, isHead));
    if (!isUserAuthorized) {
      throw new AccessDeniedException(`You are not a member of the finance team!`);
    }

    const deletedVendor = await prisma.vendor.update({
      where: { vendorId: existingVendor.vendorId },
      data: { dateDeleted: new Date() },
      ...getVendorQueryArgs(organization.organizationId)
    });

    return vendorTransformer(deletedVendor);
  }

  /**
   * Gets the vendor with the given id
   * @param vendorId The id of the vendor to get
   * @param organizationId The organization the user is currently in
   * @returns The vendor with the given id
   */
  static async getSingleVendor(vendorId: string, organization: Organization): Promise<Vendor> {
    const vendor = await prisma.vendor.findUnique({
      where: { vendorId },
      ...getVendorQueryArgs(organization.organizationId)
    });

    if (!vendor) throw new NotFoundException('Vendor', vendorId);
    if (vendor.dateDeleted) throw new DeletedException('Vendor', vendorId);
    if (vendor.organizationId !== organization.organizationId)
      throw new AccessDeniedException('You do not have access to this vendor');

    return vendorTransformer(vendor);
  }

  /**
   * Gets the account code with the given id
   * @param accountCodeId The id of the account code to get
   * @param organizationId The organization the user is currently in
   * @returns The account code with the given id
   */
  static async getSingleAccountCode(accountCodeId: string, organization: Organization): Promise<AccountCode> {
    const accountCode = await prisma.account_Code.findUnique({
      where: { accountCodeId },
      ...getAccountCodeQueryArgs(organization.organizationId)
    });

    if (!accountCode) throw new NotFoundException('Account Code', accountCodeId);
    if (accountCode.dateDeleted) throw new DeletedException('Account Code', accountCode.name);
    if (accountCode.organizationId !== organization.organizationId)
      throw new AccessDeniedException('You do not have access to this Account Code');

    return accountCodeTransformer(accountCode);
  }

  /**
   * Adds a reimbursement status with type pending finance to the given reimbursement request
   *
   * @param reimbursementRequestId The id of the reimbursement request to approve
   * @param submitter The person approving the reimbursement request
   * @param organizationId The organization the user is currently in
   * @returns The Pending Finance reimbursement status
   */
  static async markPendingFinance(
    user: User,
    reimbursementRequestId: string,
    organization: Organization
  ): Promise<ReimbursementStatus> {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      include: {
        reimbursementStatuses: true,
        notificationSlackThreads: true,
        receiptPictures: true
      }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    await validateUserEditRRPermissions(user, reimbursementRequest, organization.organizationId);

    if (
      reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.SABO_SUBMITTED)
    ) {
      throw new HttpException(400, 'This reimbursement request has already been submitted to sabo!');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.REIMBURSED)) {
      throw new HttpException(400, 'This reimbursement request has already been reimbursed');
    }

    if (reimbursementRequest.receiptPictures.length === 0) {
      throw new HttpException(
        400,
        'At least one receipt picture is required to mark a reimbursement request as pending finance'
      );
    }

    if (!reimbursementRequest.dateOfExpense) {
      throw new HttpException(400, 'Date of expense is required to mark a reimbursement request as pending finance');
    }

    const comment = `${user.firstName}  ${user.lastName} Marked Pending Finance`;

    await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: user.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    const updatedReimbursementStatus = await prisma.reimbursement_Status.create({
      data: {
        reimbursementRequestId: reimbursementRequest.reimbursementRequestId,
        type: ReimbursementStatusType.PENDING_FINANCE,
        userId: user.userId
      },
      ...getReimbursementStatusQueryArgs(organization.organizationId)
    });

    try {
      await sendReimbursementRequestPendingFinanceNotification(
        reimbursementRequest.notificationSlackThreads,
        reimbursementRequest.assigneeId
      );
    } catch (e: unknown) {
      console.error('Error sending reimbursement request pending finance notification:', e);
    }

    return reimbursementStatusTransformer(updatedReimbursementStatus);
  }

  static async financeRequestReimbursementRequestChanges(
    user: User,
    reimbursementRequestId: string,
    organization: Organization
  ): Promise<ReimbursementStatus> {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId },
      include: {
        reimbursementStatuses: true,
        notificationSlackThreads: true
      }
    });

    if (!reimbursementRequest) throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    if (reimbursementRequest.dateDeleted) {
      throw new DeletedException('Reimbursement Request', reimbursementRequestId);
    }
    if (reimbursementRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Reimbursement Request');

    await validateUserEditRRPermissions(user, reimbursementRequest, organization.organizationId);

    if (
      reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.SABO_SUBMITTED)
    ) {
      throw new HttpException(400, 'This reimbursement request has already been submitted to sabo!');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.DENIED)) {
      throw new HttpException(400, 'This reimbursement request has already been denied');
    }

    if (reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.REIMBURSED)) {
      throw new HttpException(400, 'This reimbursement request has already been reimbursed');
    }

    const pendingFinanceStatus = reimbursementRequest.reimbursementStatuses.find(
      (status) => status.type === ReimbursementStatusType.PENDING_FINANCE
    );

    if (!pendingFinanceStatus) throw new HttpException(400, 'Reimbursement Request Must Be Pending Finance');

    const deletedStatus = await prisma.reimbursement_Status.delete({
      where: {
        reimbursementStatusId: pendingFinanceStatus.reimbursementStatusId
      },
      ...getReimbursementStatusQueryArgs(organization.organizationId)
    });

    try {
      await sendReimbursementRequestChangesRequestedNotification(reimbursementRequest.notificationSlackThreads, user.userId);
    } catch (e: unknown) {
      console.error('Error sending reimbursement request changes requested notification:', e);
    }

    return reimbursementStatusTransformer(deletedStatus);
  }

  /**
   * Creates an index code with the given name and current user.
   * @param name name of the index code
   * @param code code of the index code
   * @param user the user creating the index code
   * @param organization the organization the user is
   * @returns transformed created index code
   */
  static async createIndexCode(name: string, code: string, user: User, organization: Organization): Promise<IndexCode> {
    const indexCode = await prisma.index_Code.create({
      data: {
        userCreated: { connect: { userId: user.userId } },
        name,
        code,
        organization: { connect: { organizationId: organization.organizationId } }
      },
      ...getIndexCodeQueryArgs(organization.organizationId)
    });
    return indexCodeTransformer(indexCode);
  }

  /**
   * Gets the index code with the given id
   * @param indexCodeId The id of the index code to get
   * @param organizationId The organization the user is currently in
   * @returns The index code with the given id
   */
  static async getSingleIndexCode(indexCodeId: string, organization: Organization): Promise<IndexCode> {
    const indexCode = await prisma.index_Code.findUnique({
      where: { indexCodeId },
      ...getIndexCodeQueryArgs(organization.organizationId)
    });

    if (!indexCode) throw new NotFoundException('Index Code', indexCodeId);
    if (indexCode.dateDeleted) throw new DeletedException('Index Code', indexCodeId);
    if (indexCode.organizationId !== organization.organizationId)
      throw new AccessDeniedException('You do not have access to this index code');

    return indexCodeTransformer(indexCode);
  }

  /**
   * Gets all index codes in the database
   * @param organizationId the organization id of the current user
   * @returns All of the index codes
   */
  static async getAllIndexCodes(organization: Organization): Promise<IndexCode[]> {
    const indexCodes = await prisma.index_Code.findMany({
      where: { dateDeleted: null, organizationId: organization.organizationId },
      ...getIndexCodeQueryArgs(organization.organizationId)
    });
    return indexCodes.map(indexCodeTransformer);
  }

  /**
   * Edit an index code
   * @param user the user editing the index code
   * @param organization the organization the user is in
   * @param indexCodeId the id of the index code to edit
   * @param name the new name of the index code
   * @param code the new code of the index code
   * @returns the updated index code
   */
  static async editIndexCode(user: User, organization: Organization, indexCodeId: string, name: string, code: string) {
    const indexCode = await prisma.index_Code.findUnique({
      where: {
        indexCodeId
      }
    });

    if (!userHasPermission(user.userId, organization.organizationId, isAdmin)) {
      throw new AccessDeniedAdminOnlyException('Only admins can update index codes');
    }

    if (!indexCode) {
      throw new NotFoundException('Index Code', indexCodeId);
    }

    if (indexCode.dateDeleted) {
      throw new DeletedException('Index Code', indexCodeId);
    }

    if (indexCode.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Index Code');
    }

    const updatedCode = await prisma.index_Code.update({
      where: { indexCodeId },
      data: {
        name,
        code
      },
      ...getIndexCodeQueryArgs(organization.organizationId)
    });

    return indexCodeTransformer(updatedCode);
  }

  /**
   * Deletes the index code
   *
   * @param indexCodeid the requested index code to be deleted
   * @param submitter the user deleting the index code
   * @param organizationId the organization the user is currently in
   * @returns the 'deleted' index code
   */
  static async deleteIndexCode(indexCodeId: string, user: User, organization: Organization): Promise<IndexCode> {
    const indexCode = await ReimbursementRequestService.getSingleIndexCode(indexCodeId, organization);

    if (
      indexCode.userCreated.userId !== user.userId &&
      !(await isUserLeadOrHeadOfFinanceTeam(user, organization.organizationId))
    )
      throw new AccessDeniedException(
        'You do not have access to delete this index code, index codes can only be deleted by their creator or finance leads and above'
      );

    const deletedIndexCode = await prisma.index_Code.update({
      where: { indexCodeId: indexCode.indexCodeId },
      data: { dateDeleted: new Date() },
      ...getIndexCodeQueryArgs(organization.organizationId)
    });

    return indexCodeTransformer(deletedIndexCode);
  }

  /**
   * Creates an other reimbursement product reason with the given name, budget and current user.
   * @param name name of the other reimbursement product reason
   * @param budget budget of other reimbursement product reason in cents
   * @param indexCodeId index code id of the index code the other reimbursement product reason falls under
   * @param user the user creating the other reimbursement product reason
   * @returns transformed created other reimbursement product reason
   */
  static async createOtherReasonReimbursementProduct(
    name: string,
    budget: number,
    indexCodeId: string,
    accountCodeIds: string[],
    user: User,
    organization: Organization
  ): Promise<OtherProductReason> {
    const indexCode = await ReimbursementRequestService.getSingleIndexCode(indexCodeId, organization);

    if (!indexCode) throw new NotFoundException('Index Code', indexCodeId);

    const otherReimbursementProductReason = await prisma.reimbursement_Product_Other_Reason.create({
      data: {
        name,
        budget,
        userCreated: { connect: { userId: user.userId } },
        indexCode: { connect: { indexCodeId: indexCode.indexCodeId } },
        accountCodes: { connect: accountCodeIds.map((accountCodeId) => ({ accountCodeId })) }
      },
      ...getReimbursementProductOtherReasonQueryArgs(organization.organizationId)
    });
    return otherProductReasonTransformer(otherReimbursementProductReason);
  }

  /**
   * Gets the other reimursement product reason with the given id
   * @param otherReimbursementProductReasonId The id of the other reimursement product reason to get
   * @param organizationId The organization the user is currently in
   * @returns The other reimursement product reason with the given id
   */
  static async getSingleOtherReimbursementProductReason(
    otherReimbursementProductReasonId: string,
    organization: Organization
  ): Promise<OtherProductReason> {
    const otherProductReason = await prisma.reimbursement_Product_Other_Reason.findUnique({
      where: { otherReimbursementProductReasonId },
      ...getReimbursementProductOtherReasonQueryArgs(organization.organizationId)
    });

    if (!otherProductReason)
      throw new NotFoundException('Reimbursement Product Other Reason', otherReimbursementProductReasonId);
    if (otherProductReason.dateDeleted)
      throw new DeletedException('Reimbursement Product Other Reason', otherReimbursementProductReasonId);

    return otherProductReasonTransformer(otherProductReason);
  }

  /**
   * Gets all other reimbursement product reasons in the database
   * @param organizationId the organization id of the current user
   * @returns All of the other reimbursement product reasons
   */
  static async getAllOtherReimbursementProductReasons(organization: Organization): Promise<OtherProductReason[]> {
    const otherReimbursementProductReasons = await prisma.reimbursement_Product_Other_Reason.findMany({
      where: { dateDeleted: null },
      ...getReimbursementProductOtherReasonQueryArgs(organization.organizationId)
    });
    return otherReimbursementProductReasons.map(otherProductReasonTransformer);
  }

  /**
   * Deletes the other reimursement product reason
   *
   * @param otherProductReasonId the requested other reimursement product reason to be deleted
   * @param user the user deleting the other reimursement product reason
   * @param organizationId the organization the user is currently in
   * @returns the 'deleted' other reimursement product reason
   */
  static async deleteOtherReimbursementProductReason(
    otherProductReasonId: string,
    user: User,
    organization: Organization
  ): Promise<OtherProductReason> {
    const otherProductReason = await ReimbursementRequestService.getSingleOtherReimbursementProductReason(
      otherProductReasonId,
      organization
    );

    if (
      otherProductReason.userCreated.userId !== user.userId &&
      !(await isUserLeadOrHeadOfFinanceTeam(user, organization.organizationId))
    )
      throw new AccessDeniedException(
        'You do not have access to delete this other reimbursement product reason, other reimbursement product reasons can only be deleted by their creator or finance leads and above'
      );

    const deletedOtherProductReason = await prisma.reimbursement_Product_Other_Reason.update({
      where: { otherReimbursementProductReasonId: otherProductReason.otherProductReasonId },
      data: { dateDeleted: new Date() },
      ...getReimbursementProductOtherReasonQueryArgs(organization.organizationId)
    });

    return otherProductReasonTransformer(deletedOtherProductReason);
  }

  /**
   * Creates a new comment for a reimbursement request
   *
   * @param currentUser The user creating the comment
   * @param organization The organization context for the request
   * @param comment The comment text content
   * @param reimbursementRequestId The ID of the reimbursement request to comment on
   * @returns The newly created reimbursement request comment
   * @throws NotFoundException if the reimbursement request doesn't exist in the organization
   */
  static async createReimbursementRequestComment(
    currentUser: User,
    organization: Organization,
    comment: string,
    reimbursementRequestId: string
  ) {
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: { reimbursementRequestId, organizationId: organization.organizationId, dateDeleted: null },
      include: { notificationSlackThreads: true }
    });

    if (!reimbursementRequest) {
      throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    }

    const createdComment = await prisma.reimbursement_Request_Comment.create({
      data: {
        userCreatedId: currentUser.userId,
        reimbursementRequestId,
        comment
      },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    // send slack notification

    const tagRegex = /@([A-Z][a-z'-]+(?:[A-Z][a-z'-]+)?)/gu;

    // find all names that have been tagged in the @FirstLast format
    const taggedNames = [...comment.matchAll(tagRegex)].map((match) => match[1]);

    // spliot the tagged names into first and last names
    const splitTaggedNames = taggedNames.map((name) => {
      const match = name.match(/([A-Z][a-z'-]+)([A-Z][a-z'-]+)/);

      if (match) {
        return {
          firstName: match[1],
          lastName: match[2]
        };
      }

      // possible for user to have one name
      return {
        firstName: name,
        lastName: ''
      };
    });

    // create slack-formatted tags for each tagged user
    const tags: string[] = [];

    for (const taggedName of splitTaggedNames) {
      const { firstName, lastName } = taggedName;

      const taggedUser = await prisma.user.findFirst({
        where: {
          firstName: { equals: firstName, mode: 'insensitive' },
          lastName: { equals: lastName, mode: 'insensitive' },
          organizations: {
            some: {
              organizationId: organization.organizationId
            }
          }
        },
        include: { userSettings: true }
      });

      tags.push(taggedUser?.userSettings?.slackId ? `<@${taggedUser.userSettings.slackId}>` : `${firstName} ${lastName}`);
    }

    let replacementIndex = 0;

    // replace the @FirstLast tags with the slack tags
    comment = comment.replace(tagRegex, (_match, _group) => {
      const replacement = tags[replacementIndex];

      replacementIndex++;

      return replacement;
    });

    // if there is no more than one tag (the creator), tag stakeholders
    if (tags.length < 2) {
      const stakeholders = await prisma.user.findMany({
        where: {
          organizations: {
            some: {
              organizationId: organization.organizationId
            }
          },
          userSettings: { slackId: { not: '' } },
          OR: [
            { reimbursementRequestComments: { some: { reimbursementRequestId } } },
            { reimbursementRequests: { some: { reimbursementRequestId } } }
          ]
        },
        include: { userSettings: true }
      });

      tags.push(
        ...stakeholders.map((user) =>
          user.userSettings?.slackId && !tags.includes(`<@${user.userSettings.slackId}>`)
            ? `<@${user.userSettings.slackId}>`
            : ''
        )
      );

      // dont retag the creator of the comment
      const [, ...restOfTags] = tags;

      comment += ` ${[...new Set(restOfTags)].join(' ')}`;
    }

    try {
      await sendThreadResponse(reimbursementRequest.notificationSlackThreads, comment);
    } catch (e: unknown) {
      console.error('Error sending thread response:', e);
    }

    return reimbursementRequestCommentTransformer(createdComment);
  }

  /**
   * Updates the comment for an existing new comment on a reimbursement request
   *
   * @param editer The user updating the comment
   * @param organization The organization context for the request
   * @param comment The comment text content
   * @param commentId The ID of the reimbursement request comment
   * @returns The updated reimbursement request comment
   * @throws NotFoundException if the comment doesn't exist
   * @throws HttpException if the comment is the same as the current comment
   */
  static async editReimbursementRequestComment(
    editer: User,
    organization: Organization,
    comment: string,
    commentId: string
  ) {
    const reimbursementRequestComment = await prisma.reimbursement_Request_Comment.findUnique({
      where: { reimbursementRequestCommentId: commentId, dateDeleted: null }
    });

    if (!(await userHasPermission(editer.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedException('Only members of an organization can edit comments');
    }

    if (!reimbursementRequestComment) {
      throw new NotFoundException('Reimbursement Request Comment', commentId);
    }

    if (reimbursementRequestComment.comment === comment) {
      throw new HttpException(400, 'New comment matches existing content');
    }

    const editedComment = await prisma.reimbursement_Request_Comment.update({
      where: { reimbursementRequestCommentId: commentId },
      data: { comment },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    return reimbursementRequestCommentTransformer(editedComment);
  }

  /**
   * Deletes the comment for an existing comment on a reimbursement request
   *
   * @param deleter the user deleting the comment
   * @param organization The organization context for the request
   * @param commentId The ID of the reimbursement request comment
   * @returns The deleted reimbursement request comment
   * @throws NotFoundException if the comment doesn't exist
   */
  static async deleteReimbursementRequestComment(deleter: User, organization: Organization, commentId: string) {
    const reimbursementRequestComment = await prisma.reimbursement_Request_Comment.findUnique({
      where: { reimbursementRequestCommentId: commentId, dateDeleted: null }
    });

    if (!(await userHasPermission(deleter.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedException('Only members of an organization can delete comments');
    }

    if (!reimbursementRequestComment) {
      throw new NotFoundException('Reimbursement Request Comment', commentId);
    }

    const deletedComment = await prisma.reimbursement_Request_Comment.update({
      where: { reimbursementRequestCommentId: commentId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId },
      ...getReimbursementRequestCommentQueryArgs(organization.organizationId)
    });

    return reimbursementRequestCommentTransformer(deletedComment);
  }

  /**
   *
   * Edits the other reimbursement product reason
   * @param otherReimbursementProductReasonId id of the other reimbursement product reason being edited
   * @param org the organization the user is currently in
   * @param editor the user editing the reason
   * @param name the updated name of the other reimbursement product reason
   * @param budget the updated budget of the other reimbursement product reason
   * @param indexCodeId the updated index code of the other reimbursement product reason
   * @param accountCodeIds the updated account codes of the other reimbursement product reason
   * @returns the other reimbursement product reason with the given id
   */

  static async editOtherReimbursementProductReason(
    otherReimbursementProductReasonId: string,
    org: Organization,
    editor: User,
    name: string,
    budget: number,
    indexCodeId: string,
    accountCodeIds: string[]
  ): Promise<OtherProductReason> {
    if (!(await userHasPermission(editor.userId, org.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads can edit other reimbursement product reasons.');
    }

    const otherProductReason = await prisma.reimbursement_Product_Other_Reason.findUnique({
      where: { otherReimbursementProductReasonId },
      ...getReimbursementProductOtherReasonQueryArgs(org.organizationId)
    });

    if (!otherProductReason)
      throw new NotFoundException('Reimbursement Product Other Reason', otherReimbursementProductReasonId);
    if (otherProductReason.dateDeleted)
      throw new DeletedException('Reimbursement Product Other Reason', otherReimbursementProductReasonId);

    const indexCode = await prisma.index_Code.findUnique({
      where: { indexCodeId }
    });

    if (!indexCode) throw new NotFoundException('Index Code', indexCodeId);
    if (indexCode.dateDeleted) throw new DeletedException('Index Code', indexCodeId);

    const editedReason = await prisma.reimbursement_Product_Other_Reason.update({
      where: { otherReimbursementProductReasonId },
      data: {
        budget,
        indexCodeId,
        name,
        accountCodes: { set: accountCodeIds.map((accountCodeId) => ({ accountCodeId })) }
      },
      ...getReimbursementProductOtherReasonQueryArgs(org.organizationId)
    });

    return otherProductReasonTransformer(editedReason);
  }
}
