import prisma from '../prisma/prisma';
import { Scope_CR_Why_Type, Team, User, Prisma } from '@prisma/client';
import { addWeeksToDate, ChangeRequestReason } from 'shared';
import { buildChangeDetail } from './utils';
import { sendMessage } from '../integrations/slack.utils';
import { HttpException, NotFoundException } from './errors.utils';
import { ChangeRequestStatus } from 'shared';
import changeRequestRelationArgs from '../prisma-query-args/change-requests.query-args';
import workPackageQueryArgs from '../prisma-query-args/work-packages.query-args';

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
  team: Team & {
    leader: User;
  },
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
 * Makes sure that a change request has been accepted already (and not deleted)
 * @param crId - the id of the change request to check
 * @returns the change request
 * @throws if the change request is unreviewed, denied, or deleted
 */
export const validateChangeRequestAccepted = async (crId: number) => {
  const changeRequest = await prisma.change_Request.findUnique({ where: { crId } });

  if (!changeRequest) throw new NotFoundException('Change Request', crId);
  if (changeRequest.dateDeleted) throw new HttpException(400, 'Cannot use a deleted change request!');
  if (changeRequest.accepted === null) throw new HttpException(400, 'Cannot implement an unreviewed change request');
  if (!changeRequest.accepted) throw new HttpException(400, 'Cannot implement a denied change request');

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
