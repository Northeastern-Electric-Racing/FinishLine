import {
  ChangeRequest,
  daysBetween,
  Task,
  wbsPipe,
  calculateEndDate,
  CreateSponsorTask,
  User,
  Event,
  meetingStartTimePipeNumbers
} from 'shared';
import { Account_Code, Reimbursement_Product_Other_Reason, Sponsor_Task } from '@prisma/client';
import {
  editMessage,
  getChannelName,
  getUserName,
  getUsersInChannel,
  reactToMessage,
  replyToMessageInThread,
  sendMessage
} from '../integrations/slack';
import { getUserSlackId, getUserSlackMentionOrName } from './users.utils';
import prisma from '../prisma/prisma';
import { HttpException } from './errors.utils';
import { Change_Request, Team, WBS_Element } from '@prisma/client';
import { UserWithSettings } from './auth.utils';
import { usersToSlackPings, userToSlackPing } from './notifications.utils';
import { WorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args';
import { Prisma } from '@prisma/client';
import { userTransformer } from '../transformers/user.transformer';
import { SlackRichTextBlock } from '../services/slack.services';
import UsersService from '../services/users.services';

interface SlackMessageThread {
  messageInfoId: string;
  channelId: string;
  timestamp: string;
  changeRequestId: string | null;
}

const DEV_TESTING_OVERRIDE = process.env.SEND_SLACK_MESSAGES_IN_DEV === 'true';

// build the "due" string for the upcoming deadlines slack message
export const buildDueString = (daysUntilDeadline: number): string => {
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

export const sendSlackUpcomingDeadlineNotification = async (
  workPackage: Prisma.Work_PackageGetPayload<WorkPackageQueryArgs>
): Promise<void> => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod
  const endDate = calculateEndDate(workPackage.startDate, workPackage.duration);

  const { lead, manager } = workPackage.wbsElement;
  const slackId = lead ? await getUserSlackId(lead?.userId) : undefined;
  const daysUntilDeadline = daysBetween(endDate, new Date());

  const userString = lead ? buildUserString(userTransformer(lead), slackId) : 'No Lead Set';
  const managerString = manager
    ? buildUserString(userTransformer(manager), await getUserSlackId(manager.userId))
    : 'No Manager Set';
  const dueString = buildDueString(daysUntilDeadline);

  const wbsNumber: string = wbsPipe(workPackage.wbsElement);
  const wbsString = `<https://finishlinebyner.com/projects/${wbsNumber}|${wbsNumber}>`;

  const fullMsg = `${userString} ${managerString} ${wbsString}: ${workPackage.project.wbsElement.name} - ${workPackage.wbsElement.name} ${dueString}`;

  const promises = workPackage.project.teams.map(async (team) => await sendMessage(team.slackId, fullMsg));

  await Promise.all(promises);
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
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod

  const btnText = `View CR`;
  const changeRequestLink = `https://finishlinebyner.com/change-requests/${changeRequest.crId}`;
  const slackPingMessage = usersToSlackPings(reviewers);
  const fullMsg = `${slackPingMessage} Your review has been requested on CR #${changeRequest.identifier}!`;

  const threads = await prisma.message_Info.findMany({ where: { changeRequestId: changeRequest.crId } });

  threads.forEach((thread) =>
    replyToMessageInThread(thread.channelId, thread.timestamp, fullMsg, changeRequestLink, btnText)
  );
};

/**
 * Send Task assigned notification to assignee on Slack
 * @param slackId the slack id of the assignee
 * @param task the task they were assigned to
 * @param organizationId the organization id of the current user
 */
export const sendSlackTaskAssignedNotification = async (
  slackId: string,
  task: Task,
  organizationId: string
): Promise<void> => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod

  const project = await prisma.wBS_Element.findUnique({ where: { wbsNumber: { ...task.wbsNum, organizationId } } });
  const msg = `You have been assigned to a task: ${task.title} on project ${wbsPipe(task.wbsNum)} - ${project?.name}`;
  const link = `https://finishlinebyner.com/projects/${wbsPipe(task.wbsNum)}/tasks`;
  const linkButtonText = 'View Task';
  await sendMessage(slackId, msg, link, linkButtonText);
};

/**
 * Send a notification to users that a reimbursement request is created on Slack
 * @param requestId the id if the reimbursement request
 * @param submitterId the id of the user who created the reimbursement request
 */
