import { ChangeRequest, isAdmin, isGuest, isNotLeadership, wbsPipe } from 'shared';
import prisma from '../prisma/prisma';
import changeRequestQueryArgs from '../prisma-query-args/change-requests.query-args';
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
  sendSlackChangeRequestNotification,
  sendSlackCRReviewedNotification
} from '../utils/change-requests.utils';
import { CR_Type, WBS_Element_Status, User, Scope_CR_Why_Type } from '@prisma/client';
import { buildChangeDetail } from '../utils/utils';
import { getUserFullName } from '../utils/users.utils';
import { createChange } from '../utils/work-packages.utils';
import { throwIfUncheckedDescriptionBullets } from '../utils/description-bullets.utils';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';

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
        scopeChangeRequest: true,
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
    if (reviewer.userId === foundCR.submitterId) throw new AccessDeniedException();

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
        const change = createChange('Budget', foundCR.wbsElement.project.budget, newBudget, crId, reviewer.userId);
        await prisma.project.update({
          where: { projectId: foundCR.wbsElement.project.projectId },
          data: {
            budget: newBudget,
            wbsElement: {
              update: {
                changes: {
                  create: change
                }
              }
            }
          }
        });
      } else if (foundCR.wbsElement.workPackage) {
        // get the project for the work package
        const wpProj = await prisma.project.findUnique({
          where: { projectId: foundCR.wbsElement.workPackage.projectId },
          include: { workPackages: workPackageQueryArgs }
        });
        if (!wpProj) throw new NotFoundException('Project', foundCR.wbsElement.workPackage.projectId);

        // calculate the new budget and new duration
        const newBudget = wpProj.budget + foundPs.budgetImpact;
        const updatedDuration = foundCR.wbsElement.workPackage.duration + foundPs.timelineImpact;

        // create changes that reflect the new budget and duration
        const changes = [
          createChange('Budget', wpProj.budget, newBudget, crId, reviewer.userId),
          createChange('Duration', foundCR.wbsElement.workPackage.duration, updatedDuration, crId, reviewer.userId)
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
                  duration: updatedDuration,
                  wbsElement: {
                    update: {
                      changes: {
                        create: changes[1]
                      }
                    }
                  }
                }
              }
            },
            wbsElement: {
              update: {
                changes: {
                  create: changes[0]
                }
              }
            }
          }
        });
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

      throwIfUncheckedDescriptionBullets(foundCR.wbsElement.workPackage);

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
      const shouldUpdateProjLead = actCr.projectLeadId !== foundCR.wbsElement.projectLeadId;
      const shouldUpdateProjManager = actCr.projectManagerId !== foundCR.wbsElement.projectManagerId;
      const shouldChangeStartDate =
        actCr.startDate.setHours(0, 0, 0, 0) !== foundCR.wbsElement.workPackage?.startDate.setHours(0, 0, 0, 0);
      const changes = [];

      if (shouldUpdateProjLead) {
        const oldPL = await getUserFullName(foundCR.wbsElement.projectLeadId);
        const newPL = await getUserFullName(actCr.projectLeadId);
        changes.push({
          changeRequestId: foundCR.crId,
          implementerId: reviewer.userId,
          wbsElementId: foundCR.wbsElementId,
          detail: buildChangeDetail('Project Lead', oldPL, newPL)
        });
      }

      if (shouldUpdateProjManager) {
        const oldPM = await getUserFullName(foundCR.wbsElement.projectManagerId);
        const newPM = await getUserFullName(actCr.projectManagerId);
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
          projectLeadId: actCr.projectLeadId,
          projectManagerId: actCr.projectManagerId,
          workPackage: { update: { startDate: actCr.startDate } },
          status: WBS_Element_Status.ACTIVE
        }
      });
    }

    // send the creator of the cr a slack notification that their cr was reviewed
    const creatorUserSettings = await prisma.user_Settings.findUnique({ where: { userId: foundCR.submitterId } });
    if (creatorUserSettings && creatorUserSettings.slackId) {
      await sendSlackCRReviewedNotification(creatorUserSettings.slackId, foundCR.crId);
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

    return updated.crId;
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
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));
    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

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
                project: { include: { team: { include: { leader: true } }, wbsElement: true } }
              }
            }
          }
        }
      }
    });

    const team = createdCR.wbsElement.workPackage?.project.team;
    if (team) {
      const slackMsg =
        `${submitter.firstName} ${submitter.lastName} wants to activate ${createdCR.wbsElement.name}` +
        ` in ${createdCR.wbsElement.workPackage?.project.wbsElement.name}`;
      await sendSlackChangeRequestNotification(team, slackMsg, createdCR.crId);
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
      include: { workPackage: { include: { expectedActivities: true, deliverables: true } } }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);

    if (wbsElement.dateDeleted)
      throw new DeletedException('WBS Element', wbsPipe({ carNumber, projectNumber, workPackageNumber }));

    if (wbsElement.workPackage) {
      throwIfUncheckedDescriptionBullets(wbsElement.workPackage);
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
                project: { include: { team: { include: { leader: true } }, wbsElement: true } }
              }
            }
          }
        }
      }
    });

    const team = createdChangeRequest.wbsElement.workPackage?.project.team;
    if (team) {
      const slackMsg =
        `${submitter.firstName} ${submitter.lastName} wants to stage gate ${createdChangeRequest.wbsElement.name}` +
        ` in ${createdChangeRequest.wbsElement.workPackage?.project.wbsElement.name}`;
      await sendSlackChangeRequestNotification(team, slackMsg, createdChangeRequest.crId);
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
    why: { type: Scope_CR_Why_Type; explain: string }[]
  ): Promise<number> {
    // verify user is allowed to create standard change requests
    if (isGuest(submitter.role)) throw new AccessDeniedGuestException('create standard change requests');

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
            project: { include: { team: { include: { leader: true } }, wbsElement: true } },
            workPackage: {
              include: {
                project: { include: { team: { include: { leader: true } }, wbsElement: true } }
              }
            }
          }
        }
      }
    });

    const project = createdCR.wbsElement.workPackage?.project || createdCR.wbsElement.project;
    if (project?.team) {
      const slackMsg =
        `${type} CR submitted by ${submitter.firstName} ${submitter.lastName} ` +
        `for the ${project.wbsElement.name} project`;
      await sendSlackChangeRequestNotification(project.team, slackMsg, createdCR.crId);
    }

    return createdCR.crId;
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
  ): Promise<string> {
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
      }
    });

    return createProposedSolution.proposedSolutionId;
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
   * set a reviewer to the given change request
   * @param submitter The user who sets a reviewer to the change request
   * @param userId The reviewer who reviews the change request
   * @param crId The change request that will be reviewed
   */
  static async requestCRAReview(submitter: User, userIds: number[], crId: number) {
    // check for submitter priviledge check if cr's submitter is same as submitter

    const reviewers = await prisma.user.findMany({
      where: { userId }
    });

    if (!reviewers) throw new NotFoundException('User', userId);
    // check for reviewer's privilege  check if leadership or above

    const foundCR = await prisma.change_Request.findUnique({
      where: { crId }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);

    if (foundCR.dateDeleted) throw new DeletedException('Change Request', crId);

    if (foundCR.reviewerId) throw new HttpException(400, `Cannot assign a reviewer to a reviewed change request!`);

    // what are we doing if the requested reviewer has already been assigned as a reviewer to a cr?
    // origin: [ user_A, user_B ] with requested reviewers: [ user_A, user_C ] => new reviewers in CR: [ user_A, user_B, user_C ] (just add user_c into db)
    // every time we request this endpoint, it will re-send slack notification for those who's already in CR's reviewers (a stuff to consider for slack ticket)
    const newReviewers: User[] = [];

    await prisma.change_Request.update({
      where: { crId },
      data: {
        requestedReviewers: {
          set: newReviewers
        }
      }
    });
  }
}
