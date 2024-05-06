import prisma from '../prisma/prisma';
import { Scope_CR_Why_Type, User, Prisma, Change_Request, Change } from '@prisma/client';
import { addWeeksToDate, ChangeRequestReason } from 'shared';
import { HttpException, NotFoundException } from './errors.utils';
import { ChangeRequestStatus } from 'shared';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import { buildChangeDetail } from './changes.utils';
import { changeRequestQueryArgs } from '../prisma-query-args/change-requests.query-args';

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
  projectLeadId?: number,
  projectManagerId?: number
) => {
  if (projectLeadId) {
    const projectLead = await prisma.user.findUnique({ where: { userId: projectLeadId } });
    if (!projectLead) throw new NotFoundException('User', projectLeadId);
  }

  if (projectManagerId) {
    const projectManager = await prisma.user.findUnique({ where: { userId: projectManagerId } });
    if (!projectManager) throw new NotFoundException('User', projectManagerId);
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
    where: { wbsElementId: wbsElemId, dateReviewed: undefined }
  });
  if (openCRs.length > 1)
    throw new HttpException(400, 'There are other open unreviewed change requests for this WBS element');
};
