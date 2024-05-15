import {
  ChangeRequest,
  isAdmin,
  isGuest,
  isLeadership,
  isNotLeadership,
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
import { updateBlocking, allChangeRequestsReviewed, validateProposedChangesFields } from '../utils/change-requests.utils';
import { CR_Type, WBS_Element_Status, User, Scope_CR_Why_Type } from '@prisma/client';
import { getUserFullName, getUsersWithSettings, userHasPermission } from '../utils/users.utils';
import { throwIfUncheckedDescriptionBullets } from '../utils/description-bullets.utils';
import { buildChangeDetail, createChange } from '../utils/changes.utils';
import {
  addSlackThreadsToChangeRequest,
  sendAndGetSlackCRNotifications,
  sendSlackCRReviewedNotification,
  sendSlackCRStatusToThread,
  sendSlackRequestedReviewNotification
} from '../utils/slack.utils';
import { getChangeRequestQueryArgs } from '../prisma-query-args/change-requests.query-args';
import { validateBlockedBys } from '../utils/work-packages.utils';
import proposedSolutionTransformer from '../transformers/proposed-solutions.transformer';
import { getWorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args';
import { getProposedSolutionQueryArgs } from '../prisma-query-args/proposed-solutions.query-args';

export default class ChangeRequestsService {
  /**
   * Gets the change request for the given Id
   * @param crId The change request id
   * @param organizationId The organization the user is currently in
   * @returns The change request with the given id
   * @throws if the change request does not exist
   */
  static async getChangeRequestByID(crId: number, organizationId: string): Promise<ChangeRequest> {
    const changeRequest = await prisma.change_Request.findUnique({
      where: { crId },
      ...getChangeRequestQueryArgs(organizationId)
    });

    if (!changeRequest) throw new NotFoundException('Change Request', crId);
    if (changeRequest.dateDeleted) throw new DeletedException('Change Request', crId);
    if (changeRequest.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Change Request');

    return changeRequestTransformer(changeRequest);
  }

  /**
   * gets all the change requests in the database for the given organization
   * @param organizationId The organization the user is currently in
   * @returns All of the change requests
   */
  static async getAllChangeRequests(organizationId: string): Promise<ChangeRequest[]> {
    const changeRequests = await prisma.change_Request.findMany({
      where: { dateDeleted: null, wbsElement: { organizationId } },
      ...getChangeRequestQueryArgs(organizationId)
    });
    return changeRequests.map(changeRequestTransformer);
  }

  /**
   * reviews the change request for the given Id and automates any changes that are made
   * @param reviewer The user reviewing the change request
   * @param crId the change request id
   * @param reviewNotes any notes passed in by the reviewer
   * @param accepted whether or not the change request is accepted
   * @param organizationId the organization the user is currently in
   * @param psId an optional psId to be passed in if the change request is a scope change request
   * @returns the id of the reviewed change request
   * @throws if the user does not have perms, the change request does not exist, the change request is already approved,
   */
  static async reviewChangeRequest(
    reviewer: User,
    crId: number,
    reviewNotes: string,
    accepted: boolean,
    organizationId: string,
    psId: string | null
  ): Promise<Number> {
    // verify that the user is allowed review change requests
    if (await userHasPermission(reviewer.userId, organizationId, isNotLeadership))
      throw new AccessDeniedMemberException('review change requests');

    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      include: {
        activationChangeRequest: true,
        scopeChangeRequest: true,
        wbsElement: {
          include: { workPackage: getWorkPackageQueryArgs(organizationId), project: true, descriptionBullets: true }
        }
      }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.accepted) throw new HttpException(400, `This change request is already approved!`);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.wbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(foundCR.wbsElement));
    if (foundCR.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Change Request');

    // verify that the user is not reviewing their own change request
    if (reviewer.userId === foundCR.submitterId)
      throw new AccessDeniedException("You can't review your own change request!");

    // If approving a scope CR
    if (foundCR.scopeChangeRequest && accepted) {
      // ensure a proposed solution is being approved and exists
      if (!psId) throw new HttpException(400, 'No proposed solution selected for scope change request');
      const foundPs = await prisma.proposed_Solution.findUnique({
        where: { proposedSolutionId: psId }
      });
      if (!foundPs || foundPs.changeRequestId !== foundCR.scopeChangeRequest.scopeCrId)
        throw new NotFoundException('Proposed Solution', psId);

      // automate the changes for the proposed solution
      // if cr is for a project: update the budget based off of the proposed solution
      // else if cr is for a wp: update the budget and duration based off of the proposed solution
      if (!foundCR.wbsElement.workPackage && foundCR.wbsElement.project) {
        const newBudget = foundCR.wbsElement.project.budget + foundPs.budgetImpact;
        const change = createChange(
          'Budget',
          foundCR.wbsElement.project.budget,
          newBudget,
          crId,
          reviewer.userId,
          foundCR.wbsElementId
        );
        await prisma.project.update({
          where: { projectId: foundCR.wbsElement.project.projectId },
          data: {
            budget: newBudget
          }
        });

        //Make the associated budget change if there was a change
        if (change) await prisma.change.create({ data: change });
      } else if (foundCR.wbsElement.workPackage) {
        // get the project for the work package
        const wpProj = await prisma.project.findUnique({
          where: { projectId: foundCR.wbsElement.workPackage.projectId },
          include: { workPackages: getWorkPackageQueryArgs(organizationId) }
        });
        if (!wpProj) throw new NotFoundException('Project', foundCR.wbsElement.workPackage.projectId);

        // calculate the new budget and new duration
        const newBudget = wpProj.budget + foundPs.budgetImpact;
        const updatedDuration = foundCR.wbsElement.workPackage.duration + foundPs.timelineImpact;

        // create changes that reflect the new budget and duration
        const changes = [
          createChange('Budget', wpProj.budget, newBudget, crId, reviewer.userId, foundCR.wbsElementId),
          createChange(
            'Duration',
            foundCR.wbsElement.workPackage.duration,
            updatedDuration,
            crId,
            reviewer.userId,
            foundCR.wbsElementId
          )
        ];

        // update all the wps this wp is blocking (and nested blockings) of this work package so that their start dates reflect the new duration
        if (foundPs.timelineImpact > 0) {
          await updateBlocking(foundCR.wbsElement.workPackage, foundPs.timelineImpact, crId, reviewer);
        }

        // update the project and work package
        await prisma.project.update({
          where: { projectId: foundCR.wbsElement.workPackage.projectId },
          data: {
            budget: newBudget,
            workPackages: {
              update: {
                where: { workPackageId: foundCR.wbsElement.workPackage.workPackageId },
                data: {
                  duration: updatedDuration
                }
              }
            }
          }
        });

        //Making associated changes
        const changePromises = changes.map(async (change) => {
          //Checking if change is not zero so we dont make changes for zero budget or timeline impact
          if (change) {
            await prisma.change.create({ data: change });
          }
        });

        await Promise.all(changePromises);
      }

      // finally update the proposed solution
      await prisma.proposed_Solution.update({
        where: { proposedSolutionId: psId },
        data: {
          approved: true
        }
      });
    }

    // stage gate cr
    if (accepted && foundCR.type === CR_Type.STAGE_GATE) {
      if (!foundCR.wbsElement.workPackage) {
        throw new HttpException(400, 'Stage gate can only be made on work packages!');
      }

      throwIfUncheckedDescriptionBullets(foundCR.wbsElement.descriptionBullets);

      // update the status of the associated wp to be complete if needed
      const shouldChangeStatus = foundCR.wbsElement.status !== WBS_Element_Status.COMPLETE;
      const changesList = [];
      if (shouldChangeStatus) {
        changesList.push({
          changeRequestId: crId,
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

    // if it's an activation cr and being accepted, we can do some stuff to the associated work package
    if (foundCR.type === CR_Type.ACTIVATION && foundCR.activationChangeRequest && accepted) {
      const { activationChangeRequest: actCr } = foundCR;
      const shouldUpdateProjLead = actCr.leadId !== foundCR.wbsElement.leadId;
      const shouldUpdateProjManager = actCr.managerId !== foundCR.wbsElement.managerId;
      const shouldChangeStartDate =
        actCr.startDate.setHours(0, 0, 0, 0) !== foundCR.wbsElement.workPackage?.startDate.setHours(0, 0, 0, 0);
      const changes = [];

      if (shouldUpdateProjLead) {
        const oldPL = await getUserFullName(foundCR.wbsElement.leadId);
        const newPL = await getUserFullName(actCr.leadId);
        changes.push({
          changeRequestId: foundCR.crId,
          implementerId: reviewer.userId,
          wbsElementId: foundCR.wbsElementId,
          detail: buildChangeDetail('Project Lead', oldPL, newPL)
        });
      }

      if (shouldUpdateProjManager) {
        const oldPM = await getUserFullName(foundCR.wbsElement.managerId);
        const newPM = await getUserFullName(actCr.managerId);
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
            actCr.startDate.toLocaleDateString()
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
          leadId: actCr.leadId,
          managerId: actCr.managerId,
          workPackage: { update: { startDate: actCr.startDate } },
          status: WBS_Element_Status.ACTIVE
        }
      });
    }

    // finally we can update change request
    const updated = await prisma.change_Request.update({
      where: { crId },
      data: {
        reviewer: { connect: { userId: reviewer.userId } },
        reviewNotes,
        accepted,
        dateReviewed: new Date()
      },
      include: { activationChangeRequest: true, wbsElement: { include: { workPackage: true } } }
    });

    // send the creator of the cr a slack notification that their cr was reviewed
    const creatorUserSettings = await prisma.user_Settings.findUnique({ where: { userId: foundCR.submitterId } });
    if (creatorUserSettings && creatorUserSettings.slackId) {
      try {
        await sendSlackCRReviewedNotification(creatorUserSettings.slackId, foundCR.crId);
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new HttpException(500, `Failed to send slack notification: ${err.message}`);
        }
      }
    }

    // send a reply to a CR's notifications of its updated status
    const relevantThreads = await prisma.message_Info.findMany({ where: { changeRequestId: foundCR.crId } });
    await sendSlackCRStatusToThread(relevantThreads, foundCR.crId, accepted);

    return updated.crId;
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
   * @param organizationId the organization the user is currently in
   * @returns the id of the created cr
   * @throws if user is not allowed to create crs, if wbs element does not exist, or if the cr type is not activation
   */
  static async createActivationChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    leadId: number,
    managerId: number,
    startDate: Date,
    confirmDetails: boolean,
    organizationId: string
  ): Promise<number> {
    // verify user is allowed to create activation change requests
    if (await userHasPermission(submitter.userId, organizationId, isGuest))
      throw new AccessDeniedGuestException('create activation change requests');

    // verify wbs element exists
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId
        }
      },
      include: {
        changeRequests: true
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

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
        }
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
   * @param organizationId the organization the user is currently in
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
    organizationId: string
  ): Promise<Number> {
    // verify user is allowed to create stage gate change requests
    if (await userHasPermission(submitter.userId, organizationId, isGuest))
      throw new AccessDeniedGuestException('create stage gate change requests');

    // verify wbs element exists
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber,
          organizationId
        }
      },
      include: { workPackage: true, descriptionBullets: true, changeRequests: true }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);

    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

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
        }
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
   * @param organizationId the organization the user is currently in
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
    organizationId: string,
    projectProposedChanges: ProjectProposedChangesCreateArgs | null,
    workPackageProposedChanges: WorkPackageProposedChangesCreateArgs | null
  ): Promise<StandardChangeRequest> {
    // verify user is allowed to create standard change requests
    if (await userHasPermission(submitter.userId, organizationId, isGuest))
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
          organizationId
        }
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

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
        }
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
      const { name, leadId, managerId, links, budget, summary, descriptionBullets, teamIds, carNumber } =
        projectProposedChanges;

      const validationResult = await validateProposedChangesFields(
        links,
        descriptionBullets,
        organizationId,
        leadId,
        managerId
      );

      let carId: string | null = null;
      if (carNumber) {
        const carWbs = await prisma.wBS_Element.findUnique({
          where: { wbsNumber: { carNumber, projectNumber: 0, workPackageNumber: 0, organizationId } },
          include: {
            car: true
          }
        });
        if (!carWbs?.car) throw new NotFoundException('WBS Element', `${carNumber}.0.0`);
        const {
          car: { carId: fetchedCarId }
        } = carWbs;
        carId = fetchedCarId;
      }

      if (teamIds.length > 0) {
        for (const teamId of teamIds) {
          const team = await prisma.team.findUnique({ where: { teamId } });
          if (!team) throw new NotFoundException('Team', teamId);
        }
      }

      await prisma.wbs_Proposed_Changes.create({
        data: {
          changeRequestId: createdCR.scopeChangeRequest!.scopeCrId,
          name,
          status: WBS_Element_Status.ACTIVE,
          leadId,
          managerId,
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
              carId
            }
          }
        }
      });
    } else if (workPackageProposedChanges) {
      const { name, leadId, managerId, duration, startDate, stage, descriptionBullets, blockedBy } =
        workPackageProposedChanges;

      const validationResult = await validateProposedChangesFields(
        [],
        descriptionBullets,
        organizationId,
        leadId,
        managerId
      );

      await validateBlockedBys(blockedBy, organizationId);

      await prisma.wbs_Proposed_Changes.create({
        data: {
          changeRequestId: createdCR.scopeChangeRequest!.scopeCrId,
          name,
          status: WBS_Element_Status.INACTIVE,
          leadId,
          managerId,
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
                connect: blockedBy.map((wbsNumber) => ({
                  wbsNumber: {
                    carNumber: wbsNumber.carNumber,
                    projectNumber: wbsNumber.projectNumber,
                    workPackageNumber: wbsNumber.workPackageNumber,
                    organizationId
                  }
                }))
              }
            }
          }
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
        organizationId
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
      ...getChangeRequestQueryArgs(organizationId)
    });

    return changeRequestTransformer(finishedCR!) as StandardChangeRequest;
  }

  /**
   * valides and adds a proposed solution to a change request
   * @param submitter  The user creating the cr
   * @param crId  the id of the change request
   * @param budgetImpact  the impact on the budget
   * @param description  the description of the proposed solution
   * @param timelineImpact  the impact on the timeline
   * @param scopeImpact  the impact on the scope
   * @param organizationId the organization the user is currently in
   * @returns  the id of the created cr
   * @throws if user is not allowed to create crs, if the change request is not found,
   *         or if the change request has already been reviewed
   */
  static async addProposedSolution(
    submitter: User,
    crId: number,
    budgetImpact: number,
    description: string,
    timelineImpact: number,
    scopeImpact: string,
    organizationId: string
  ): Promise<ProposedSolution> {
    // verify user is allowed to add proposed solutions
    if (await userHasPermission(submitter.userId, organizationId, isGuest))
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
        changeRequest: { connect: { scopeCrId: foundScopeCR.scopeCrId } },
        createdBy: { connect: { userId: submitter.userId } }
      },
      ...getProposedSolutionQueryArgs(organizationId)
    });

    return proposedSolutionTransformer(createdProposedSolution);
  }

  /**
   * Deletes the Change Request
   * @param submitter The user who deleted the change request
   * @param crId the change request to be deleted
   * @param organizationId the organization the user is currently in
   */
  static async deleteChangeRequest(submitter: User, crId: number, organizationId: string): Promise<void> {
    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      include: {
        wbsElement: true
      }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Change Request');

    // verify user is allowed to delete change requests
    if (!((await userHasPermission(submitter.userId, organizationId, isAdmin)) || submitter.userId === foundCR.submitterId))
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
   * @param organizationId The organization the user is currently in
   */
  static async requestCRReview(submitter: User, userIds: number[], crId: number, organizationId: string): Promise<void> {
    const reviewers = await getUsersWithSettings(userIds);

    // check if any reviewers' role is below leadership
    const underLeads = reviewers.filter(
      async (user) => !(await userHasPermission(user.userId, organizationId, isLeadership))
    );

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
      ...getChangeRequestQueryArgs(organizationId)
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Change Request');
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
