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
  WorkPackageProposedChangesCreateArgs,
  WorkPackageStage
} from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  AccessDeniedMemberException,
  HttpException,
  NotFoundException,
  DeletedException
} from '../utils/errors.utils';
import changeRequestTransformer from '../transformers/change-requests.transformer';
import {
  updateBlocking,
  allChangeRequestsReviewed,
  validateProposedChangesFields,
  validateNoUnreviewedOpenCRs,
  reviewProposedSolution,
  applyProjectProposedChanges,
  applyWorkPackageProposedChanges
} from '../utils/change-requests.utils';
import { CR_Type, WBS_Element_Status, User, Scope_CR_Why_Type, Change_Request } from '@prisma/client';
import { getUserFullName, getUsersWithSettings } from '../utils/users.utils';
import { descBulletConverter, throwIfUncheckedDescriptionBullets } from '../utils/description-bullets.utils';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import { buildChangeDetail, createChange } from '../utils/changes.utils';
import {
  addSlackThreadsToChangeRequest,
  sendAndGetSlackCRNotifications,
  sendSlackCRReviewedNotification,
  sendSlackCRStatusToThread,
  sendSlackRequestedReviewNotification
} from '../utils/slack.utils';
import { changeRequestQueryArgs } from '../prisma-query-args/change-requests.query-args';
import { validateBlockedBys } from '../utils/projects.utils';
import scopeChangeRequestQueryArgs from '../prisma-query-args/scope-change-requests.query-args';
import WorkPackagesService from './work-packages.services';
import { transformDate } from '../utils/datetime.utils';
import ProjectsService from './projects.services';

export default class ChangeRequestsService {
  /**
   * Gets the change request for the given Id
   * @param crId The change request id
   * @returns The change request with the given id
   * @throws if the change request does not exist
   */
  static async getChangeRequestByID(crId: number): Promise<ChangeRequest> {
    const changeRequest = await prisma.change_Request.findUnique({
      where: { crId },
      ...changeRequestQueryArgs
    });

    if (!changeRequest) throw new NotFoundException('Change Request', crId);
    if (changeRequest.dateDeleted) throw new DeletedException('Change Request', crId);

    return changeRequestTransformer(changeRequest);
  }

  /**
   * gets all the change requests in the database
   * @returns All of the change requests
   */
  static async getAllChangeRequests(): Promise<ChangeRequest[]> {
    const changeRequests = await prisma.change_Request.findMany({ where: { dateDeleted: null }, ...changeRequestQueryArgs });
    return changeRequests.map(changeRequestTransformer);
  }

  static async reviewStageGateChangeRequest(foundCR: any, reviewer: User): Promise<void> {
    if (!foundCR.wbsElement.workPackage) {
      throw new HttpException(400, 'Stage gate can only be made on work packages!');
    }

    throwIfUncheckedDescriptionBullets(foundCR.wbsElement.workPackage);

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
   * reviews the change request for the given Id and automates any changes that are made
   * @param reviewer The user reviewing the change request
   * @param crId the change request id
   * @param reviewNotes any notes passed in by the reviewer
   * @param accepted whether or not the change request is accepted
   * @param psId an optional psId to be passed in if the change request is a scope change request
   * @returns the id of the reviewed change request
   * @throws if the user does not have perms, the change request does not exist, the change request is already approved,
   */
  static async reviewChangeRequest(
    reviewer: User,
    crId: number,
    reviewNotes: string,
    accepted: boolean,
    psId: string | null
  ): Promise<Number> {
    // verify that the user is allowed review change requests
    if (isNotLeadership(reviewer.role)) throw new AccessDeniedMemberException('review change requests');

    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      include: {
        activationChangeRequest: true,
        scopeChangeRequest: scopeChangeRequestQueryArgs,
        wbsElement: {
          include: { workPackage: workPackageQueryArgs, project: true }
        }
      }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.accepted) throw new HttpException(400, `This change request is already approved!`);
    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);
    if (foundCR.wbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(foundCR.wbsElement));

    // verify that the user is not reviewing their own change request
    if (reviewer.userId === foundCR.submitterId)
      throw new AccessDeniedException(
        `User ${reviewer.userId} is not allowed to review their own change request submitted by User ${foundCR.submitterId}`
      );

