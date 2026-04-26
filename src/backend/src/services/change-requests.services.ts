import {
  ActivationChangeRequest,
  BudgetChangeRequest,
  ChangeRequest,
  isAdmin,
  isGuest,
  isLeadership,
  isProjectWbs,
  ProjectProposedChangesCreateArgs,
  StageGateChangeRequest,
  StandardChangeRequest,
  WbsNumber,
  wbsPipe,
  WorkPackageProposedChangesCreateArgs,
  User,
  isHead
} from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  AccessDeniedMemberException,
  HttpException,
  NotFoundException,
  DeletedException,
  InvalidOrganizationException
} from '../utils/errors.utils.js';
import changeRequestTransformer, {
  changeRequestManyTransformer,
  guestChangeRequestTransformer
} from '../transformers/change-requests.transformer.js';
import {
  allChangeRequestsReviewed,
  validateProposedChangesFields,
  applyProjectProposedChanges,
  applyWorkPackageProposedChanges,
  validateNoUnreviewedOpenCRs,
  sendCRSubmitterReviewedNotification,
  validateWbsElement,
  validateNoUnreviewedOpenOtherReasonCRs,
  validateNoUnreviewedOpenAccountCodeCRs
} from '../utils/change-requests.utils.js';
import { CR_Type, WBS_Element_Status, Prisma, Organization } from '@prisma/client';
import { getUserFullName, getUsersWithSettings, userHasPermission } from '../utils/users.utils.js';
import { throwIfUncheckedDescriptionBullets } from '../utils/description-bullets.utils.js';
import { buildChangeDetail } from '../utils/changes.utils.js';
import {
  addSlackThreadsToChangeRequest,
  sendAndGetSlackCRNotifications,
  sendSlackCRStatusToThread,
  sendSlackRequestedReviewNotification
} from '../utils/slack.utils.js';
import {
  ChangeRequestWithProjectAndWorkPackageQueryArgs,
  getChangeRequestQueryArgs,
  getChangeRequestWithProjectAndWorkPackageQueryArgs,
  getGuestChangeRequestQueryArgs,
  getManyChangeRequestQueryArgs
} from '../prisma-query-args/change-requests.query-args.js';
import { sendCrRequestReviewPopUp, sendCrReviewedPopUp } from '../utils/pop-up.utils.js';
import { GuestChangeRequest } from '../../../shared/src/types/change-request-types.js';

