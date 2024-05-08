import { ChangeRequest, daysBetween, Task, User, wbsPipe, WorkPackage } from 'shared';
import { reactToMessage, replyToMessageInThread, sendMessage } from '../integrations/slack';
import { getUserSlackId } from './users.utils';
import prisma from '../prisma/prisma';
import { HttpException } from './errors.utils';
import { Change_Request, Team, WBS_Element } from '@prisma/client';
import { UserWithSettings } from './auth.utils';
import { usersToSlackPings } from './notifications.utils';

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

  const { lead } = workPackage;
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
 * @param reviewers the user information of the reviewers
 * @param changeRequest the requested change request to be reviewed
 */
export const sendSlackRequestedReviewNotification = async (
  reviewers: UserWithSettings[],
  changeRequest: ChangeRequest
): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod

  const btnText = `View CR`;
  const changeRequestLink = `https://finishlinebyner.com/change-requests/${changeRequest.crId}`;
  const slackPingMessage = usersToSlackPings(reviewers);
  const fullMsg = `${slackPingMessage} Your review has been requested on CR #${changeRequest.crId}!`;

  const threads = await prisma.message_Info.findMany({ where: { changeRequestId: changeRequest.crId } });

  threads.forEach((thread) =>
    replyToMessageInThread(thread.channelId, thread.timestamp, fullMsg, changeRequestLink, btnText)
  );
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

/**
 * Send a notification to users that reimbursement request is denied on Slack
 * @param slackId the slack id of the assignee
 * @param denial the denial if the reimbursement request
 */
export const sendReimbursementRequestDeniedNotification = async (slackId: string, requestId: string): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod

  const msg = `Your reimbursement request has been denied.`;
  const link = `https://finishlinebyner.com/finance/reimbursement-requests/${requestId}`;
  const linkButtonText = 'View Reimbursement Request';

  try {
    await sendMessage(slackId, msg, link, linkButtonText);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new HttpException(500, `Failed to send slack notification: ${error.message}`);
    }
  }
};

export const sendSlackDesignReviewNotification = async (
  slackId: string,
  designReviewId: string,
  designReviewName: string
) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const msg = `You have been invited to the ${designReviewName} Design Review!`;
  const fullLink = `https://finishlinebyner.com/settings/preferences?drId=${designReviewId}`;
  const linkButtonText = 'Confirm Availability';

  try {
    await sendMessage(slackId, msg, fullLink, linkButtonText);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new HttpException(500, `Failed to send slack notification: ${error.message}`);
    }
  }
};

/**
 * Sends slack notifications to teams for new CRs and returns the messages sent in slack
 *
 * @param team the teams of the cr to notify
 * @param message the message to send to the teams
 * @param crId the cr id
 * @param budgetImpact the amount of budget requested for the cr
 * @returns the channelId and timestamp of the messages sent in slack
 */
export const sendSlackChangeRequestNotification = async (
  team: Team,
  message: string,
  crId: number,
  budgetImpact?: number
): Promise<{ channelId: string; ts: string }[]> => {
  if (process.env.NODE_ENV !== 'production') return []; // don't send msgs unless in prod
  const msgs: { channelId: string; ts: string }[] = [];
  const fullMsg = `:tada: New Change Request! :tada: ${message}`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR #${crId}`;
  const notification = await sendMessage(team.slackId, fullMsg, fullLink, btnText);
  if (notification) msgs.push(notification);

  if (budgetImpact && budgetImpact > 100) {
    const importantNotification = await sendMessage(
      process.env.SLACK_EBOARD_CHANNEL!,
      `${fullMsg} with $${budgetImpact} requested`,
      fullLink,
      btnText
    );
    if (importantNotification) msgs.push(importantNotification);
  }

  return msgs;
};

export const sendAndGetSlackCRNotifications = async (
  teams: Team[],
  changeRequest: Change_Request,
  submitter: User,
  wbsElement: WBS_Element,
  projectWbsName: string
) => {
  const notifications: { channelId: string; ts: string }[] = [];
  let message = '';
  switch (changeRequest.type) {
    case 'ACTIVATION':
      message = `${submitter.firstName} ${submitter.lastName} wants to activate ${wbsElement.name} in ${projectWbsName}`;
      break;
    case 'STAGE_GATE':
      message = `${submitter.firstName} ${submitter.lastName} wants to stage gate ${wbsElement.name} in ${projectWbsName}`;
      break;
    default:
      message = `${changeRequest.type} CR submitted by ${submitter.firstName} ${submitter.lastName} for the ${projectWbsName} project`;
  }

  const completion: Promise<void>[] = teams.map(async (team) => {
    const sentNotifications: { channelId: string; ts: string }[] = await sendSlackChangeRequestNotification(
      team,
      message,
      changeRequest.crId
    );
    if (sentNotifications) notifications.push(...sentNotifications);
  });
  await Promise.all(completion);

  return notifications;
};

export const sendSlackCRReviewedNotification = async (slackId: string, crId: number) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const msgs = [];
  const fullMsg = `:tada: Your Change Request was just reviewed! Click the link to view! :tada:`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR#${crId}`;
  msgs.push(sendMessage(slackId, fullMsg, fullLink, btnText));

  return Promise.all(msgs);
};

/**
 * Replies and reacts to slack messages with the new change request status
 *
 * @param threads the threads of cr slack notifications to reply/react to
 * @param crId the cr id
 * @param approved is the cr approved
 */
export const sendSlackCRStatusToThread = async (
  threads: {
    messageInfoId: string;
    channelId: string;
    timestamp: string;
    changeRequestId: number;
  }[],
  crId: number,
  approved: boolean
) => {
  if (process.env.NODE_ENV !== 'production') return; // don't send msgs unless in prod
  const fullMsg = `This Change Request was ${approved ? 'approved! :tada:' : 'denied.'} Click the link to view.`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR#${crId}`;
  try {
    if (threads && threads.length !== 0) {
      const msgs = threads.map((thread) =>
        replyToMessageInThread(thread.channelId, thread.timestamp, fullMsg, fullLink, btnText)
      );
      const reactions = threads.map((thread) =>
        reactToMessage(thread.channelId, thread.timestamp, approved ? 'white_check_mark' : 'x')
      );
      await Promise.all([...msgs, ...reactions]);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new HttpException(500, `Failed to send slack notification: ${err.message}`);
    }
  }
};

/**
 * Adds the relevant slack notifications for a change request to the change request
 *
 * @param crId the change request to add the slack threads to
 * @param notifications the slack threads to add to the change request
 */
export const addSlackThreadsToChangeRequest = async (crId: number, threads: { channelId: string; ts: string }[]) => {
  const promises = threads.map((notification) =>
    prisma.message_Info.create({
      data: {
        changeRequestId: crId,
        channelId: notification.channelId,
        timestamp: notification.ts
      },
      include: {
        changeRequest: true
      }
    })
  );
  await Promise.all(promises);
};