    // If approving a scope CR
    if (foundCR.scopeChangeRequest && accepted) {
      if (!foundCR.scopeChangeRequest.wbsProposedChanges && !psId) {
        // if there isn't wbs changes or proposed solutions
        throw new HttpException(400, 'No proposed solution or proposed changes for scope change request');
      } else if (psId && !foundCR.scopeChangeRequest.wbsProposedChanges) {
        // if there is only a proposed solution and no wbs changes

        // reviews a proposed solution applying certain changes based on the content of the proposed solution
        await reviewProposedSolution(psId, foundCR, reviewer);
      } else if (foundCR.scopeChangeRequest.wbsProposedChanges && !psId) {
        await validateNoUnreviewedOpenCRs(foundCR.wbsElementId);
        // we don't want to have merge conflict on the wbs element thus we check if there are unreviewed or open CRs on the wbs element

        // must accept and review a change request before using the workpackage and project services
        await prisma.change_Request.update({
          where: { crId },
          data: {
            accepted: true,
            dateReviewed: new Date()
          }
        });

        const associatedProject = foundCR.wbsElement.project;
        const associatedWorkPackage = foundCR.wbsElement.workPackage;
        const { wbsProposedChanges } = foundCR.scopeChangeRequest;
        const { workPackageProposedChanges } = wbsProposedChanges;
        const { projectProposedChanges } = wbsProposedChanges;

        if (workPackageProposedChanges) {
          await applyWorkPackageProposedChanges(
            wbsProposedChanges,
            workPackageProposedChanges,
            associatedProject,
            associatedWorkPackage,
            reviewer,
            crId
          );
        } else if (projectProposedChanges) {
          await applyProjectProposedChanges(
            wbsProposedChanges,
            projectProposedChanges,
            associatedProject,
            reviewer,
            crId,
            foundCR.wbsElement.carNumber
          );
        }
      }
    } else if (accepted && foundCR.type === CR_Type.STAGE_GATE) {
      // stage gate cr
      await this.reviewStageGateChangeRequest(foundCR, reviewer);
    } else if (foundCR.type === CR_Type.ACTIVATION && foundCR.activationChangeRequest && accepted) {
      // if it's an activation cr and being accepted, we can do some stuff to the associated work package
      await this.reviewActivationChangeRequest(foundCR, reviewer);
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

  static async reviewActivationChangeRequest(foundCR: any, reviewer: User): Promise<void> {
    const { activationChangeRequest } = foundCR;
    const shouldUpdateProjLead = activationChangeRequest.projectLeadId !== foundCR.wbsElement.projectLeadId;
    const shouldUpdateProjManager = activationChangeRequest.projectManagerId !== foundCR.wbsElement.projectManagerId;
    const shouldChangeStartDate =
      activationChangeRequest.startDate.setHours(0, 0, 0, 0) !==
      foundCR.wbsElement.workPackage?.startDate.setHours(0, 0, 0, 0);
    const changes = [];

    if (shouldUpdateProjLead) {
      const oldPL = await getUserFullName(foundCR.wbsElement.projectLeadId);
      const newPL = await getUserFullName(activationChangeRequest.projectLeadId);
      changes.push({
        changeRequestId: foundCR.crId,
        implementerId: reviewer.userId,
        wbsElementId: foundCR.wbsElementId,
        detail: buildChangeDetail('Project Lead', oldPL, newPL)
      });
    }

    if (shouldUpdateProjManager) {
      const oldPM = await getUserFullName(foundCR.wbsElement.projectManagerId);
      const newPM = await getUserFullName(activationChangeRequest.projectManagerId);
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
        projectLeadId: activationChangeRequest.projectLeadId,
        projectManagerId: activationChangeRequest.projectManagerId,
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
   * @param projectLeadId the id of the project lead
   * @param projectManagerId the id of the project manager
   * @param startDate the start date of the work package/project
   * @param confirmDetails whether or not to confirm
   * @returns the id of the created cr
   * @throws if user is not allowed to create crs, if wbs element does not exist, or if the cr type is not activation
   */
  static async createActivationChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    projectLeadId: number,
    projectManagerId: number,
    startDate: Date,
    confirmDetails: boolean
  ): Promise<number> {
    // verify user is allowed to create activation change requests
    if (isGuest(submitter.role)) throw new AccessDeniedGuestException('create activation change requests');

    // verify wbs element exists
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber
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
            projectLead: { connect: { userId: projectLeadId } },
            projectManager: { connect: { userId: projectManagerId } },
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
   * @returns the id of the created cr
   * @throws if user is not allowed to create crs, if wbs element does not exist, or if the cr type is not stage gate
   */
  static async createStageGateChangeRequest(
    submitter: User,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    confirmDone: boolean
  ): Promise<Number> {
    // verify user is allowed to create stage gate change requests
    if (isGuest(submitter.role)) throw new AccessDeniedGuestException('create stage gate change requests');

    // verify wbs element exists
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber,
          projectNumber,
          workPackageNumber
        }
      },
      include: { workPackage: { include: { expectedActivities: true, deliverables: true } }, changeRequests: true }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);

    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

    if (wbsElement.workPackage) {
      throwIfUncheckedDescriptionBullets(wbsElement.workPackage);
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
    projectProposedChanges: ProjectProposedChangesCreateArgs | null,
    workPackageProposedChanges: WorkPackageProposedChangesCreateArgs | null
  ): Promise<StandardChangeRequest> {
    // verify user is allowed to create standard change requests
    if (isGuest(submitter.role)) throw new AccessDeniedGuestException('create standard change requests');

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
          workPackageNumber
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
      const {
        name,
        status,
        projectLeadId,
        projectManagerId,
        links,
        budget,
        summary,
        newProject,
        rules,
        teamIds,
        goals,
        features,
        otherConstraints
      } = projectProposedChanges;

      await validateProposedChangesFields(links, projectLeadId, projectManagerId);

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
          status,
          projectLeadId,
          projectManagerId,
          links: {
            create: links.map((linkInfo) => ({ url: linkInfo.url, linkTypeName: linkInfo.linkTypeName }))
          },
          projectProposedChanges: {
            create: {
              budget,
              summary,
              newProject,
              goals: { create: goals.map((value: string) => ({ detail: value })) },
              features: { create: features.map((value: string) => ({ detail: value })) },
              otherConstraints: { create: otherConstraints.map((value: string) => ({ detail: value })) },
              rules,
              teams: { connect: teamIds.map((teamId) => ({ teamId })) }
            }
          }
        }
      });
    } else if (workPackageProposedChanges) {
      const {
        name,
        projectLeadId,
        projectManagerId,
        duration,
        startDate,
        stage,
        expectedActivities,
        deliverables,
        blockedBy
      } = workPackageProposedChanges;

      await validateProposedChangesFields([], projectLeadId, projectManagerId);

      await validateBlockedBys(blockedBy);

      await prisma.wbs_Proposed_Changes.create({
        data: {
          changeRequestId: createdCR.scopeChangeRequest!.scopeCrId,
          name,
          status: WBS_Element_Status.INACTIVE,
          projectLeadId,
          projectManagerId,
          workPackageProposedChanges: {
            create: {
              duration,
              startDate: new Date(startDate),
              stage,
              blockedBy: { connect: blockedBy.map((wbsNumber) => ({ wbsNumber })) },
              expectedActivities: { create: expectedActivities.map((value: string) => ({ detail: value })) },
              deliverables: { create: deliverables.map((value: string) => ({ detail: value })) }
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
        proposedSolution.scopeImpact
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
      ...changeRequestQueryArgs
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
    scopeImpact: string
  ): Promise<ProposedSolution> {
    // verify user is allowed to add proposed solutions
    if (isGuest(submitter.role)) throw new AccessDeniedGuestException('add proposed solutions');

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

    const createProposedSolution = await prisma.proposed_Solution.create({
      data: {
        description,
        scopeImpact,
        timelineImpact,
        budgetImpact,
        changeRequest: { connect: { scopeCrId: foundScopeCR.scopeCrId } },
        createdBy: { connect: { userId: submitter.userId } }
      },
      include: { createdBy: true }
    });

    return { ...createProposedSolution, id: createProposedSolution.proposedSolutionId };
  }

  /**
   * Deletes the Change Request
   * @param submitter The user who deleted the change request
   * @param crId the change request to be deleted
   */
  static async deleteChangeRequest(submitter: User, crId: number): Promise<void> {
    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);

    // verify user is allowed to delete change requests
    if (!(isAdmin(submitter.role) || submitter.userId === foundCR.submitterId))
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
   */
  static async requestCRReview(submitter: User, userIds: number[], crId: number) {
    const reviewers = await getUsersWithSettings(userIds);

    // check if any reviewers' role is below leadership
    const underLeads = reviewers.filter((user) => !isLeadership(user.role));

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
      ...changeRequestQueryArgs
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);

    if (foundCR.submitterId !== submitter.userId)
      throw new AccessDeniedException(`Only the author of this change request can request a reviewer`);

    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);

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