export const sendReimbursementRequestCreatedNotificationAndCreateMessageInfo = async (
  requestId: string,
  requestIdentifier: number,
  submitterId: string,
  organizationId: string
): Promise<void> => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod

  const msg = `${await getUserSlackMentionOrName(submitterId)} created a reimbursement request (ID#: ${requestIdentifier}) 💲`;
  const link = `https://finishlinebyner.com/finance/reimbursement-requests/${requestId}`;
  const linkButtonText = 'View Reimbursement Request';

  const financeTeam = await prisma.team.findFirst({
    where: { financeTeam: true, organizationId }
  });

  if (!financeTeam) throw new HttpException(500, 'Finance team does not exist!');

  try {
    const messageInfo = await sendMessage(financeTeam.slackId, msg, link, linkButtonText);
    if (!messageInfo) return; // Not on prod

    await prisma.message_Info.create({
      data: {
        reimbursementRequestId: requestId,
        channelId: messageInfo.channelId,
        timestamp: messageInfo.ts
      }
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new HttpException(500, `Failed to send slack notification: ${error.message}`);
    }
  }
};

/**
 * Send a notification to users that reimbursement request is denied on Slack
 * @param slackId the slack id of the assignee
 * @param denial the denial if the reimbursement request
 */
export const sendReimbursementRequestDeniedNotification = async (slackId: string, requestId: string): Promise<void> => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod

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

export const sendThreadResponse = async (threads: SlackMessageThread[], message: string) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod
  try {
    if (threads && threads.length !== 0) {
      const msgs = threads.map((thread) => replyToMessageInThread(thread.channelId, thread.timestamp, message));
      await Promise.all(msgs);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new HttpException(500, `Failed to send slack notifications: ${err.message}`);
    }
  }
};

export const sendReimbursementRequestPendingFinanceNotification = async (
  threads: SlackMessageThread[],
  assigneeId: string | null
) =>
  await sendThreadResponse(
    threads,
    `${assigneeId ? await getUserSlackMentionOrName(assigneeId) : ''} This Reimbursement Request is now pending finance :moneybag:`
  );

export const sendReimbursementRequestLeadershipApprovedNotification = async (
  threads: SlackMessageThread[],
  approverId: string,
  recipientId: string
) => {
  // Only notify parties if the recipient is different from the approver
  if (approverId === recipientId) return;
  await sendThreadResponse(
    threads,
    `${await getUserSlackMentionOrName(approverId)} has approved this reimbursement request. ${await getUserSlackMentionOrName(recipientId)} you may now purchase the items, add the receipts, and mark the reimbursement request as pending finance.`
  );
};

export const sendReimbursementRequestChangesRequestedNotification = async (threads: SlackMessageThread[], userId: string) =>
  await sendThreadResponse(
    threads,
    `${await getUserSlackMentionOrName(userId)} has requested changes on this reimbursement request, please make the changes and remark as pending finance.`
  );

export const sendSubmittedToSaboNotification = async (threads: SlackMessageThread[]) => {
  await sendThreadResponse(threads, 'This reimbursement request has been submitted to sabo!');
};

export const sendPendingSaboSubmissionNotification = async (
  threads: SlackMessageThread[],
  financeUserId: string,
  pendingSubmissionFromId: string
) => {
  await sendThreadResponse(
    threads,
    `${await getUserSlackMentionOrName(financeUserId)} has added this reimbursement request to Concur. ${await getUserSlackMentionOrName(pendingSubmissionFromId)}, please check your email to approve the request in Concur and mark it as submitted on Finishline.`
  );
};

export const sendSlackEventConfirmNotification = async (
  slackId: string,
  eventId: string,
  eventName: string,
  projectName: string
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod
  const msg = `You have been invited to the ${eventName} Design Review in project ${projectName}!`;
  const fullLink = isProduction
    ? `https://finishlinebyner.com/settings/preferences?eventId=${eventId}`
    : `http://localhost:3000/settings/preferences?eventId=${eventId}`;
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
 * @param identifier the cr identifier
 * @returns the channelId and timestamp of the messages sent in slack
 */
export const sendSlackChangeRequestNotification = async (
  team: Team,
  message: string,
  crId: string,
  identifier: number
): Promise<{ channelId: string; ts: string }[]> => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return []; // don't send msgs unless in prod
  const msgs: { channelId: string; ts: string }[] = [];
  const fullMsg = `:tada: New Change Request! :tada: ${message}`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR #${identifier}`;
  const notification = await sendMessage(team.slackId, fullMsg, fullLink, btnText);
  if (notification) msgs.push(notification);

  return msgs;
};

