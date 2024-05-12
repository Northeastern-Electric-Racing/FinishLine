import prisma from '../prisma/prisma';
import {
  Scope_CR_Why_Type,
  User,
  Prisma,
  Change_Request,
  Change,
  WBS_Element,
  Project,
  Work_Package,
  Activation_CR
} from '@prisma/client';
import { addWeeksToDate, ChangeRequestReason, WorkPackageStage } from 'shared';
import { HttpException, NotFoundException } from './errors.utils';
import { ChangeRequestStatus } from 'shared';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import { buildChangeDetail, createChange } from './changes.utils';
import { changeRequestQueryArgs } from '../prisma-query-args/change-requests.query-args';
import { transformDate } from './datetime.utils';
import WorkPackagesService from '../services/work-packages.services';
import { descBulletConverter } from './description-bullets.utils';
import ProjectsService from '../services/projects.services';
import { sendSlackCRReviewedNotification } from './slack.utils';
import scopeChangeRequestQueryArgs, {
  projectProposedChangesQueryArgs,
  wbsProposedChangeQueryArgs,
  workPackageProposedChangesQueryArgs
} from '../prisma-query-args/scope-change-requests.query-args';
import projectQueryArgs from '../prisma-query-args/projects.query-args';

export const convertCRScopeWhyType = (whyType: Scope_CR_Why_Type): ChangeRequestReason =>
  ({
    ESTIMATION: ChangeRequestReason.Estimation,
    SCHOOL: ChangeRequestReason.School,
    DESIGN: ChangeRequestReason.Design,
    MANUFACTURING: ChangeRequestReason.Manufacturing,
    RULES: ChangeRequestReason.Rules,
    INITIALIZATION: ChangeRequestReason.Initialization,
    COMPETITION: ChangeRequestReason.Competition,
    MAINTENANCE: ChangeRequestReason.Maintenance,
    OTHER_PROJECT: ChangeRequestReason.OtherProject,
    OTHER: ChangeRequestReason.Other
  }[whyType]);

/**
 * This function updates the start date of all the blockings (and nested blockings) of the initial given work package.
 * It uses a depth first search algorithm for efficiency and to avoid cycles.
 *
 * @param initialWorkPackage the initial work package
 * @param timelineImpact the timeline impact of the proposed solution
 * @param crId the change request id
 * @param reviewer the reviewer of the change request
 */
export const updateBlocking = async (
  initialWorkPackage: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs>,
  timelineImpact: number,
  crId: number,
  reviewer: User
) => {
  // track the wbs element ids we've seen so far so we don't update the same one multiple times
  const seenWbsElementIds: Set<number> = new Set<number>([initialWorkPackage.wbsElement.wbsElementId]);

  // blocking ids that still need to be updated
  const blockingUpdateQueue: number[] = initialWorkPackage.wbsElement.blocking.map((blocking) => blocking.wbsElementId);

  while (blockingUpdateQueue.length > 0) {
    const currWbsId = blockingUpdateQueue.pop(); // get the next blocking and remove it from the queue

    if (!currWbsId) break; // this is more of a type check for pop becuase the while loop prevents this from not existing
    if (seenWbsElementIds.has(currWbsId)) continue; // if we've already seen it we skip it

    seenWbsElementIds.add(currWbsId);

    // get the current wbs object from prisma
    const currWbs = await prisma.wBS_Element.findUnique({
      where: { wbsElementId: currWbsId },
      include: {
        blocking: true,
        workPackage: true
      }
    });

    if (!currWbs) throw new NotFoundException('WBS Element', currWbsId);
    if (currWbs.dateDeleted) continue; // this wbs element has been deleted so skip it
    if (!currWbs.workPackage) continue; // this wbs element is a project so skip it

    const newStartDate: Date = addWeeksToDate(currWbs.workPackage.startDate, timelineImpact);

    const change = {
      changeRequestId: crId,
      implementerId: reviewer.userId,
      detail: buildChangeDetail(
        'Start Date',
        currWbs.workPackage.startDate.toLocaleDateString(),
        newStartDate.toLocaleDateString()
      )
    };

    await prisma.work_Package.update({
      where: { workPackageId: currWbs.workPackage.workPackageId },
      data: {
        startDate: newStartDate,
        wbsElement: {
          update: {
            changes: {
              create: change
            }
          }
        }
      }
    });

    // get all the blockings of the current wbs and add them to the queue to update
    const newBlocking: number[] = currWbs.blocking.map((blocking) => blocking.wbsElementId);
    blockingUpdateQueue.push(...newBlocking);
  }
};

