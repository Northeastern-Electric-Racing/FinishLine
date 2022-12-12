import { ChangeRequest } from 'shared';
import prisma from '../prisma/prisma';
import changeRequestRelationArgs from '../prisma-query-args/change-request.query-args';
import { AccessDeniedException, HttpException, NotFoundException } from '../utils/errors.utils';
import changeRequestTransformer from '../transformers/change-request.transformer';
import { Role, CR_Type, WBS_Element_Status } from '@prisma/client';
import { sendSlackChangeRequestNotification, sendSlackCRReviewedNotification } from '../utils/change-requests.utils';
import { buildChangeDetail } from '../utils/utils';
import { getUserFullName } from '../utils/users.utils';

export default class ChangeRequestService {
  static async getChangeRequestByID(crId: number): Promise<ChangeRequest> {
    const requestedCR = await prisma.change_Request.findUnique({
      where: { crId },
      ...changeRequestRelationArgs
    });
    if (requestedCR === null) throw new NotFoundException('Change Request', crId);

    return changeRequestTransformer(requestedCR);
  }

  static async getAllChangeRequests(): Promise<ChangeRequest[]> {
    const changeRequests = await prisma.change_Request.findMany(changeRequestRelationArgs);
    return changeRequests.map(changeRequestTransformer);
  }