export const sendAndGetSlackCRNotifications = async (
  teams: Team[],
  changeRequest: Change_Request,
  submitter: User,
  wbsElement?: WBS_Element,
  projectWbsName?: string,
  category?: Reimbursement_Product_Other_Reason,
  accoundCode?: Account_Code
) => {
  const notifications: { channelId: string; ts: string }[] = [];
  let message = '';
  switch (changeRequest.type) {
    case 'ACTIVATION':
      message = `${submitter.firstName} ${submitter.lastName} is activating ${wbsElement?.name} in ${projectWbsName}`;
      break;
    case 'STAGE_GATE':
      message = `${submitter.firstName} ${submitter.lastName} is stage gating ${wbsElement?.name} in ${projectWbsName}`;
      break;
    case 'BUDGET':
      message = `${submitter.firstName} ${submitter.lastName} wants to change the budget of ${category ? category.name : accoundCode?.name}`;
      break;
    default:
      message = `${changeRequest.type} CR submitted by ${submitter.firstName} ${submitter.lastName} for the ${projectWbsName} project`;
  }

  const completion: Promise<void>[] = teams.map(async (team) => {
    const sentNotifications: { channelId: string; ts: string }[] = await sendSlackChangeRequestNotification(
      team,
      message,
      changeRequest.crId,
      changeRequest.identifier
    );
    if (sentNotifications) notifications.push(...sentNotifications);
  });
  await Promise.all(completion);

  return notifications;
};

export const sendSlackEventNotification = async (
  team: Team,
  message: string
): Promise<{ channelId: string; ts: string }[]> => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return []; // don't send msgs unless in prod
  const msgs: { channelId: string; ts: string }[] = [];
  const fullMsg = `${message}`;
  const fullLink = `https://finishlinebyner.com/design-review-calendar`;
  const btnText = `View Calendar`;
  const notification = await sendMessage(team.slackId, fullMsg, fullLink, btnText);
  if (notification) msgs.push(notification);

  return msgs;
};

export const sendSlackEventNotifications = async (
  teams: Team[],
  event: Event,
  submitter: User,
  workPackageName: string,
  projectName: string
) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return []; // don't send msgs unless in prod
  const notifications: { channelId: string; ts: string }[] = [];
  const message = `:spiral_calendar_pad: Design Review for *${workPackageName}* is being scheduled by ${submitter.firstName} ${submitter.lastName} in project ${projectName}`;

  const completion: Promise<void>[] = teams.map(async (team) => {
    const sentNotifications: { channelId: string; ts: string }[] = await sendSlackEventNotification(team, message);
    if (sentNotifications) notifications.push(...sentNotifications);
  });
  await Promise.all(completion);

  const promises = notifications.map(
    async (notification) =>
      await prisma.message_Info.create({
        data: {
          eventId: event.eventId,
          channelId: notification.channelId,
          timestamp: notification.ts
        },
        include: {
          event: true
        }
      })
  );
  await Promise.all(promises);

  return notifications;
};

export const sendEventUserConfirmationToThread = async (threads: SlackMessageThread[], submitter: UserWithSettings) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod
  const slackPing = userToSlackPing(submitter);
  const fullMsg = `${slackPing} confirmed their availability!`;
  try {
    if (threads && threads.length !== 0) {
      const msgs = threads.map((thread) => replyToMessageInThread(thread.channelId, thread.timestamp, fullMsg));
      await Promise.all(msgs);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new HttpException(500, `Failed to send slack notification: ${err.message}`);
    }
  }
};

export const sendEventConfirmationToThread = async (threads: SlackMessageThread[], submitter: UserWithSettings) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod
  const slackPing = userToSlackPing(submitter);
  const fullMsg = `${slackPing} All of the required attendees have confirmed their availability!`;
  try {
    if (threads && threads.length !== 0) {
      const msgs = threads.map((thread) => replyToMessageInThread(thread.channelId, thread.timestamp, fullMsg));
      await Promise.all(msgs);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new HttpException(500, `Failed to send slack notification: ${err.message}`);
    }
  }
};

