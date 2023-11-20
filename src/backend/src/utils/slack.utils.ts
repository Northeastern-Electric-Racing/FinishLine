import { ChangeRequest, daysBetween, Task, User, wbsPipe, WorkPackage } from 'shared';
import slack, { sendMessage } from '../integrations/slack';
import { getUserSlackId } from './users.utils';
import prisma from '../prisma/prisma';
import { UserWithSettings } from './auth.utils';

// build the "due" string for the upcoming deadlines slack message
const buildDueString = (daysUntilDeadline: number): string => {
  if (daysUntilDeadline < 0) return `was due *${daysUntilDeadline * -1} days ago!*`;
  else if (daysUntilDeadline === 0) return `is due today!`;
  return `is due in ${daysUntilDeadline} days!`;
};

// build the "user" string for the upcoming deadlines slack message
const buildUserString = (lead?: User, slackId?: string): string => {
  if (lead && slackId) return `<@${slackId}>`;
  if (lead && !slackId)
    return `${lead.firstName} ${lead.lastName} (<https://finishlinebyner.com/settings|set your slack id here>)`;
  return '(no project lead)';
};

export const sendSlackUpcomingDeadlineNotification = async (workPackage: WorkPackage): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod

  const { LEAD_CHANNEL_SLACK_ID } = process.env;
  if (!LEAD_CHANNEL_SLACK_ID) return;

  const lead = workPackage.projectLead;
  const slackId = await getUserSlackId(lead?.userId);
  const daysUntilDeadline = daysBetween(workPackage.endDate, new Date());

  const userString = buildUserString(lead, slackId);
  const dueString = buildDueString(daysUntilDeadline);

  const wbsNumber: string = wbsPipe(workPackage.wbsNum);
  const wbsString = `<https://finishlinebyner.com/projects/${wbsNumber}|${wbsNumber}>`;

  const fullMsg = `${userString} ${wbsString}: ${workPackage.projectName} - ${workPackage.name} ${dueString}`;

  await sendMessage(LEAD_CHANNEL_SLACK_ID, fullMsg);
};

/**
 * Send CR requested review notification to reviewer in Slack
 * @param slackId the slack id of the reviewer
 * @param changeRequest the requested change request to be reviewed
 */
export const sendSlackRequestedReviewNotification = async (slackId: string, changeRequest: ChangeRequest): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod

  const changeRequestLink = `<https://finishlinebyner.com/change-requests/${changeRequest.crId.toString()}>`;

  const fullMsg = `Your review has been requested on CR #${changeRequest.crId}: ${changeRequestLink}.`;
  await sendMessage(slackId, fullMsg);
};

/**
 * Send Task assigned notification to assignee on Slack
 * @param slackId the slack id of the assignee
 * @param task the task they were assigned to
 */
export const sendSlackTaskAssignedNotification = async (slackId: string, task: Task): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod

  const project = await prisma.wBS_Element.findUnique({ where: { wbsNumber: task.wbsNum } });
  const msg = `You have been assigned to a task: ${task.title} on project ${wbsPipe(task.wbsNum)} - ${project?.name}`;
  const link = `https://finishlinebyner.com/projects/${wbsPipe(task.wbsNum)}/tasks`;
  const linkButtonText = 'View Task';
  await sendMessage(slackId, msg, link, linkButtonText);
};

export const sendSlackReimbursementRequestNotification = async (
  slackId: string,
  recipient: UserWithSettings,
  totalCost: number,
  reimbursementRequestId: string
) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const fullMsg = `:tada: Reimbursement Request made by ${recipient} for $${totalCost} :tada:`;
  const fullLink = `https://finishlinebyner.com/finance/reimbursement-requests/${reimbursementRequestId}`;
  const btnText = `View Reimbursement Request`;
  await sendMessage(slackId, fullMsg, fullLink, btnText);
};