/** Makes sure that a change request has been accepted already (and not deleted)
 * @param crId - the id of the change request to check
 * @returns the change request
 * @throws if the change request is unreviewed, denied, or deleted
 */
export const validateChangeRequestAccepted = async (crId: number) => {
  const changeRequest = await prisma.change_Request.findUnique({ where: { crId }, include: { changes: true } });
  const currentDate = new Date();

  if (!changeRequest) throw new NotFoundException('Change Request', crId);
  if (changeRequest.dateDeleted) throw new HttpException(400, 'Cannot use a deleted change request!');
  if (changeRequest.accepted === null) throw new HttpException(400, 'Cannot implement an unreviewed change request');
  if (!changeRequest.accepted) throw new HttpException(400, 'Cannot implement a denied change request');
  if (!changeRequest.dateReviewed) throw new HttpException(400, 'Cannot use an unreviewed change request');
  const dateImplemented = getDateImplemented(changeRequest);
  if (dateImplemented && currentDate.getTime() - dateImplemented.getTime() > 1000 * 60 * 60 * 24 * 5)
    throw new HttpException(400, 'Cannot tie changes to outdated change request');

  return changeRequest;
};

/**
 * Calculates the status of a change request.
 * @param changeRequest: is the change request payload
 * @returns The status of the change request. Can either be Open, Accepted, Denied, or Implemented
 */
export const calculateChangeRequestStatus = (
  changeRequest: Prisma.Change_RequestGetPayload<typeof changeRequestQueryArgs>
): ChangeRequestStatus => {
  if (changeRequest.changes.length) {
    return ChangeRequestStatus.Implemented;
  } else if (changeRequest.accepted && changeRequest.dateReviewed) {
    return ChangeRequestStatus.Accepted;
  } else if (changeRequest.dateReviewed) {
    return ChangeRequestStatus.Denied;
  }
  return ChangeRequestStatus.Open;
};

export const getDateImplemented = (changeRequest: Change_Request & { changes: Change[] }): Date | undefined => {
  return changeRequest.changes.reduce(
    (res: Date | undefined, change) =>
      !res || change.dateImplemented.valueOf() < res.valueOf() ? change.dateImplemented : res,
    undefined
  );
};

/**
 * Determines whether all the change requests in an array of change requests have been reviewed
 * @param changeRequests the given array of change requests
 * @returns true if all the change requests have been reviewed, and false otherwise
 */
export const allChangeRequestsReviewed = (changeRequests: Change_Request[]) => {
  return changeRequests.every((changeRequest) => changeRequest.dateReviewed);
};

/**
 * Determines if the project lead, project manager, and links all exist
 * @param projectLeadId the project lead id to be verified
 * @param projectManagerId the project manager id to be verified
 * @param links the links to be verified
 */
export const validateProposedChangesFields = async (
  links: {
    url: string;
    linkTypeName: string;
  }[],
  leadId?: number,
  managerId?: number
) => {
  if (leadId) {
    const lead = await prisma.user.findUnique({ where: { userId: leadId } });
    if (!lead) throw new NotFoundException('User', leadId);
  }

  if (managerId) {
    const manager = await prisma.user.findUnique({ where: { userId: managerId } });
    if (!manager) throw new NotFoundException('User', managerId);
  }

  if (links.length > 0) {
    for (const link of links) {
      const linkType = await prisma.linkType.findUnique({ where: { name: link.linkTypeName } });
      if (!linkType) throw new NotFoundException('Link Type', link.linkTypeName);
    }
  }
};