export const sendEventScheduledSlackNotif = async (threads: SlackMessageThread[], event: Event) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod

  // Get work package names
  const wpNames = event.workPackages.map((wp) => wp.wbsElement.name).join(', ');
  const drName = event.title + (wpNames ? ` (${wpNames})` : '');

  // Get the first scheduled time
  const [firstScheduledTime] = event.scheduledTimes;
  if (!firstScheduledTime) {
    throw new HttpException(400, 'Event has no scheduled times');
  }

  const dateScheduled = firstScheduledTime.initialDateScheduled;

  // Extract meeting times from scheduled slots
  const meetingTimes = event.scheduledTimes
    .map((slot) => (slot.startTime ? new Date(slot.startTime).getHours() : null))
    .filter((hour): hour is number => hour !== null)
    .sort((a, b) => a - b);

  const drTime = `${dateScheduled.toLocaleDateString()} at ${meetingStartTimePipeNumbers(meetingTimes)}`;
  const drSubmitter = `${event.userCreated.firstName} ${event.userCreated.lastName}`;

  // Check for online/in-person location
  const zoomLink = event.zoomLink && `on <${event.zoomLink}|Zoom>`;
  const inPersonLocation = event.location && `in ${event.location}`;

  const location = zoomLink && inPersonLocation ? `${inPersonLocation} and ${zoomLink}` : inPersonLocation || zoomLink || '';

  const msg = `:spiral_calendar_pad: Design Review for *${drName}* has been scheduled for *${drTime}* ${location} by ${drSubmitter}`;
  const docLink = event.questionDocumentLink ? `<${event.questionDocumentLink}|Doc Link>` : '';
  const threadMsg = `The Design Review has been Scheduled! \n` + docLink;

  try {
    if (threads && threads.length !== 0) {
      const msgs = threads.map((thread) => editMessage(thread.channelId, thread.timestamp, msg));
      await Promise.all(msgs);
      const threadMsgs = threads.map((thread) => replyToMessageInThread(thread.channelId, thread.timestamp, threadMsg));
      await Promise.all(threadMsgs);
      const reactions = threads.map((thread) => reactToMessage(thread.channelId, thread.timestamp, 'calendar'));
      await Promise.all(reactions);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new HttpException(500, `Failed to send slack notification: ${err.message}`);
    }
  }
};

export const sendSlackCRReviewedNotification = async (
  slackId: string,
  crId: string,
  identifier: number,
  comments: string | null
) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod
  const msgs: { channelId: string; ts: string }[] = [];
  const fullMsg = `:tada: Your Change Request was just reviewed!${
    comments ? `\n Comments: ${comments}` : ''
  }\nClick the link to view! :tada:`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR#${identifier}`;
  const notification = await sendMessage(slackId, fullMsg, fullLink, btnText);
  if (notification) msgs.push(notification);

  return Promise.all(msgs);
};

/**
 * Replies and reacts to slack messages with the new change request status
 *
 * @param threads the threads of cr slack notifications to reply/react to
 * @param crId the cr id
 * @param identifier the cr identifier
 * @param approved is the cr approved
 */