export default class ChangeRequestsService {
  /**
   * Gets the change request for the given Id
   * @param crId The change request id
   * @param organization The organization the user is currently in
   * @returns The change request with the given id
   * @throws if the change request does not exist
   */
  static async getChangeRequestByID(crId: string, organization: Organization): Promise<ChangeRequest> {
    const changeRequest = await prisma.change_Request.findUnique({
      where: { crId },
      ...getChangeRequestWithProjectAndWorkPackageQueryArgs(organization.organizationId)
    });

    if (!changeRequest) throw new NotFoundException('Change Request', crId);
    if (changeRequest.dateDeleted) throw new DeletedException('Change Request', crId);
    if (changeRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Change Request');

    return changeRequestTransformer(changeRequest);
  }

  /**
   * Gets all the change requests in the database for the given organization
   * @param organization The organization the user is currently in
   * @returns All of the change requests
   */
  static async getAllChangeRequests(organization: Organization, carId?: string): Promise<ChangeRequest[]> {
    const changeRequests = await prisma.change_Request.findMany({
      where: {
        dateDeleted: null,
        organizationId: organization.organizationId,
        ...(carId && { wbsElement: { OR: [{ project: { carId } }, { workPackage: { project: { carId } } }] } })
      },
      ...getManyChangeRequestQueryArgs(organization.organizationId)
    });

    return changeRequests.map(changeRequestManyTransformer);
  }

  /**
   * Gets all the change requests in the database for the given organization, tailored to the guest cr page
   * @param organization The organization the user is currently in
   * @returns All of the change requests
   */
  static async getAllGuestChangeRequests(organization: Organization): Promise<GuestChangeRequest[]> {
    const changeRequests = await prisma.change_Request.findMany({
      where: { dateDeleted: null, organizationId: organization.organizationId },
      ...getGuestChangeRequestQueryArgs(organization.organizationId)
    });

    return changeRequests.map(guestChangeRequestTransformer);
  }

  /**
   * Gets a user's change requests that they have been requested reviewer for or, if they are leadership, their teams change requests as well
   * @param user The user to get their to review change requests for
   * @param organization The organization the user is in
   * @returns The user's change requests for them to review
   */
  static async getToReviewChangeRequests(user: User, organization: Organization, carId?: string): Promise<ChangeRequest[]> {
    const wbsOr: Prisma.WBS_ElementWhereInput[] = [{ managerId: user.userId }, { leadId: user.userId }];

    if (await userHasPermission(user.userId, organization.organizationId, isLeadership)) {
      wbsOr.push({
        project: {
          teams: {
            some: {
              OR: [
                { headId: user.userId },
                { leads: { some: { userId: user.userId } } },
                { members: { some: { userId: user.userId } } }
              ]
            }
          }
        }
      });
    }

    const queryOr: Prisma.Change_RequestWhereInput[] = [
      { requestedReviewers: { some: { userId: user.userId } } },
      { wbsElement: { OR: wbsOr } }
    ];

    const changeRequests = await prisma.change_Request.findMany({
      where: {
        dateDeleted: null,
        AND: [
          { dateReviewed: null },
          {
            NOT: [
              { type: { in: [CR_Type.ACTIVATION, CR_Type.STAGE_GATE, CR_Type.LEADERSHIP] } },
              { submitterId: user.userId }
            ]
          },
          ...(carId ? [{ wbsElement: { OR: [{ project: { carId } }, { workPackage: { project: { carId } } }] } }] : [])
        ],
        organizationId: organization.organizationId,
        OR: queryOr
      },
      ...getManyChangeRequestQueryArgs(organization.organizationId)
    });

    return changeRequests.map(changeRequestManyTransformer);
  }

  /**
   * Gets all the unreviewed change requests for the current user
   * @param user The user to get the change requests for
   * @param wbsnum Optional wbs number to filter the request for
   * @param organization The organization the user is currently in
   * @returns The users unreviewed change requests
   */
  static async getUnreviewedChangeRequests(
    user: User,
    wbsnum: WbsNumber | undefined,
    organization: Organization,
    carId?: string
  ): Promise<ChangeRequest[]> {
    const queryAnd: Prisma.Change_RequestWhereInput[] = [{ dateReviewed: null }, { changes: { none: {} } }];

    if (wbsnum) queryAnd.push({ wbsElementId: (await validateWbsElement(wbsnum, organization)).wbsElementId });
    else {
      queryAnd.push({ submitterId: user.userId });
      queryAnd.push(
        ...(carId ? [{ wbsElement: { OR: [{ project: { carId } }, { workPackage: { project: { carId } } }] } }] : [])
      );
    }

    const changeRequests = await prisma.change_Request.findMany({
      where: {
        organizationId: organization.organizationId,
        AND: queryAnd,
        dateDeleted: null
      },
      ...getManyChangeRequestQueryArgs(organization.organizationId)
    });

    return changeRequests.map(changeRequestManyTransformer);
  }

  /**
   * Gets the users approved change requests from the last five days
   * @param user The user to get their approved change requests for
   * @param wbsnum Optional wbs number to filter the request for
   * @param organization The organization the user is currently in
   * @returns The users approved change requests
   */
  static async getApprovedChangeRequests(
    user: User,
    wbsnum: WbsNumber | undefined,
    organization: Organization,
    carId?: string
  ): Promise<ChangeRequest[]> {
    const currentDate = new Date();
    const fiveDaysAgo = new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 5);
    const queryAnd = wbsnum
      ? [{ wbsElementId: (await validateWbsElement(wbsnum, organization)).wbsElementId }]
      : [
          { submitterId: user.userId },
          ...(carId ? [{ wbsElement: { OR: [{ project: { carId } }, { workPackage: { project: { carId } } }] } }] : [])
        ];

    const changeRequests = await prisma.change_Request.findMany({
      where: {
        organizationId: organization.organizationId,
        OR: [
          { dateReviewed: { gte: fiveDaysAgo } },
          {
            type: { in: [CR_Type.ACTIVATION, CR_Type.STAGE_GATE, CR_Type.LEADERSHIP, CR_Type.BUDGET] },
            dateSubmitted: { gte: fiveDaysAgo }
          }
        ],
        dateDeleted: null,
        AND: queryAnd
      },
      ...getManyChangeRequestQueryArgs(organization.organizationId)
    });

    return changeRequests.map(changeRequestManyTransformer);
  }