/**
 * throws an error if there are any other open unreviewed change requests for this wbs element
 * @param wbsElemId the wbs element id to find CRs with
 * @throws if the WBS element has open unreviewed change requests
 *
 */
export const validateNoUnreviewedOpenCRs = async (wbsElemId: number) => {
  const openCRs = await prisma.change_Request.findMany({
    where: { wbsElementId: wbsElemId, dateReviewed: null }
  });
  if (openCRs.length > 1)
    throw new HttpException(400, 'There are other open unreviewed change requests for this WBS element');
};

/**
 * Applies the proposed changes by either creating a project if the newProject field is true or editing a project if the newProject field is false and there is an associated project
 * @param wbsProposedChanges the wbs proposed changes of the change request
 * @param projectProposedChanges  the project proposed changes of the change request
 * @param associatedProject the optional associated project of the change request
 * @param reviewer  the user reviewing the change request
 * @param crId  the change request id
 * @param carNumber the car number of the change request's WBS element
 */
export const applyProjectProposedChanges = async (
  wbsProposedChanges: WbsProposedChangesArgs,
  projectProposedChanges: ProjectProposedChangesArgs,
  associatedProject: Project,
  reviewer: User,
  crId: number,
  carNumber: number
) => {
  if (projectProposedChanges) {
    const links = wbsProposedChanges.links.map((link) => ({
      linkId: link.linkInfoId,
      linkTypeName: link.linkTypeName,
      url: link.url
    }));
    const goals = projectProposedChanges.goals.map((goal) => ({
      id: goal.descriptionId,
      detail: goal.detail
    }));
    const features = projectProposedChanges.features.map((feature) => ({
      id: feature.descriptionId,
      detail: feature.detail
    }));
    const otherConstraints = projectProposedChanges.otherConstraints.map((constraint) => ({
      id: constraint.descriptionId,
      detail: constraint.detail
    }));
    if (projectProposedChanges.carNumber !== null) {
      await ProjectsService.createProject(
        reviewer,
        crId,
        carNumber,
        wbsProposedChanges.name,
        projectProposedChanges.summary,
        projectProposedChanges.teams.map((team) => team.teamId),
        projectProposedChanges.budget,
        links,
        projectProposedChanges.rules,
        goals,
        features,
        otherConstraints,
        wbsProposedChanges.leadId,
        wbsProposedChanges.managerId
      );
    } else if (associatedProject && projectProposedChanges.carNumber === null) {
      await ProjectsService.editProject(
        reviewer,
        associatedProject.projectId,
        crId,
        wbsProposedChanges.name,
        projectProposedChanges.budget,
        projectProposedChanges.summary,
        projectProposedChanges.rules,
        goals,
        features,
        otherConstraints,
        links,
        wbsProposedChanges.leadId,
        wbsProposedChanges.managerId
      );
    }
  }
};

/**
 * Applies the proposed changes by either creating a work package if the change request's WBS element is a project or editing a work package if the change request's WBS element is a work package
 * @param wbsProposedChanges the wbs proposed changes of the change request
 * @param workPackageProposedChanges the work package proposed changes of the change request
 * @param associatedProject the optional associated project of the change request
 * @param associatedWorkPackage  the optional associated work package of the change request
 * @param reviewer  the user reviewing the change request
 * @param crId  the change request id
 */