export const sendSlackCRStatusToThread = async (
  threads: SlackMessageThread[],
  crId: string,
  identifier: number,
  approved: boolean
) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod
  const fullMsg = `This Change Request was ${approved ? 'approved! :tada:' : 'denied.'} Click the link to view.`;
  const fullLink = `https://finishlinebyner.com/cr/${crId}`;
  const btnText = `View CR#${identifier}`;
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
export const addSlackThreadsToChangeRequest = async (crId: string, threads: { channelId: string; ts: string }[]) => {
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

/**
 * Converts a SlackRichTextBlock into a string representation for an announcement.
 * @param block the block of information from slack
 * @returns the string that will be combined with other block's strings to create the announcement
 */
export const blockToString = async (block: SlackRichTextBlock) => {
  switch (block.type) {
    case 'broadcast':
      return '@' + block.range;
    case 'color':
      return block.value ?? '';
    case 'channel':
      //channels are represented as an id, get the name from the slack api
      const channelName: string =
        (await getChannelName(block.channel_id ?? '')) ?? `ISSUE PARSING CHANNEL:${block.channel_id}`;
      return '#' + channelName;
    case 'date':
      return new Date(block.timestamp ?? 0).toISOString();
    case 'emoji':
      //if the emoji is a unicode emoji, convert the unicode to a string,
      //if it is a slack emoji just use the name of the emoji
      if (block.unicode) {
        return String.fromCodePoint(parseInt(block.unicode, 16));
      }
      return 'emoji:' + block.name;
    case 'link':
      if (block.text) {
        return `${block.text}:(${block.url})`;
      }
      return block.url ?? '';
    case 'text':
      return block.text ?? '';
    case 'user':
      //users are represented as an id, get the name of the user from the slack api
      const userName: string = (await getUserName(block.user_id ?? '')) ?? `Unknown User:${block.user_id}`;
      return '@' + userName;
    case 'usergroup':
      return `usergroup:${block.usergroup_id}`;
  }
};

/**
 * Gets the users notified in a specific SlackRichTextBlock.
 * @param block the block that may contain mentioned user/users
 * @param orgainzationId the id of the organization corresponding to this slack channel
 * @param channelId the id of the channel that the block is being sent in
 * @returns an array of prisma user ids of users to be notified
 */
export const blockToMentionedUsers = async (
  block: SlackRichTextBlock,
  organizationId: string,
  channelId: string
): Promise<string[]> => {
  switch (block.type) {
    case 'broadcast':
      switch (block.range) {
        case 'everyone':
          const usersInOrg = await UsersService.getAllOrgUsers(organizationId);
          return usersInOrg.map((user) => user.userId);
        case 'channel':
        case 'here':
          //@here behaves the same as @channel; notifies all the users in that channel
          const slackIds: string[] = await getUsersInChannel(channelId);
          const prismaIds: (string | undefined)[] = await Promise.all(slackIds.map(getUserIdFromSlackId));
          return prismaIds.filter((id): id is string => id !== undefined);
        default:
          return [];
      }
    case 'user':
      const prismaId = await getUserIdFromSlackId(block.user_id ?? '');
      return prismaId ? [prismaId] : [];
    default:
      //only broadcasts and specific user mentions add recievers to announcements
      return [];
  }
};

/**
 * given a slack id, produce the user id of the corresponding user
 * @param slackId the slack id in the settings of the user
 * @returns the user id, or undefined if no users were found
 */
export const getUserIdFromSlackId = async (slackId: string): Promise<string | undefined> => {
  const user = await prisma.user.findFirst({
    where: {
      userSettings: {
        slackId
      }
    }
  });

  if (!user) return undefined;

  return user.userId;
};

export const sendSlackPartReviewRequestNotif = async (
  slackId: string,
  projectName: string,
  partName: string,
  partLink: string
) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod

  const msg = `Your review has been requested on part: ${partName} for project: ${projectName}`;
  const link = `https://finishlinebyner.com${partLink}`;
  const linkButtonText = 'View Part';
  await sendMessage(slackId, msg, link, linkButtonText);
};

export const sendSlackPartAssignmentNotif = async (
  slackId: string,
  projectName: string,
  partName: string,
  partLink: string
) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod

  const msg = `You have been assigned to part: ${partName} on project: ${projectName}`;
  const link = `https://finishlinebyner.com${partLink}`;
  const linkButtonText = 'View Part';
  await sendMessage(slackId, msg, link, linkButtonText);
};

/**
 * Sends a notification to the assignee of a sponsor task
 * @param assignee the user to notify
 * @param sponsorTask the sponsor task to notify about
 * @param sponsor the name of the sponsor
 */
export const notifySponsorTaskAssignee = async (
  assignee: UserWithSettings,
  sponsorTask: Sponsor_Task | CreateSponsorTask,
  sponsor: string
) => {
  if (process.env.NODE_ENV !== 'production' && !DEV_TESTING_OVERRIDE) return; // don't send msgs unless in prod
  if (!assignee.userSettings?.slackId) return;

  const msg = `You have been assigned a task for ${sponsor}: ${sponsorTask.notes}`;
  const link = `https://finishlinebyner.com/finance/companies/sponsors`;
  const linkButtonText = `View Tasks for ${sponsor}`;
  await sendMessage(assignee.userSettings?.slackId, msg, link, linkButtonText);
};