  // handle reviewing of change requests
  static async reviewChangeRequest(
    reviewerId: number,
    crId: number,
    reviewNotes: string,
    accepted: boolean,
    psId: string | null
  ): Promise<Number> {
    // verify that the user is allowed review change requests
    const reviewer = await prisma.user.findUnique({ where: { userId: reviewerId } });
    if (!reviewer) throw new NotFoundException('User', reviewerId);
    if (reviewer.role === Role.GUEST || reviewer.role === Role.MEMBER) throw new AccessDeniedException();

    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId },
      include: {
        activationChangeRequest: true,
        scopeChangeRequest: true,
        wbsElement: {
          include: { workPackage: { include: { expectedActivities: true, deliverables: true } }, project: true }
        }
      }
    });

    if (!foundCR) throw new NotFoundException('Change Request', crId);
    if (foundCR.accepted) throw new HttpException(400, `This change request is already approved!`);

    // verify that the user is not reviewing their own change request
    if (reviewerId === foundCR.submitterId) throw new AccessDeniedException();

    // If approving a scope CR
    if (foundCR.scopeChangeRequest && accepted) {
      // ensure a proposed solution is being approved and exists
      if (!psId) throw new HttpException(400, 'No proposed solution selected for scope change request');
      const foundPs = await prisma.proposed_Solution.findUnique({
        where: { proposedSolutionId: psId }
      });
      if (!foundPs || foundPs.changeRequestId !== foundCR.scopeChangeRequest.scopeCrId)
        throw new HttpException(404, `Proposed solution with id #${psId} not found for change request #${crId}`);

      // automate the changes for the proposed solution
      // if cr is for a project: update the budget based off of the proposed solution
      // else if cr is for a wp: update the budget and duration based off of the proposed solution
      if (!foundCR.wbsElement.workPackage && foundCR.wbsElement.project) {
        const newBudget = foundCR.wbsElement.project.budget + foundPs.budgetImpact;
        const change = {
          changeRequestId: crId,
          implementerId: reviewerId,
          detail: buildChangeDetail('Budget', String(foundCR.wbsElement.project.budget), String(newBudget))
        };
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
        const wpProj = await prisma.project.findUnique({
          where: { projectId: foundCR.wbsElement.workPackage.projectId }
        });
        if (!wpProj) throw new NotFoundException('Project', foundCR.wbsElement.workPackage.projectId);
        const newBudget = wpProj.budget + foundPs.budgetImpact;
        const updatedDuration = foundCR.wbsElement.workPackage.duration + foundPs.timelineImpact;

        const changes = [
          {
            changeRequestId: crId,
            implementerId: reviewerId,
            detail: buildChangeDetail('Budget', String(wpProj.budget), String(newBudget))
          },
          {
            changeRequestId: crId,
            implementerId: reviewerId,
            detail: buildChangeDetail('Duration', String(foundCR.wbsElement.workPackage.duration), String(updatedDuration))
          }
        ];
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
    if (accepted && foundCR.type === CR_Type.STAGE_GATE) {
      // if it's a work package, all deliverables and expected activities must be checked
      if (foundCR.wbsElement.workPackage) {
        const wpExpectedActivities = foundCR.wbsElement.workPackage.expectedActivities;
        const wpDeliverables = foundCR.wbsElement.workPackage.deliverables;

        // checks for any unchecked expected activities, if there are any it will return an error
        if (wpExpectedActivities.some((element) => element.dateTimeChecked === null))
          throw new HttpException(400, `Work Package has unchecked expected activities`);

        // checks for any unchecked deliverables, if there are any it will return an error
        const uncheckedDeliverables = wpDeliverables.some((element) => element.dateTimeChecked === null);
        if (uncheckedDeliverables) throw new HttpException(400, `Work Package has unchecked deliverables`);
      }
      // update the status of the associated wp to be complete if needed
      const shouldChangeStatus = foundCR.wbsElement.status !== WBS_Element_Status.COMPLETE;
      const changesList = [];
      if (shouldChangeStatus) {
        changesList.push({
          changeRequestId: crId,
          implementerId: reviewerId,
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
          implementerId: reviewerId,
          wbsElementId: foundCR.wbsElementId,
          detail: buildChangeDetail('Project Lead', oldPL, newPL)
        });
      }
      if (shouldUpdateProjManager) {
        const oldPM = await getUserFullName(foundCR.wbsElement.projectManagerId);
        const newPM = await getUserFullName(actCr.projectManagerId);
        changes.push({
          changeRequestId: foundCR.crId,
          implementerId: reviewerId,
          wbsElementId: foundCR.wbsElementId,
          detail: buildChangeDetail('Project Manager', oldPM, newPM)
        });
      }
      if (shouldChangeStartDate) {
        changes.push({
          changeRequestId: foundCR.crId,
          implementerId: reviewerId,
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
        implementerId: reviewerId,
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
        reviewer: { connect: { userId: reviewerId } },
        reviewNotes,
        accepted,
        dateReviewed: new Date()
      },
      include: { activationChangeRequest: true, wbsElement: { include: { workPackage: true } } }
    });
    // TODO: handle errors
    return updated.crId;
  }

  static async createActivationChangeRequest(
    submitterId: number,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    projectLeadId: number,
    projectManagerId: number,
    startDate: Date,
    confirmDetails: boolean
  ): Promise<Number> {
    // verify user is allowed to create activation change requests
    const user = await prisma.user.findUnique({ where: { userId: submitterId } });

    if (!user) throw new NotFoundException('User', submitterId);

    if (user.role === Role.GUEST) throw new AccessDeniedException();

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

    if (wbsElement === null)
      throw new NotFoundException('WBS Element', `${carNumber}.${projectNumber}.${workPackageNumber}`);

    const createdCR = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitterId } },
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
        `${user.firstName} ${user.lastName} wants to activate ${createdCR.wbsElement.name}` +
        ` in ${createdCR.wbsElement.workPackage?.project.wbsElement.name}`;
      await sendSlackChangeRequestNotification(team, slackMsg, createdCR.crId);
    }

    return createdCR.crId;
  }

  static async createStageGateChangeRequest(
    submitterId: number,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    leftoverBudget: number,
    confirmDone: boolean
  ): Promise<Number> {
    // verify user is allowed to create stage gate change requests
    const user = await prisma.user.findUnique({ where: { userId: submitterId } });
    if (!user) throw new NotFoundException('User', submitterId);
    if (user.role === Role.GUEST) throw new AccessDeniedException();

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

    const createdChangeRequest = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitterId } },
        wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } },
        type,
        stageGateChangeRequest: {
          create: {
            leftoverBudget,
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
        `${user.firstName} ${user.lastName} wants to stage gate ${createdChangeRequest.wbsElement.name}` +
        ` in ${createdChangeRequest.wbsElement.workPackage?.project.wbsElement.name}`;
      await sendSlackChangeRequestNotification(team, slackMsg, createdChangeRequest.crId);
    }

    return createdChangeRequest.crId;
  }

  static async createStandardChangeRequest(
    submitterId: number,
    carNumber: number,
    projectNumber: number,
    workPackageNumber: number,
    type: CR_Type,
    what: string,
    why: any,
    budgetImpact: number
  ): Promise<Number> {
    // verify user is allowed to create stage gate change requests
    const user = await prisma.user.findUnique({ where: { userId: submitterId } });
    if (!user) throw new NotFoundException('User', submitterId);
    if (user.role === Role.GUEST) throw new AccessDeniedException();

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

    const createdCR = await prisma.change_Request.create({
      data: {
        submitter: { connect: { userId: submitterId } },
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
      const slackMsg = `${type} CR submitted by ${user.firstName} ${user.lastName} for the ${project.wbsElement.name} project`;
      await sendSlackChangeRequestNotification(project.team, slackMsg, createdCR.crId, budgetImpact);
    }
    return createdCR.crId;
  }

  static async addProposedSolution(
    submitterId: number,
    crId: number,
    budgetImpact: number,
    description: string,
    timelineImpact: number,
    scopeImpact: string
  ): Promise<String> {
    // verify user is allowed to create stage gate change requests
    const user = await prisma.user.findUnique({ where: { userId: submitterId } });
    if (!user) throw new NotFoundException('User', submitterId);
    if (user.role === Role.GUEST) throw new AccessDeniedException();

    // ensure existence of change request
    const foundCR = await prisma.change_Request.findUnique({
      where: { crId }
    });
    if (!foundCR) throw new NotFoundException('Change Request', crId);

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
        createdBy: { connect: { userId: submitterId } }
      }
    });

    return createProposedSolution.proposedSolutionId;
  }
}