export const applyWorkPackageProposedChanges = async (
  wbsProposedChanges: WbsProposedChangesArgs,
  workPackageProposedChanges: WorkPackageProposedChangesArgs,
  associatedProject: Project | null,
  associatedWorkPackage: Work_Package | null,
  reviewer: User,
  crId: number
) => {
  if (associatedProject) {
    await WorkPackagesService.createWorkPackage(
      reviewer,
      wbsProposedChanges.name,
      crId,
      workPackageProposedChanges.stage as WorkPackageStage,
      transformDate(workPackageProposedChanges.startDate),
      workPackageProposedChanges.duration,
      workPackageProposedChanges.blockedBy,
      workPackageProposedChanges.expectedActivities.map((activity) => activity.detail),
      workPackageProposedChanges.deliverables.map((deliverable) => deliverable.detail)
    );
  } else if (associatedWorkPackage) {
    await WorkPackagesService.editWorkPackage(
      reviewer,
      associatedWorkPackage.workPackageId,
      wbsProposedChanges.name,
      crId,
      workPackageProposedChanges.stage as WorkPackageStage,
      transformDate(workPackageProposedChanges.startDate),
      workPackageProposedChanges.duration,
      workPackageProposedChanges.blockedBy,
      workPackageProposedChanges.expectedActivities.map(descBulletConverter),
      workPackageProposedChanges.deliverables.map(descBulletConverter),
      wbsProposedChanges.leadId!,
      wbsProposedChanges.managerId!
    );
  }
};

/**
 * Reviews a proposed solution and automates the changes
 * @param psId the proposed solution id
 * @param foundCR the change request being reviewed
 * @param crId the change request id
 * @param reviewer  the user reviewing the change request
 */
export const reviewProposedSolution = async (psId: string, foundCR: ChangeRequestWithChanges, reviewer: User) => {
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
      foundCR.crId,
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
      include: { workPackages: workPackageQueryArgs }
    });
    if (!wpProj) throw new NotFoundException('Project', foundCR.wbsElement.workPackage.projectId);

    // calculate the new budget and new duration
    const newBudget = wpProj.budget + foundPs.budgetImpact;
    const updatedDuration = foundCR.wbsElement.workPackage.duration + foundPs.timelineImpact;

    // create changes that reflect the new budget and duration
    const changes = [
      createChange('Budget', wpProj.budget, newBudget, foundCR.crId, reviewer.userId, foundCR.wbsElementId),
      createChange(
        'Duration',
        foundCR.wbsElement.workPackage.duration,
        updatedDuration,
        foundCR.crId,
        reviewer.userId,
        foundCR.wbsElementId
      )
    ];

    // update all the wps this wp is blocking (and nested blockings) of this work package so that their start dates reflect the new duration
    if (foundPs.timelineImpact > 0) {
      await updateBlocking(foundCR.wbsElement.workPackage, foundPs.timelineImpact, foundCR.crId, reviewer);
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
};

/**
 * Sends a slack notification to the submitter of the change request that their change request has been reviewed
 * @param foundCR the change request that was reviewed
 */
export const sendCRSubmitterReviewedNotification = async (foundCR: ChangeRequestWithChanges) => {
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
};

// ---------------------------------------------- Types ----------------------------------------------

export type ChangeRequestWithChanges = Change_Request & {
  activationChangeRequest: Activation_CR;
  scopeChangeRequest: Prisma.Scope_CRGetPayload<typeof scopeChangeRequestQueryArgs>;
  wbsElement: WBS_Element & {
    workPackage?: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs>;
    project?: Prisma.ProjectGetPayload<typeof projectQueryArgs>;
  };
};

export type WorkPackageProposedChangesArgs = Prisma.Work_Package_Proposed_ChangesGetPayload<
  typeof workPackageProposedChangesQueryArgs
>;

export type ProjectProposedChangesArgs = Prisma.Project_Proposed_ChangesGetPayload<typeof projectProposedChangesQueryArgs>;

export type WbsProposedChangesArgs = Prisma.Wbs_Proposed_ChangesGetPayload<typeof wbsProposedChangeQueryArgs>;
