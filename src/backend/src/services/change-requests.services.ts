import {
  ChangeRequest,
  isAdmin,
  isGuest,
  isLeadership,
  isNotLeadership,
  isProject,
  ProjectProposedChangesCreateArgs,
  ProposedSolution,
  ProposedSolutionCreateArgs,
  StandardChangeRequest,
  wbsPipe,
  WorkPackageProposedChangesCreateArgs
} from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  AccessDeniedMemberException,
  HttpException,
  NotFoundException,
  DeletedException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import changeRequestTransformer from '../transformers/change-requests.transformer';
import {
  allChangeRequestsReviewed,
  validateProposedChangesFields,
  applyProjectProposedChanges,
  applyWorkPackageProposedChanges,
  validateNoUnreviewedOpenCRs,
  reviewProposedSolution,
  sendCRSubmitterReviewedNotification
} from '../utils/change-requests.utils';
import { CR_Type, WBS_Element_Status, User, Scope_CR_Why_Type, Prisma, Organization } from '@prisma/client';
import { getUserFullName, getUsersWithSettings, userHasPermission } from '../utils/users.utils';
import { throwIfUncheckedDescriptionBullets } from '../utils/description-bullets.utils';
import { buildChangeDetail } from '../utils/changes.utils';
import {
  addSlackThreadsToChangeRequest,
  sendAndGetSlackCRNotifications,
  sendSlackCRStatusToThread,
  sendSlackRequestedReviewNotification
} from '../utils/slack.utils';
import { ChangeRequestQueryArgs, getChangeRequestQueryArgs } from '../prisma-query-args/change-requests.query-args';
import proposedSolutionTransformer from '../transformers/proposed-solutions.transformer';
import { getProposedSolutionQueryArgs } from '../prisma-query-args/proposed-solutions.query-args';

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
      ...getChangeRequestQueryArgs(organization.organizationId)
    });

    if (!changeRequest) throw new NotFoundException('Change Request', crId);
    if (changeRequest.dateDeleted) throw new DeletedException('Change Request', crId);
    if (changeRequest.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Change Request');

    return changeRequestTransformer(changeRequest);
  }

  /**
   * gets all the change requests in the database for the given organization
   * @param organization The organization the user is currently in
   * @returns All of the change requests
   */
  static async getAllChangeRequests(organization: Organization): Promise<ChangeRequest[]> {
    const changeRequests = await prisma.change_Request.findMany({
      where: { dateDeleted: null, wbsElement: { organizationId: organization.organizationId ?? null } },
      ...getChangeRequestQueryArgs(organization.organizationId)
    });

    return changeRequests.map(changeRequestTransformer);
  }

  /**
   * reviews the change request for the given Id and automates any changes that are made
   * @param reviewer The user reviewing the change request
   * @param crId the change request id
   * @param reviewNotes any notes passed in by the reviewer
   * @param accepted whether or not the change request is accepted
   * @param organization the organization the user is currently in
   * @param psId an optional psId to be passed in if the change request is a scope change request
   * @returns the id of the reviewed change request
   * @throws if the user does not have perms, the change request does not exist, the change request is already approved,
   */
  static async reviewChangeRequest(
    reviewer: User,
    crId: string,
    reviewNotes: string,
    accepted: boolean,
    organization: Organization,
    psId: string | null
  ): Promise<string> {
    // verify that the user is allowed review change requests
    if (await userHasPermission(reviewer.userId, organization.organizationId, isNotLeadership))
      throw new AccessDeniedMemberException('review change requests');

    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      include: getChangeRequestQueryArgs(organization.organizationId).include
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.accepted) throw new HttpException(400, `This change request is already approved!`);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.wbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(foundCR.wbsElement));
    if (foundCR.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Change Request');

    // verify that the user is not reviewing their own change request
    if (reviewer.userId === foundCR.submitterId)
      throw new AccessDeniedException("You can't review your own change request!");

    // ScopeChange Request That Has Been Accepted Being Reviewed
    if (foundCR.scopeChangeRequest && accepted) {
      await this.reviewScopeChangeRequest(foundCR, reviewer, psId, organization);
      // Stage Gate Change Request That Has Been Accepted Being Reviewed
    } else if (accepted && foundCR.type === CR_Type.STAGE_GATE) {
      await this.reviewStageGateChangeRequest(foundCR, reviewer);
      // Activation Change Requested That Has Been Accepted Being Reviewed
    } else if (foundCR.type === CR_Type.ACTIVATION && foundCR.activationChangeRequest && accepted) {
      await this.reviewActivationChangeRequest(foundCR, reviewer);
    }
    const includeArgs = getChangeRequestQueryArgs(organization.organizationId).include;
    // finally we can update change request
    const updated = await prisma.change_Request.update({
      where: { crId },
      data: {
        reviewer: { connect: { userId: reviewer.userId } },
        reviewNotes,
        accepted,
        dateReviewed: new Date()
      },
      include: {
        ...includeArgs,
        notificationSlackThreads: true
      }
    });

    // send a notification to the submitter that their change request has been reviewed
    await sendCRSubmitterReviewedNotification(updated);

    // send a reply to a CR's notifications of its updated status
    await sendSlackCRStatusToThread(updated.notificationSlackThreads, foundCR.crId, foundCR.identifier, accepted);

    return updated.crId;
  }

  /**
   * Reviews the scope change request considering either proposed solutions or proposed changes and initiating the respective changes
   * @param foundCR the change request to be reviewed
   * @param reviewer the user reviewing the change request
   * @param psId an optional psId to be passed in if the change request is a scope change request
   * @param organization the organization the user is currently in
   */
  static async reviewScopeChangeRequest(
    foundCR: Prisma.Change_RequestGetPayload<ChangeRequestQueryArgs>,
    reviewer: User,
    psId: string | null,
    organization: Organization
  ): Promise<void> {
    if (!foundCR.scopeChangeRequest) throw new HttpException(400, 'No scope change request found!');
    if (!foundCR.scopeChangeRequest.wbsProposedChanges && !psId) {
      // if there isn't wbs changes or proposed solutions
      throw new HttpException(400, 'No proposed solution or proposed changes for scope change request');
    } else if (psId && !foundCR.scopeChangeRequest.wbsProposedChanges) {
      // if there is only a proposed solution and no wbs changes
      // reviews a proposed solution applying certain changes based on the content of the proposed solution
      await reviewProposedSolution(psId, foundCR, reviewer, organization.organizationId);
    } else if (foundCR.scopeChangeRequest?.wbsProposedChanges && !psId) {
      const associatedProject = foundCR.wbsElement.project;
      const associatedWorkPackage = foundCR.wbsElement.workPackage;
      const { wbsProposedChanges } = foundCR.scopeChangeRequest;
      const { workPackageProposedChanges } = wbsProposedChanges;
      const { projectProposedChanges } = wbsProposedChanges;

      // must accept and review a change request before using the workpackage and project services
      await prisma.scope_CR.update({
        where: { changeRequestId: foundCR.crId },
        data: {
          changeRequest: {
            update: {
              accepted: true,
              dateReviewed: new Date()
            }
          },
          wbsOriginalData: {
            create: {
              name: foundCR.wbsElement.name,
              status: foundCR.wbsElement.status,
              leadId: foundCR.wbsElement.leadId,
              managerId: foundCR.wbsElement.managerId,
              links: {
                connect: foundCR.wbsElement.links.map((link) => ({
                  linkId: link.linkId
                }))
              },
              proposedDescriptionBulletChanges: {
                connect: foundCR.wbsElement.descriptionBullets.map((descriptionBullet) => ({
                  descriptionId: descriptionBullet.descriptionId
                }))
              },
              projectProposedChanges:
                projectProposedChanges && associatedProject
                  ? {
                      create: {
                        budget: associatedProject.budget,
                        summary: associatedProject.summary,
                        teams: {
                          connect: associatedProject.teams.map((team) => ({ teamId: team.teamId }))
                        },
                        car: {
                          connect: {
                            carId: associatedProject.carId
                          }
                        }
                      }
                    }
                  : undefined,
              workPackageProposedChanges:
                workPackageProposedChanges && associatedWorkPackage
                  ? {
                      create: {
                        startDate: associatedWorkPackage.startDate,
                        duration: associatedWorkPackage.duration,
                        blockedBy: {
                          connect: associatedWorkPackage.blockedBy.map((wbsElement) => ({
                            wbsNumber: {
                              carNumber: wbsElement.carNumber,
                              projectNumber: wbsElement.projectNumber,
                              workPackageNumber: wbsElement.workPackageNumber,
                              organizationId: wbsElement.organizationId
                            }
                          }))
                        },
                        stage: associatedWorkPackage.stage
                      }
                    }
                  : undefined
            }
          }
        }
      });

      if (workPackageProposedChanges) {
        await applyWorkPackageProposedChanges(
          wbsProposedChanges,
          workPackageProposedChanges,
          associatedProject?.wbsElementId ?? null,
          associatedWorkPackage,
          reviewer,
          foundCR.crId,
          organization
        );
      } else if (projectProposedChanges) {
        await applyProjectProposedChanges(
          wbsProposedChanges,
          projectProposedChanges,
          associatedProject,
          reviewer,
          foundCR.crId,
          foundCR.wbsElement.carNumber,
          organization
        );
      }
    }
  }

  /**
   * Reviews the stage gate change request and automates any changes that are made
   * @param foundCR the change request to be reviewed
   * @param reviewer the user reviewing the change request
   */
  static async reviewStageGateChangeRequest(
    foundCR: Prisma.Change_RequestGetPayload<ChangeRequestQueryArgs>,
    reviewer: User
  ): Promise<void> {
    if (!foundCR.wbsElement.workPackage) {
      throw new HttpException(400, 'Stage gate can only be made on work packages!');
    }

    throwIfUncheckedDescriptionBullets(foundCR.wbsElement.descriptionBullets);

    // update the status of the associated wp to be complete if needed
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
            changes: {
              createMany: {
                data: changesList
              }
            }
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
    foundCR: Prisma.Change_RequestGetPayload<ChangeRequestQueryArgs>,
    reviewer: User
  ): Promise<void> {
    const { activationChangeRequest } = foundCR;
    if (!activationChangeRequest) throw new HttpException(400, 'No activation change request found!');

    const shouldUpdateProjLead = activationChangeRequest.leadId !== foundCR.wbsElement.leadId;
    const shouldUpdateProjManager = activationChangeRequest.leadId !== foundCR.wbsElement.managerId;
    const shouldChangeStartDate =
      activationChangeRequest.startDate.setHours(0, 0, 0, 0) !==
      foundCR.wbsElement.workPackage?.startDate.setHours(0, 0, 0, 0);
    const changes = [];

    if (shouldUpdateProjLead) {
      const oldPL = await getUserFullName(foundCR.wbsElement.leadId);
      const newPL = await getUserFullName(activationChangeRequest.leadId);
      changes.push({
        changeRequestId: foundCR.crId,
        implementerId: reviewer.userId,
        wbsElementId: foundCR.wbsElementId,
        detail: buildChangeDetail('Project Lead', oldPL, newPL)
      });
    }

    if (shouldUpdateProjManager) {
      const oldPM = await getUserFullName(foundCR.wbsElement.managerId);
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
          foundCR.wbsElement.workPackage?.startDate.toLocaleDateString() || 'null',
          activationChangeRequest.startDate.toLocaleDateString()
        )
      });
    }

    changes.push({
      changeRequestId: foundCR.crId,
      implementerId: reviewer.userId,
      wbsElementId: foundCR.wbsElementId,
      detail: buildChangeDetail('status', foundCR.wbsElement.status, WBS_Element_Status.ACTIVE)
    });

    await prisma.change.createMany({ data: changes });

    await prisma.wBS_Element.update({
      where: { wbsElementId: foundCR.wbsElementId },
      data: {
        leadId: activationChangeRequest.leadId,
        managerId: activationChangeRequest.managerId,
        workPackage: { update: { startDate: activationChangeRequest.startDate } },
        status: WBS_Element_Status.ACTIVE
      }
    });
  }

  /**
   * Validates and creates an activation change request
   * @param submitter The user creating the cr
   * @param carNumber the car number for the wbs element
   * @param projectNumber the project number for the wbs element
   * @param workPackageNumber the work package number for the wbs element
   * @param type the type of cr
   * @param leadId the id of the project lead
   * @param managerId the id of the project manager
   * @param startDate the start date of the work package/project
   * @param confirmDetails whether or not to confirm
   * @param organization the organization the user is currently in
   * @returns the id of the created cr
   * @throws if user is not allowed to create crs, if wbs element does not exist, or if the cr type is not activation
   */
  static async createActivationChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    leadId: string,
    managerId: string,
    startDate: Date,
    confirmDetails: boolean,
    organization: Organization
  ): Promise<string> {
    // verify user is allowed to create activation change requests
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create activation change requests');

    // verify wbs element exists
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId: organization.organizationId
        }
      },
      include: {
        changeRequests: true
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    // we don't want to have merge conflictS on the wbs element thus we check if there are unreviewed or open CRs on the wbs element
    await validateNoUnreviewedOpenCRs(wbsElement.wbsElementId);

    const { changeRequests } = wbsElement;
    const nonDeletedChangeRequests = changeRequests.filter((changeRequest) => !changeRequest.dateDeleted);
    if (!allChangeRequestsReviewed(nonDeletedChangeRequests)) {
      throw new HttpException(
        400,
        `Please resolve all change requests related to ${wbsPipe({ carNumber, projectNumber, workPackageNumber })} - ${
          wbsElement.name
        } before proceeding`
      );
    }

    const numChanges = await prisma.change_Request.count({
      where: { organizationId: organization.organizationId }
    });

    const createdCR = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitter.userId } },
        wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
        type,
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
      include: {
        wbsElement: {
          include: {
            workPackage: {
              include: {
                project: { include: { teams: true, wbsElement: true } }
              }
            }
          }
        }
      }
    });

    const teams = createdCR.wbsElement.workPackage?.project.teams;
    if (teams && teams.length > 0) {
      const notifications: { channelId: string; ts: string }[] = await sendAndGetSlackCRNotifications(
        teams,
        createdCR,
        submitter,
        wbsElement,
        createdCR.wbsElement.workPackage?.project.wbsElement.name || ''
      );

      // save the slack references to the change request
      await addSlackThreadsToChangeRequest(createdCR.crId, notifications);
    }

    return createdCR.crId;
  }

  /**
   * Validates and creates a stage gate change request
   * @param submitter The user creating the cr
   * @param carNumber  the car number for the wbs element
   * @param projectNumber  the project number for the wbs element
   * @param workPackageNumber  the work package number for the wbs element
   * @param type  the type of cr
   * @param confirmDone  whether or not to confirm
   * @param organization the organization the user is currently in
   * @returns the id of the created cr
   * @throws if user is not allowed to create crs, if wbs element does not exist, or if the cr type is not stage gate
   */
  static async createStageGateChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    confirmDone: boolean,
    organization: Organization
  ): Promise<string> {
    // verify user is allowed to create stage gate change requests
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create stage gate change requests');

    // verify wbs element exists
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId: organization.organizationId
        }
      },
      include: { workPackage: true, descriptionBullets: true, changeRequests: true }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    // we don't want to have merge conflictS on the wbs element thus we check if there are unreviewed or open CRs on the wbs element
    await validateNoUnreviewedOpenCRs(wbsElement.wbsElementId);

    if (wbsElement.workPackage) {
      throwIfUncheckedDescriptionBullets(wbsElement.descriptionBullets);
    }

    const { changeRequests } = wbsElement;
    const nonDeletedChangeRequests = changeRequests.filter((changeRequest) => !changeRequest.dateDeleted);
    if (!allChangeRequestsReviewed(nonDeletedChangeRequests)) {
      throw new HttpException(
        400,
        `Please resolve all change requests related to ${wbsPipe({ carNumber, projectNumber, workPackageNumber })} - ${
          wbsElement.name
        } before proceeding`
      );
    }

    const numChangeRequests = await prisma.change_Request.count({
      where: { organizationId: organization.organizationId }
    });

    const createdChangeRequest = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitter.userId } },
        wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
        type,
        stageGateChangeRequest: {
          create: {
            leftoverBudget: 0,
            confirmDone
          }
        },
        organization: { connect: { organizationId: organization.organizationId } },
        identifier: numChangeRequests + 1
      },
      include: {
        wbsElement: {
          include: {
            workPackage: {
              include: {
                project: { include: { teams: true, wbsElement: true } }
              }
            }
          }
        }
      }
    });

    const teams = createdChangeRequest.wbsElement.workPackage?.project.teams;
    if (teams && teams.length > 0) {
      const notifications: { channelId: string; ts: string }[] = await sendAndGetSlackCRNotifications(
        teams,
        createdChangeRequest,
        submitter,
        wbsElement,
        createdChangeRequest.wbsElement.workPackage?.project.wbsElement.name || ''
      );

      // save the slack references to the change request
      await addSlackThreadsToChangeRequest(createdChangeRequest.crId, notifications);
    }

    return createdChangeRequest.crId;
  }

  /**
   * Validates and creates a standard change request
   * @param submitter  The user creating the cr
   * @param carNumber  the car number for the wbs element
   * @param projectNumber  the project number for the wbs element
   * @param workPackageNumber  the work package number for the wbs element
   * @param type  the type of cr
   * @param what  the description of the change
   * @param why  the reason for the change
   * @param budgetImpact  the impact on the budget
   * @param proposedSolutions the proposed solutions of the scope cr
   * @param wbsProposedChanges the proposed changes of the wbs element
   * @param organization the organization the user is currently in
   * @param projectProposedChanges the project proposed changes
   * @param workPackageProposedChanges the work package proposed changes
   * @returns  the id of the created cr
   * @throws if user is not allowed to create crs, if wbs element does not exist, or if the cr type is not standard
   */
  static async createStandardChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    what: string,
    why: { type: Scope_CR_Why_Type; explain: string }[],
    proposedSolutions: ProposedSolutionCreateArgs[],
    organization: Organization,
    projectProposedChanges: ProjectProposedChangesCreateArgs | null,
    workPackageProposedChanges: WorkPackageProposedChangesCreateArgs | null
  ): Promise<StandardChangeRequest> {
    // verify user is allowed to create standard change requests
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('create standard change requests');

    //verify proposed solutions length is greater than 0
    if (proposedSolutions.length === 0 && !projectProposedChanges && !workPackageProposedChanges)
      throw new HttpException(400, 'No proposed solutions/changes provided');

    if (proposedSolutions.length > 0 && (projectProposedChanges || workPackageProposedChanges)) {
      throw new HttpException(400, `Can't have proposed solutions and proposed changes`);
    }

    // verify wbs element exists
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId: organization.organizationId
        }
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    if (wbsElement.organizationId !== organization.organizationId) throw new InvalidOrganizationException('WBS Element');
    // we don't want to have merge conflicts on the wbs element thus we check if there are unreviewed or open CRs on the wbs element
    if (
      projectNumber !== 0 && // Excluding Cars
      !(projectProposedChanges && projectProposedChanges.workPackageProposedChanges.length === 0) && // Excluding new projects with work packages
      !(isProject(wbsElement) && workPackageProposedChanges) // Excluding Creating Work Package on Project
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
        type,
        scopeChangeRequest: {
          create: {
            what,
            scopeImpact: '',
            timelineImpact: 0,
            budgetImpact: 0,
            why: { createMany: { data: why } }
          }
        },
        organization: { connect: { organizationId: organization.organizationId } },
        identifier: numChangeRequests + 1
      },
      include: {
        wbsElement: {
          include: {
            project: { include: { teams: true, wbsElement: true } },
            workPackage: {
              include: {
                project: { include: { teams: true, wbsElement: true } }
              }
            }
          }
        },
        scopeChangeRequest: true
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
        workPackageProposedChanges,
        carNumber
      } = projectProposedChanges;

      const validationResult = await validateProposedChangesFields(
        projectProposedChanges,
        links,
        descriptionBullets,
        [],
        workPackageProposedChanges,
        organization.organizationId,
        carNumber,
        leadId,
        managerId
      );

      if (teamIds.length > 0) {
        for (const teamId of teamIds) {
          const team = await prisma.team.findUnique({ where: { teamId } });
          if (!team) throw new NotFoundException('Team', teamId);
        }
      }

      const changes = await prisma.wbs_Proposed_Changes.create({
        data: {
          scopeChangeRequest: {
            connect: {
              scopeCrId: createdCR.scopeChangeRequest!.scopeCrId
            }
          },
          name,
          status: WBS_Element_Status.ACTIVE,
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
              descriptionBulletTypeId: bullet.descriptionBulletType.id
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
                          descriptionBulletTypeId: bullet.descriptionBulletType.id
                        }))
                      }
                    }
                  },
                  duration: workPackage.originalElement.duration,
                  startDate: new Date(workPackage.originalElement.startDate),
                  stage: workPackage.originalElement.stage,
                  blockedBy: {
                    connect: workPackage.validatedBlockedBys.map((wbsElement) => ({
                      wbsNumber: {
                        carNumber: wbsElement.carNumber,
                        projectNumber: wbsElement.projectNumber,
                        workPackageNumber: wbsElement.workPackageNumber,
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
          projectProposedChanges: {
            update: {
              carId: validationResult.carId
            }
          }
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

      const changes = await prisma.wbs_Proposed_Changes.create({
        data: {
          scopeChangeRequest: { connect: { scopeCrId: createdCR.scopeChangeRequest!.scopeCrId } },
          name,
          status: WBS_Element_Status.INACTIVE,
          proposedDescriptionBulletChanges: {
            create: validationResult.descriptionBullets.map((bullet) => ({
              detail: bullet.detail,
              descriptionBulletTypeId: bullet.descriptionBulletType.id
            }))
          },
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
        data: {
          leadId,
          managerId
        }
      });
    }

    const proposedSolutionPromises = proposedSolutions.map(async (proposedSolution) => {
      return await this.addProposedSolution(
        submitter,
        createdCR.crId,
        proposedSolution.budgetImpact,
        proposedSolution.description,
        proposedSolution.timelineImpact,
        proposedSolution.scopeImpact,
        organization
      );
    });

    await Promise.all(proposedSolutionPromises);

    const project = createdCR.wbsElement.workPackage?.project || createdCR.wbsElement.project;
    const teams = project?.teams;
    if (teams && teams.length > 0) {
      const notifications: { channelId: string; ts: string }[] = await sendAndGetSlackCRNotifications(
        teams,
        createdCR,
        submitter,
        wbsElement,
        project.wbsElement.name
      );

      // save the slack references to the change request
      await addSlackThreadsToChangeRequest(createdCR.crId, notifications);
    }

    const finishedCR = await prisma.change_Request.findUnique({
      where: { crId: createdCR.crId },
      ...getChangeRequestQueryArgs(organization.organizationId)
    });

    if (!finishedCR) throw new NotFoundException('Change Request', createdCR.crId);

    return changeRequestTransformer(finishedCR) as StandardChangeRequest;
  }

  /**
   * valides and adds a proposed solution to a change request
   * @param submitter  The user creating the cr
   * @param crId  the id of the change request
   * @param budgetImpact  the impact on the budget
   * @param description  the description of the proposed solution
   * @param timelineImpact  the impact on the timeline
   * @param scopeImpact  the impact on the scope
   * @param organization the organization the user is currently in
   * @returns  the id of the created cr
   * @throws if user is not allowed to create crs, if the change request is not found,
   *         or if the change request has already been reviewed
   */
  static async addProposedSolution(
    submitter: User,
    crId: string,
    budgetImpact: number,
    description: string,
    timelineImpact: number,
    scopeImpact: string,
    organization: Organization
  ): Promise<ProposedSolution> {
    // verify user is allowed to add proposed solutions
    if (await userHasPermission(submitter.userId, organization.organizationId, isGuest))
      throw new AccessDeniedGuestException('add proposed solutions');

    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.accepted !== null)
      throw new HttpException(400, `Cannot create proposed solutions on a reviewed change request!`);

    // ensure existence of scope change request
    const foundScopeCR = await prisma.scope_CR.findUnique({ where: { changeRequestId: crId } });
    if (!foundScopeCR) throw new NotFoundException('Change Request', crId);

    const createdProposedSolution = await prisma.proposed_Solution.create({
      data: {
        description,
        scopeImpact,
        timelineImpact,
        budgetImpact,
        scopeChangeRequest: { connect: { scopeCrId: foundScopeCR.scopeCrId } },
        createdBy: { connect: { userId: submitter.userId } }
      },
      ...getProposedSolutionQueryArgs(organization.organizationId)
    });

    return proposedSolutionTransformer(createdProposedSolution);
  }

  /**
   * Deletes the Change Request
   * @param submitter The user who deleted the change request
   * @param crId the change request to be deleted
   * @param organization the organization the user is currently in
   */
  static async deleteChangeRequest(submitter: User, crId: string, organization: Organization): Promise<void> {
    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      include: {
        wbsElement: true
      }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Change Request');

    // verify user is allowed to delete change requests
    if (
      !(
        (await userHasPermission(submitter.userId, organization.organizationId, isAdmin)) ||
        submitter.userId === foundCR.submitterId
      )
    )
      throw new AccessDeniedAdminOnlyException('delete change requests');

    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);

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

    // check if any reviewers' role is below leadership
    const underLeadsPromises = reviewers.map(async (user) => {
      return { ...user, underLead: !(await userHasPermission(user.userId, organization.organizationId, isLeadership)) };
    });

    const underLeads = (await Promise.all(underLeadsPromises)).filter((reviewer) => reviewer.underLead);

    if (underLeads.length > 0) {
      const underLeadsNames = underLeads.map((reviewer) => reviewer.firstName + ' ' + reviewer.lastName);
      throw new AccessDeniedException(`The following user(s) are not leadership: ${underLeadsNames.join(', ')}`);
    }

    // check if all reviewers have slackId
    const missingReviewersSettings = reviewers.filter((reviewer) => reviewer.userSettings == null);

    if (missingReviewersSettings.length > 0) {
      const missingReviewerSettingsNames = missingReviewersSettings.map(
        (reviewer) => reviewer.firstName + ' ' + reviewer.lastName
      );
      throw new AccessDeniedException(`The following user(s) have no slackId: ${missingReviewerSettingsNames.join(', ')}`);
    }

    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      ...getChangeRequestQueryArgs(organization.organizationId)
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Change Request');
    if (foundCR.submitterId !== submitter.userId)
      throw new AccessDeniedException(`Only the author of this change request can request a reviewer`);
    if (foundCR.reviewerId) throw new HttpException(400, `Cannot request a review on an already reviewed change request`);

    const oldRequestedReviewersIds = foundCR.requestedReviewers.map((reviewer) => reviewer.userId);

    const reviewerIds = reviewers.map((reviewer) => {
      return {
        userId: reviewer.userId
      };
    });

    const newReviewers = reviewers.filter((user) => !oldRequestedReviewersIds.includes(user.userId));

    await prisma.change_Request.update({
      where: { crId },
      data: {
        requestedReviewers: {
          set: reviewerIds
        }
      }
    });

    // send slack message to CR reviewers
    await sendSlackRequestedReviewNotification(newReviewers, changeRequestTransformer(foundCR));
  }
}
