import prisma from '../prisma/prisma';
import { Scope_CR_Why_Type, Team, User, Prisma, Change_Request, Change } from '@prisma/client';
import { addWeeksToDate, ChangeRequestReason } from 'shared';
import { sendMessage } from '../integrations/slack';
import { HttpException, NotFoundException } from './errors.utils';
import { ChangeRequestStatus } from 'shared';
import changeRequestRelationArgs from '../prisma-query-args/change-requests.query-args';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';
import { buildChangeDetail } from './changes.utils';

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

export const sendSlackChangeRequestNotification = async (
  team: Team,
  message: string,
  crId: number,
  budgetImpact?: number
) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const msgs = [];
  const fullMsg = `:tada: New Change Request! :tada: ${message}`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR #${crId}`;
  msgs.push(sendMessage(team.slackId, fullMsg, fullLink, btnText));

  if (budgetImpact && budgetImpact > 100) {
    msgs.push(
      sendMessage(process.env.SLACK_EBOARD_CHANNEL!, `${fullMsg} with $${budgetImpact} requested`, fullLink, btnText)
    );
  }
  return Promise.all(msgs);
};

export const sendSlackCRReviewedNotification = async (slackId: string, crId: number) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const msgs = [];
  const fullMsg = `:tada: Your Change Request was just reviewed! Clink the link to view! :tada:`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR#${crId}`;
  msgs.push(sendMessage(slackId, fullMsg, fullLink, btnText));

  return Promise.all(msgs);
};

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
  changeRequest: Prisma.Change_RequestGetPayload<typeof changeRequestRelationArgs>
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