  /**
   * Reviews the change request for the given Id and automates any changes that are made
   * @param reviewer The user reviewing the change request
   * @param crId the change request id
   * @param reviewNotes any notes passed in by the reviewer
   * @param accepted whether or not the change request is accepted
   * @param organization the organization the user is currently in
   * @returns the id of the reviewed change request
   */
  static async reviewChangeRequest(
    reviewer: User,
    crId: string,
    reviewNotes: string,
    accepted: boolean,
    organization: Organization
  ): Promise<string> {
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      ...getChangeRequestWithProjectAndWorkPackageQueryArgs(organization.organizationId)
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.accepted) throw new HttpException(400, `This change request is already approved!`);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.wbsElement?.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(foundCR.wbsElement));
    if (foundCR.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Change Request');

    const isHeadOrAdmin = await userHasPermission(reviewer.userId, organization.organizationId, isHead);

    if (reviewer.userId === foundCR.submitterId && !isHeadOrAdmin)
      throw new AccessDeniedException("You can't review your own change request!");

    if (foundCR.requestedReviewers.length > 0) {
      const isRequestedReviewer = foundCR.requestedReviewers.some((user) => user.userId === reviewer.userId);
      if (!isRequestedReviewer && !isHeadOrAdmin) {
        throw new AccessDeniedException('Only the requested reviewer or a head/admin can review this change request!');
      }
    } else if (!isHeadOrAdmin) {
      throw new AccessDeniedMemberException('review change requests');
    }

    if (accepted && foundCR.type === CR_Type.STAGE_GATE) {
      await this.reviewStageGateChangeRequest(foundCR, reviewer);
    } else if (foundCR.type === CR_Type.ACTIVATION && foundCR.activationChangeRequest && accepted) {
      await this.reviewActivationChangeRequest(foundCR, reviewer);
    } else if (foundCR.type === CR_Type.BUDGET && foundCR.budgetChangeRequest && accepted) {
      await this.reviewBudgetChangeRequest(foundCR, reviewer);
    } else if (foundCR.type === CR_Type.STANDARD && accepted) {
      await this.reviewStandardChangeRequest(foundCR, reviewer, organization);
    }

    const updated = await prisma.change_Request.update({
      where: { crId },
      data: {
        reviewer: { connect: { userId: reviewer.userId } },
        reviewNotes,
        accepted,
        dateReviewed: new Date()
      },
      include: {
        ...getChangeRequestQueryArgs(organization.organizationId).include,
        notificationSlackThreads: true
      }
    });

    await sendCRSubmitterReviewedNotification(updated);
    await sendCrReviewedPopUp(foundCR, updated.submitter, accepted, organization.organizationId);
    await sendSlackCRStatusToThread(updated.notificationSlackThreads, foundCR.crId, foundCR.identifier, accepted);

    return updated.crId;
  }

  /**
   * Reviews a standard change request, applying wbs proposed changes if present
   * @param foundCR the change request to be reviewed
   * @param reviewer the user reviewing the change request
   * @param organization the organization the user is currently in
   */
  private static async reviewStandardChangeRequest(
    foundCR: Prisma.Change_RequestGetPayload<ChangeRequestWithProjectAndWorkPackageQueryArgs>,
    reviewer: User,
    organization: Organization
  ): Promise<void> {
    if (!foundCR.wbsProposedChanges) return;

    const { wbsProposedChanges } = foundCR;
    const { workPackageProposedChanges, projectProposedChanges } = wbsProposedChanges;

    const associatedProject = foundCR.wbsElement?.project ?? null;
    const associatedWorkPackage = foundCR.wbsElement?.workPackage ?? null;

    // wbsNum of the project — needed when creating new work packages under a project CR
    const projectWbsNum: WbsNumber | null = associatedProject
      ? {
          carNumber: foundCR.wbsElement!.carNumber,
          projectNumber: foundCR.wbsElement!.projectNumber,
          workPackageNumber: foundCR.wbsElement!.workPackageNumber
        }
      : null;

    if (workPackageProposedChanges) {
      // CR is on a work package — either edit it or create it under the project
      await applyWorkPackageProposedChanges(
        wbsProposedChanges,
        workPackageProposedChanges,
        associatedWorkPackage ? null : projectWbsNum, // existingWbsNum only when creating new WP
        associatedWorkPackage,
        reviewer,
        foundCR.crId,
        organization
      );
    } else if (projectProposedChanges) {
      // CR is on a project — edit it or create it
      await applyProjectProposedChanges(
        wbsProposedChanges,
        projectProposedChanges,
        associatedProject,
        reviewer,
        foundCR.crId,
        foundCR.wbsElement?.carNumber ?? 0,
        organization
      );
    }
  }

  /**
   * Reviews the stage gate change request and automates any changes that are made
   * @param foundCR the change request to be reviewed
   * @param reviewer the user reviewing the change request
   */
  static async reviewStageGateChangeRequest(
    foundCR: Prisma.Change_RequestGetPayload<ChangeRequestWithProjectAndWorkPackageQueryArgs>,
    reviewer: User
  ): Promise<void> {
    if (!foundCR.wbsElement?.workPackage) {
      throw new HttpException(400, 'Stage gate can only be made on work packages!');
    }

    throwIfUncheckedDescriptionBullets(foundCR.wbsElement.descriptionBullets);

    const shouldChangeStatus = foundCR.wbsElement.status !== WBS_Element_Status.COMPLETE;
    const changesList = [];
    if (shouldChangeStatus) {
      changesList.push({
        changeRequestId: foundCR.crId,
        implementerId: reviewer.userId,
        detail: buildChangeDetail('status', foundCR.wbsElement.status, WBS_Element_Status.COMPLETE)
      });
    }

    await prisma.work_Package.update({
      where: { wbsElementId: foundCR.wbsElement.wbsElementId },
      data: {
        wbsElement: {
          update: {
            status: WBS_Element_Status.COMPLETE,
            changes: { createMany: { data: changesList } }
          }
        }
      }
    });
  }

  /**
   * Reviews the activation change request and automates any changes that are made
   * @param foundCR the change request to be reviewed
   * @param reviewer the user reviewing the change request
   */
  static async reviewActivationChangeRequest(
    foundCR: Prisma.Change_RequestGetPayload<ChangeRequestWithProjectAndWorkPackageQueryArgs>,
    reviewer: User
  ): Promise<void> {
    const { activationChangeRequest } = foundCR;
    if (!activationChangeRequest) throw new HttpException(400, 'No activation change request found!');

    const shouldUpdateProjLead = activationChangeRequest.leadId !== foundCR.wbsElement?.leadId;
    const shouldUpdateProjManager = activationChangeRequest.leadId !== foundCR.wbsElement?.managerId;
    const shouldChangeStartDate =
      activationChangeRequest.startDate.setHours(0, 0, 0, 0) !==
      foundCR.wbsElement?.workPackage?.startDate.setHours(0, 0, 0, 0);
    const changes = [];

    if (shouldUpdateProjLead) {
      const oldPL = await getUserFullName(foundCR.wbsElement?.leadId ?? null);
      const newPL = await getUserFullName(activationChangeRequest.leadId);
      changes.push({
        changeRequestId: foundCR.crId,
        implementerId: reviewer.userId,
        wbsElementId: foundCR.wbsElementId,
        detail: buildChangeDetail('Project Lead', oldPL, newPL)
      });
    }

    if (shouldUpdateProjManager) {
      const oldPM = await getUserFullName(foundCR.wbsElement?.managerId ?? null);
      const newPM = await getUserFullName(activationChangeRequest.managerId);
      changes.push({
        changeRequestId: foundCR.crId,
        implementerId: reviewer.userId,
        wbsElementId: foundCR.wbsElementId,
        detail: buildChangeDetail('Project Manager', oldPM, newPM)
      });
    }

    if (shouldChangeStartDate) {
      changes.push({
        changeRequestId: foundCR.crId,
        implementerId: reviewer.userId,
        wbsElementId: foundCR.wbsElementId,
        detail: buildChangeDetail(
          'Start Date',
          foundCR.wbsElement?.workPackage?.startDate.toLocaleDateString() || 'null',
          activationChangeRequest.startDate.toLocaleDateString()
        )
      });
    }

    changes.push({
      changeRequestId: foundCR.crId,
      implementerId: reviewer.userId,
      wbsElementId: foundCR.wbsElementId,
      detail: buildChangeDetail('status', foundCR.wbsElement?.status ?? '', WBS_Element_Status.ACTIVE)
    });

    await prisma.change.createMany({ data: changes });

    await prisma.wBS_Element.update({
      where: { wbsElementId: foundCR.wbsElementId ?? '' },
      data: {
        leadId: activationChangeRequest.leadId,
        managerId: activationChangeRequest.managerId,
        workPackage: { update: { startDate: activationChangeRequest.startDate } },
        status: WBS_Element_Status.ACTIVE
      }
    });
  }

  /**
   * Reviews the budget change request and automates any changes that are made
   * @param foundCR the change request to be reviewed
   * @param reviewer the user reviewing the change request
   */
  static async reviewBudgetChangeRequest(
    foundCR: Prisma.Change_RequestGetPayload<ChangeRequestWithProjectAndWorkPackageQueryArgs>,
    reviewer: User
  ): Promise<void> {
    const { budgetChangeRequest } = foundCR;
    if (!budgetChangeRequest) throw new HttpException(400, 'No budget change request found!');
    if (!foundCR.accountCode) {
      throw new HttpException(400, 'Budget changes can only be made on categories and account codes!');
    }

    if (foundCR.category) {
      const changesList = [];
      changesList.push({
        changeRequestId: foundCR.crId,
        implementerId: reviewer.userId,
        detail: buildChangeDetail(
          'budget',
          foundCR.category.budget.toString(),
          budgetChangeRequest.proposedBudget.toString()
        )
      });

      await prisma.change.createMany({ data: changesList });

      await prisma.reimbursement_Product_Other_Reason.update({
        where: { otherReimbursementProductReasonId: foundCR.categoryId ?? '' },
        data: { budget: budgetChangeRequest.proposedBudget }
      });
    }

    const changesList = [];
    changesList.push({
      changeRequestId: foundCR.crId,
      implementerId: reviewer.userId,
      detail: buildChangeDetail(
        'budget',
        foundCR.accountCode.amount ? foundCR.accountCode.amount.toString() : '',
        budgetChangeRequest.proposedBudget.toString()
      )
    });

    await prisma.change.createMany({ data: changesList });

    await prisma.account_Code.update({
      where: { accountCodeId: foundCR.accountCodeId ?? '' },
      data: { amount: budgetChangeRequest.proposedBudget }
    });
  }

  /**
   * Validates and creates an activation change request
   * @param submitter The user creating the cr
   * @param carNumber the car number for the wbs element
   * @param projectNumber the project number for the wbs element
   * @param workPackageNumber the work package number for the wbs element
   * @param leadId the id of the project lead
   * @param managerId the id of the project manager
   * @param startDate the start date of the work package/project
   * @param confirmDetails whether or not to confirm
   * @param organization the organization the user is currently in
   * @returns the id of the created cr
   */
  static async createActivationChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    leadId: string,
    managerId: string,
    startDate: Date,
    confirmDetails: boolean,
    organization: Organization
  ): Promise<string> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create activation change requests');

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: { carNumber, projectNumber, workPackageNumber, organizationId: organization.organizationId }
      },
      include: {
        changeRequests: { where: { dateDeleted: null }, include: { changes: true } }
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

    await validateNoUnreviewedOpenCRs(wbsElement.wbsElementId);

    const { changeRequests } = wbsElement;
    if (!allChangeRequestsReviewed(changeRequests)) {
      throw new HttpException(
        400,
        `Please resolve all change requests related to ${wbsPipe({ carNumber, projectNumber, workPackageNumber })} - ${wbsElement.name} before proceeding`
      );
    }

    const numChanges = await prisma.change_Request.count({
      where: { organizationId: organization.organizationId }
    });

    const createdCR = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitter.userId } },
        wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
        type: CR_Type.ACTIVATION,
        activationChangeRequest: {
          create: {
            lead: { connect: { userId: leadId } },
            manager: { connect: { userId: managerId } },
            startDate: new Date(startDate),
            confirmDetails
          }
        },
        organization: { connect: { organizationId: organization.organizationId } },
        identifier: numChanges + 1
      },
      ...getChangeRequestWithProjectAndWorkPackageQueryArgs(organization.organizationId)
    });

    const teams = createdCR.wbsElement?.workPackage?.project.teams;
    if (teams && teams.length > 0) {
      const notifications: { channelId: string; ts: string }[] = await sendAndGetSlackCRNotifications(
        teams,
        createdCR,
        submitter,
        wbsElement,
        createdCR.wbsElement?.workPackage?.project.wbsElement.name || ''
      );
      await addSlackThreadsToChangeRequest(createdCR.crId, notifications);
    }

    await ChangeRequestsService.reviewActivationChangeRequest(createdCR, submitter);

    return createdCR.crId;
  }

  /**
   * Validates and creates a stage gate change request
   * @param submitter The user creating the cr
   * @param carNumber the car number for the wbs element
   * @param projectNumber the project number for the wbs element
   * @param workPackageNumber the work package number for the wbs element
   * @param confirmDone whether or not to confirm
   * @param organization the organization the user is currently in
   * @returns the id of the created cr
   */
  static async createStageGateChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    confirmDone: boolean,
    organization: Organization
  ): Promise<string> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create stage gate change requests');

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: { carNumber, projectNumber, workPackageNumber, organizationId: organization.organizationId }
      },
      include: {
        workPackage: true,
        descriptionBullets: true,
        changeRequests: { where: { dateDeleted: null }, include: { changes: true } }
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

    await validateNoUnreviewedOpenCRs(wbsElement.wbsElementId);

    if (wbsElement.workPackage) {
      throwIfUncheckedDescriptionBullets(wbsElement.descriptionBullets);
    }

    const { changeRequests } = wbsElement;
    if (!allChangeRequestsReviewed(changeRequests)) {
      throw new HttpException(
        400,
        `Please resolve all change requests related to ${wbsPipe({ carNumber, projectNumber, workPackageNumber })} - ${wbsElement.name} before proceeding`
      );
    }

    const numChangeRequests = await prisma.change_Request.count({
      where: { organizationId: organization.organizationId }
    });

    const createdChangeRequest = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitter.userId } },
        wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
        type: CR_Type.STAGE_GATE,
        stageGateChangeRequest: {
          create: { leftoverBudget: 0, confirmDone }
        },
        organization: { connect: { organizationId: organization.organizationId } },
        identifier: numChangeRequests + 1
      },
      ...getChangeRequestWithProjectAndWorkPackageQueryArgs(organization.organizationId)
    });

    const teams = createdChangeRequest.wbsElement?.workPackage?.project.teams;
    if (teams && teams.length > 0) {
      const notifications: { channelId: string; ts: string }[] = await sendAndGetSlackCRNotifications(
        teams,
        createdChangeRequest,
        submitter,
        wbsElement,
        createdChangeRequest.wbsElement?.workPackage?.project.wbsElement.name || ''
      );
      await addSlackThreadsToChangeRequest(createdChangeRequest.crId, notifications);
    }

    await ChangeRequestsService.reviewStageGateChangeRequest(createdChangeRequest, submitter);

    return createdChangeRequest.crId;
  }

  /**
   * Validates and creates a budget change request
   * @param submitter The user creating the cr
   * @param proposedBudget the proposed budget
   * @param organization the organization the user is currently in
   * @param otherReasonId the id of the other reason/category to change budget of
   * @param accountCodeId the id of the account code to change budget of
   * @returns the created change request
   */
  static async createBudgetChangeRequest(
    submitter: User,
    proposedBudget: number,
    organization: Organization,
    otherReasonId?: string,
    accountCodeId?: string
  ): Promise<ChangeRequest | ActivationChangeRequest | StageGateChangeRequest | BudgetChangeRequest> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create budget change requests');

    let createdChangeRequest;

    if (otherReasonId) {
      const category = await prisma.reimbursement_Product_Other_Reason.findUnique({
        where: { otherReimbursementProductReasonId: otherReasonId },
        include: { changeRequests: { where: { dateDeleted: null }, include: { changes: true } } }
      });

      if (!category) throw new NotFoundException('Reimbursement Product Other Reason', otherReasonId);
      if (category.dateDeleted) throw new DeletedException('Reimbursement Product Other Reason', otherReasonId);

      await validateNoUnreviewedOpenOtherReasonCRs(category.otherReimbursementProductReasonId);

      const { changeRequests } = category;
      if (!allChangeRequestsReviewed(changeRequests)) {
        throw new HttpException(
          400,
          `Please resolve all change requests related to ${otherReasonId} - ${category.name} before proceeding`
        );
      }

      const numChangeRequests = await prisma.change_Request.count({
        where: { organizationId: organization.organizationId }
      });

      createdChangeRequest = await prisma.change_Request.create({
        data: {
          submitter: { connect: { userId: submitter.userId } },
          category: { connect: { otherReimbursementProductReasonId: otherReasonId } },
          type: CR_Type.BUDGET,
          budgetChangeRequest: { create: { proposedBudget } },
          organization: { connect: { organizationId: organization.organizationId } },
          identifier: numChangeRequests + 1
        },
        ...getChangeRequestWithProjectAndWorkPackageQueryArgs(organization.organizationId)
      });

      const financeTeams = await prisma.team.findMany({
        where: { financeTeam: true, organizationId: organization.organizationId }
      });

      if (financeTeams && financeTeams.length > 0) {
        const notifications: { channelId: string; ts: string }[] = await sendAndGetSlackCRNotifications(
          financeTeams,
          createdChangeRequest,
          submitter,
          undefined,
          undefined,
          category
        );
        await addSlackThreadsToChangeRequest(createdChangeRequest.crId, notifications);
      }
    } else if (accountCodeId) {
      const accountCode = await prisma.account_Code.findUnique({
        where: { accountCodeId },
        include: { changeRequests: { where: { dateDeleted: null }, include: { changes: true } } }
      });

      if (!accountCode) throw new NotFoundException('Account Code', accountCodeId);
      if (accountCode.dateDeleted) throw new DeletedException('Account Code', accountCodeId);

      await validateNoUnreviewedOpenAccountCodeCRs(accountCode.accountCodeId);

      const { changeRequests } = accountCode;
      if (!allChangeRequestsReviewed(changeRequests)) {
        throw new HttpException(400, `Please resolve all change requests related to ${accountCode.name} before proceeding`);
      }

      const numChangeRequests = await prisma.change_Request.count({
        where: { organizationId: organization.organizationId }
      });

      createdChangeRequest = await prisma.change_Request.create({
        data: {
          submitter: { connect: { userId: submitter.userId } },
          accountCode: { connect: { accountCodeId } },
          type: CR_Type.BUDGET,
          budgetChangeRequest: { create: { proposedBudget } },
          organization: { connect: { organizationId: organization.organizationId } },
          identifier: numChangeRequests + 1
        },
        ...getChangeRequestWithProjectAndWorkPackageQueryArgs(organization.organizationId)
      });

      const financeTeams = await prisma.team.findMany({
        where: { financeTeam: true, organizationId: organization.organizationId }
      });

      if (financeTeams && financeTeams.length > 0) {
        const notifications: { channelId: string; ts: string }[] = await sendAndGetSlackCRNotifications(
          financeTeams,
          createdChangeRequest,
          submitter,
          undefined,
          undefined,
          undefined,
          accountCode
        );
        await addSlackThreadsToChangeRequest(createdChangeRequest.crId, notifications);
      }
    }

    if (!createdChangeRequest) {
      throw new HttpException(400, 'No account code or category provided');
    }

    return changeRequestTransformer(createdChangeRequest);
  }

  /**
   * Validates and creates a leadership change request, auto-approved immediately.
   * @param submitter the user creating the cr
   * @param carNumber the car number for the wbs element
   * @param projectNumber the project number for the wbs element
   * @param workPackageNumber the work package number for the wbs element
   * @param leadId the id of the new lead
   * @param managerId the id of the new manager
   * @param organization the organization the user is currently in
   * @returns the id of the created cr
   */
  static async createLeadershipChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    leadId: string | undefined,
    managerId: string | undefined,
    organization: Organization
  ): Promise<string> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create leadership change requests');

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: { carNumber, projectNumber, workPackageNumber, organizationId: organization.organizationId }
      },
      select: {
        wbsElementId: true,
        dateDeleted: true,
        organizationId: true,
        leadId: true,
        managerId: true
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    if (wbsElement.organizationId !== organization.organizationId) throw new InvalidOrganizationException('WBS Element');

    await validateNoUnreviewedOpenCRs(wbsElement.wbsElementId);

    const numChangeRequests = await prisma.change_Request.count({
      where: { organizationId: organization.organizationId }
    });

    const createdCR = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitter.userId } },
        wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
        type: CR_Type.LEADERSHIP,
        organization: { connect: { organizationId: organization.organizationId } },
        identifier: numChangeRequests + 1,
        leadershipChangeRequest: {
          create: {
            lead: leadId ? { connect: { userId: leadId } } : undefined,
            manager: managerId ? { connect: { userId: managerId } } : undefined
          }
        }
      }
    });

    await ChangeRequestsService.applyLeadershipChangeRequest(createdCR.crId, wbsElement, submitter, leadId, managerId);

    return createdCR.crId;
  }

  /**
   * Applies a leadership change request by updating the wbs element's lead/manager and auto-approving
   */
  private static async applyLeadershipChangeRequest(
    crId: string,
    wbsElement: { wbsElementId: string; leadId: string | null; managerId: string | null },
    submitter: User,
    leadId: string | undefined,
    managerId: string | undefined
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.change_Request.update({
        where: { crId },
        data: {
          reviewer: { connect: { userId: submitter.userId } },
          dateReviewed: new Date(),
          accepted: true,
          reviewNotes: 'Auto-approved: leadership change only'
        }
      });

      await tx.wBS_Element.update({
        where: { wbsElementId: wbsElement.wbsElementId },
        data: {
          lead: leadId ? { connect: { userId: leadId } } : { disconnect: true },
          manager: managerId ? { connect: { userId: managerId } } : { disconnect: true }
        }
      });

      const changes: { changeRequestId: string; implementerId: string; wbsElementId: string; detail: string }[] = [];

      if (leadId !== (wbsElement.leadId ?? undefined)) {
        const oldLead = await getUserFullName(wbsElement.leadId ?? null);
        const newLead = await getUserFullName(leadId ?? null);
        changes.push({
          changeRequestId: crId,
          implementerId: submitter.userId,
          wbsElementId: wbsElement.wbsElementId,
          detail: buildChangeDetail('lead', oldLead, newLead)
        });
      }

      if (managerId !== (wbsElement.managerId ?? undefined)) {
        const oldManager = await getUserFullName(wbsElement.managerId ?? null);
        const newManager = await getUserFullName(managerId ?? null);
        changes.push({
          changeRequestId: crId,
          implementerId: submitter.userId,
          wbsElementId: wbsElement.wbsElementId,
          detail: buildChangeDetail('manager', oldManager, newManager)
        });
      }

      if (changes.length > 0) {
        await tx.change.createMany({ data: changes });
      }
    });
  }

  /**
   * Validates and creates a standard change request
   * @param submitter The user creating the cr
   * @param carNumber the car number for the wbs element
   * @param projectNumber the project number for the wbs element
   * @param workPackageNumber the work package number for the wbs element
   * @param why the reason for the change
   * @param organization the organization the user is currently in
   * @param requestedReviewerId optional id of the requested reviewer
   * @param projectProposedChanges optional project proposed changes
   * @param workPackageProposedChanges optional work package proposed changes
   * @returns the created standard change request
   */
  static async createStandardChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    why: string,
    organization: Organization,
    requestedReviewerId?: string,
    projectProposedChanges?: ProjectProposedChangesCreateArgs,
    workPackageProposedChanges?: WorkPackageProposedChangesCreateArgs
  ): Promise<StandardChangeRequest> {
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create standard change requests');

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: { carNumber, projectNumber, workPackageNumber, organizationId: organization.organizationId }
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    if (wbsElement.organizationId !== organization.organizationId) throw new InvalidOrganizationException('WBS Element');

    if (
      projectNumber !== 0 &&
      !(projectProposedChanges && projectProposedChanges.workPackageProposedChanges.length === 0) &&
      !(isProjectWbs(wbsElement) && workPackageProposedChanges)
    ) {
      await validateNoUnreviewedOpenCRs(wbsElement.wbsElementId);
    }

    const numChangeRequests = await prisma.change_Request.count({
      where: { organizationId: organization.organizationId }
    });

    const createdCR = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitter.userId } },
        wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
        type: CR_Type.STANDARD,
        why,
        ...(requestedReviewerId && {
          requestedReviewers: { connect: { userId: requestedReviewerId } }
        }),
        organization: { connect: { organizationId: organization.organizationId } },
        identifier: numChangeRequests + 1
      },
      include: {
        wbsElement: {
          include: {
            project: { include: { teams: true, wbsElement: true } },
            workPackage: { include: { project: { include: { teams: true, wbsElement: true } } } }
          }
        }
      }
    });

    if (projectProposedChanges && workPackageProposedChanges) {
      throw new HttpException(400, "Change Request can't be on both a project and a work package");
    } else if (projectProposedChanges) {
      const {
        name,
        leadId,
        managerId,
        links,
        budget,
        summary,
        teamIds,
        descriptionBullets,
        workPackageProposedChanges: wpChanges,
        carNumber: proposedCarNumber
      } = projectProposedChanges;

      const validationResult = await validateProposedChangesFields(
        projectProposedChanges,
        links,
        descriptionBullets,
        [],
        wpChanges,
        organization.organizationId,
        proposedCarNumber,
        leadId,
        managerId
      );

      if (teamIds.length > 0) {
        for (const teamId of teamIds) {
          const team = await prisma.team.findUnique({ where: { teamId } });
          if (!team) throw new NotFoundException('Team', teamId);
        }
      }

      const isCreatingNewProject = projectNumber === 0;

      const changes = await prisma.wbs_Proposed_Changes.create({
        data: {
          changeRequest: { connect: { crId: createdCR.crId } },
          name,
          status: isCreatingNewProject ? WBS_Element_Status.INACTIVE : wbsElement.status,
          links: {
            create: validationResult.links.map((linkInfo) => ({
              url: linkInfo.url,
              linkTypeId: linkInfo.linkType.id,
              creatorId: submitter.userId
            }))
          },
          proposedDescriptionBulletChanges: {
            create: validationResult.descriptionBullets.map((bullet) => ({
              detail: bullet.detail,
              descriptionBulletType: { connect: { id: bullet.descriptionBulletType.id } }
            }))
          },
          projectProposedChanges: {
            create: {
              budget,
              summary,
              teams: { connect: teamIds.map((teamId) => ({ teamId })) },
              workPackageProposedChanges: {
                create: validationResult.workPackageProposedChanges.map((workPackage) => ({
                  wbsProposedChanges: {
                    create: {
                      name: workPackage.originalElement.name,
                      status: WBS_Element_Status.INACTIVE,
                      proposedDescriptionBulletChanges: {
                        create: workPackage.descriptionBullets.map((bullet) => ({
                          detail: bullet.detail,
                          descriptionBulletType: { connect: { id: bullet.descriptionBulletType.id } }
                        }))
                      },
                      leadId: workPackage.originalElement.leadId,
                      managerId: workPackage.originalElement.managerId
                    }
                  },
                  duration: workPackage.originalElement.duration,
                  startDate: new Date(workPackage.originalElement.startDate),
                  stage: workPackage.originalElement.stage,
                  blockedBy: {
                    connect: workPackage.validatedBlockedBys.map((wbsEl) => ({
                      wbsNumber: {
                        carNumber: wbsEl.carNumber,
                        projectNumber: wbsEl.projectNumber,
                        workPackageNumber: wbsEl.workPackageNumber,
                        organizationId: organization.organizationId
                      }
                    }))
                  }
                }))
              }
            }
          }
        }
      });

      await prisma.wbs_Proposed_Changes.update({
        where: { wbsProposedChangesId: changes.wbsProposedChangesId },
        data: {
          leadId,
          managerId,
          projectProposedChanges: { update: { carId: validationResult.carId } }
        }
      });
    } else if (workPackageProposedChanges) {
      const { name, leadId, managerId, duration, startDate, stage, descriptionBullets, blockedBy } =
        workPackageProposedChanges;

      const validationResult = await validateProposedChangesFields(
        workPackageProposedChanges,
        [],
        descriptionBullets,
        blockedBy,
        [],
        organization.organizationId,
        undefined,
        leadId,
        managerId
      );

      const isCreatingNewWorkPackage = workPackageNumber === 0;

      const changes = await prisma.wbs_Proposed_Changes.create({
        data: {
          changeRequest: { connect: { crId: createdCR.crId } },
          name,
          status: isCreatingNewWorkPackage ? WBS_Element_Status.INACTIVE : wbsElement.status,
          proposedDescriptionBulletChanges: {
            create: validationResult.descriptionBullets.map((bullet) => ({
              detail: bullet.detail,
              descriptionBulletType: { connect: { id: bullet.descriptionBulletType.id } }
            }))
          },
          ...(leadId && { lead: { connect: { userId: leadId } } }),
          ...(managerId && { manager: { connect: { userId: managerId } } }),
          workPackageProposedChanges: {
            create: {
              duration,
              startDate: new Date(startDate),
              stage,
              blockedBy: {
                connect: validationResult.validatedBlockedBys.map((wbsNumber) => ({
                  wbsNumber: {
                    carNumber: wbsNumber.carNumber,
                    projectNumber: wbsNumber.projectNumber,
                    workPackageNumber: wbsNumber.workPackageNumber,
                    organizationId: organization.organizationId
                  }
                }))
              }
            }
          }
        }
      });

      await prisma.wbs_Proposed_Changes.update({
        where: { wbsProposedChangesId: changes.wbsProposedChangesId },
        data: { leadId, managerId }
      });
    }

    const project = createdCR.wbsElement?.workPackage?.project || createdCR.wbsElement?.project;
    const teams = project?.teams;
    if (teams && teams.length > 0) {
      const notifications: { channelId: string; ts: string }[] = await sendAndGetSlackCRNotifications(
        teams,
        createdCR,
        submitter,
        wbsElement,
        project.wbsElement.name
      );
      await addSlackThreadsToChangeRequest(createdCR.crId, notifications);
    }

    const finishedCR = await prisma.change_Request.findUnique({
      where: { crId: createdCR.crId },
      ...getChangeRequestWithProjectAndWorkPackageQueryArgs(organization.organizationId)
    });

    if (!finishedCR) throw new NotFoundException('Change Request', createdCR.crId);

    return changeRequestTransformer(finishedCR) as StandardChangeRequest;
  }

  /**
   * Deletes the Change Request
   * @param submitter The user who deleted the change request
   * @param crId the change request to be deleted
   * @param organization the organization the user is currently in
   */
  static async deleteChangeRequest(submitter: User, crId: string, organization: Organization): Promise<void> {
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      include: { wbsElement: true }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Change Request');

    if (
      !(
        (await userHasPermission(submitter.userId, organization.organizationId, isAdmin)) ||
        submitter.userId === foundCR.submitterId
      )
    )
      throw new AccessDeniedAdminOnlyException('delete change requests');

    if (foundCR.reviewerId) throw new HttpException(400, `Cannot delete a reviewed change request!`);

    await prisma.change_Request.update({
      where: { crId },
      data: { dateDeleted: new Date(), deletedBy: { connect: { userId: submitter.userId } } }
    });
  }

  /**
   * Sets reviewers to the given change request and pings them on slack
   * @param submitter The user requesting the review
   * @param userIds The requested reviewers on the change request
   * @param crId The change request that will be reviewed
   * @param organization The organization the user is currently in
   */
  static async requestCRReview(submitter: User, userIds: string[], crId: string, organization: Organization): Promise<void> {
    const reviewers = await getUsersWithSettings(userIds);

    const underLeadsPromises = reviewers.map(async (user) => {
      return { ...user, underLead: !(await userHasPermission(user.userId, organization.organizationId, isLeadership)) };
    });

    const underLeads = (await Promise.all(underLeadsPromises)).filter((reviewer) => reviewer.underLead);

    if (underLeads.length > 0) {
      const underLeadsNames = underLeads.map((reviewer) => reviewer.firstName + ' ' + reviewer.lastName);
      throw new AccessDeniedException(`The following user(s) are not leadership: ${underLeadsNames.join(', ')}`);
    }

    const missingReviewersSettings = reviewers.filter((reviewer) => reviewer.userSettings == null);

    if (missingReviewersSettings.length > 0) {
      const missingReviewerSettingsNames = missingReviewersSettings.map(
        (reviewer) => reviewer.firstName + ' ' + reviewer.lastName
      );
      throw new AccessDeniedException(`The following user(s) have no slackId: ${missingReviewerSettingsNames.join(', ')}`);
    }

    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      ...getChangeRequestWithProjectAndWorkPackageQueryArgs(organization.organizationId)
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Change Request');
    if (foundCR.submitterId !== submitter.userId)
      throw new AccessDeniedException(`Only the author of this change request can request a reviewer`);
    if (foundCR.reviewerId) throw new HttpException(400, `Cannot request a review on an already reviewed change request`);

    const oldRequestedReviewersIds = foundCR.requestedReviewers.map((reviewer) => reviewer.userId);

    const reviewerIds = reviewers.map((reviewer) => ({ userId: reviewer.userId }));
    const newReviewers = reviewers.filter((user) => !oldRequestedReviewersIds.includes(user.userId));

    await prisma.change_Request.update({
      where: { crId },
      data: { requestedReviewers: { set: reviewerIds } }
    });

    await sendSlackRequestedReviewNotification(newReviewers, changeRequestTransformer(foundCR));
    await sendCrRequestReviewPopUp(foundCR, newReviewers, organization.organizationId);
  }
}
