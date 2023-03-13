import { Description_Bullet, Scope_CR_Why_Type, Team, User, Work_Package } from '@prisma/client';
import prisma from '../prisma/prisma';
import { ChangeRequestReason } from 'shared';
import { sendMessage } from '../integrations/slack.utils';
import { HttpException, NotFoundException } from './errors.utils';

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
 * Validates that there are no unchecked expected activities or delivrerables
 * @param workPackage Work package to check bullets for
 * @throws if there are any unchecked expected activities or deliverables
 */
export const throwIfUncheckedDescriptionBullets = (
  workPackage: (Work_Package & { expectedActivities: Description_Bullet[]; deliverables: Description_Bullet[] }) | null
) => {
  // if it's a work package, all deliverables and expected activities must be checked
  if (workPackage) {
    const wpExpectedActivities = workPackage.expectedActivities;
    const wpDeliverables = workPackage.deliverables;

    // checks for any unchecked expected activities, if there are any it will return an error
    if (wpExpectedActivities.some((element) => element.dateTimeChecked === null && element.dateDeleted === null))
      throw new HttpException(400, `Work Package has unchecked expected activities`);

    // checks for any unchecked deliverables, if there are any it will return an error
    const uncheckedDeliverables = wpDeliverables.some(
      (element) => element.dateTimeChecked === null && element.dateDeleted === null
    );
    if (uncheckedDeliverables) throw new HttpException(400, `Work Package has unchecked deliverables`);
  }
};
