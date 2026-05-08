import { getChannelName, getUserName } from '../integrations/slack.js';
import AnnouncementService from './announcement.services.js';
import { Announcement, ReimbursementStatusType } from 'shared';
import prisma from '../prisma/prisma.js';
import { blockToMentionedUsers, blockToString, getUserIdFromSlackId } from '../utils/slack.utils.js';
import {
  AccessDeniedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import ReimbursementRequestService from './reimbursement-requests.services.js';
import ChangeRequestsService from './change-requests.services.js';

/**
 * Represents a slack event for a message in a channel.
 */
export interface SlackMessageEvent {
  type: 'message';
  subtype?: string;
  channel: string;
  event_ts: string;
  channel_type: string;
  [key: string]: any;
}

/**
 * Represents a slack message event for a standard sent message.
 */
export interface SlackMessage extends SlackMessageEvent {
  user: string;
  client_msg_id: string;
  text: string;
  blocks: {
    type: string;
    block_id: string;
    elements: any[];
  }[];
}

/**
 * Represents a slack message event for a deleted message.
 */
export interface SlackDeletedMessage extends SlackMessageEvent {
  subtype: 'message_deleted';
  previous_message: SlackMessage;
}

/**
 * Represents a slack message event for an edited message.
 */
export interface SlackUpdatedMessage extends SlackMessageEvent {
  subtype: 'message_changed';
  message: SlackMessage;
  previous_message: SlackMessage;
}

/**
 * Represents a block of information within a message. These blocks with an array
 * make up all the information needed to represent the content of a message.
 */
export interface SlackRichTextBlock {
  type: 'broadcast' | 'color' | 'channel' | 'date' | 'emoji' | 'link' | 'text' | 'user' | 'usergroup';
  range?: string;
  value?: string;
  channel_id?: string;
  timestamp?: number;
  name?: string;
  unicode?: string;
  url?: string;
  text?: string;
  user_id?: string;
  usergroup_id?: string;
}

/**
 * Represents a Slack block action body structure.
 * The general structure is validated in routes, while action-specific fields
 * (action_id and value format) are validated in controllers.
 */
export interface SlackBlockActionBody {
  type: 'block_actions';
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  api_app_id: string;
  token: string;
  container: {
    type: string;
    message_ts: string;
    channel_id: string;
    is_ephemeral: boolean;
    thread_ts?: string; // Optional - if present, the message is in a thread
  };
  trigger_id: string;
  team: {
    id: string;
    domain: string;
  };
  enterprise: null | {
    id: string;
    name: string;
  };
  is_enterprise_install: boolean;
  channel: {
    id: string;
    name: string;
  };
  state: {
    values: Record<string, any>;
  };
  response_url: string;
  actions: Array<{
    action_id: string; // Validated in controller, not routes
    block_id: string;
    text?: any;
    value: string; // Validated for format in controller, not routes
    style?: string;
    type: string;
    action_ts: string;
  }>;
}

/**
 * Represents the parsed value from a SABO submission action
 */
export interface SaboSubmissionActionValue {
  reimbursementRequestId: string;
}

/**
 * Represents the parsed value from a CR approval action
 */
export interface CrApprovalActionValue {
  crId: string;
}

export default class SlackServices {
  /**
   * Handles the Slack button click for marking a reimbursement request as SABO submitted.
   * This performs the business logic for processing the SABO submission confirmation.
   *
   * @param userSlackId The Slack user ID of the user who clicked the button
   * @param teamSlackId The Slack team ID (workspace ID) where the action occurred
   * @param reimbursementRequestId The ID of the reimbursement request to mark as submitted
   * @param interactiveMessageTs The timestamp of the interactive message (to delete after processing)
   */
  static async handleSaboSubmittedAction(userSlackId: string, reimbursementRequestId: string): Promise<void> {
    // Find the user by their slack ID
    const user = await prisma.user.findFirst({
      where: {
        userSettings: {
          slackId: userSlackId
        }
      }
    });

    if (!user) {
      console.error('User not found for slack ID:', userSlackId);
      throw new NotFoundException('User', userSlackId);
    }

    // Find the reimbursement request
    const reimbursementRequest = await prisma.reimbursement_Request.findUnique({
      where: {
        reimbursementRequestId
      },
      include: {
        organization: true,
        reimbursementStatuses: true,
        notificationSlackThreads: true
      }
    });

    if (!reimbursementRequest) {
      throw new NotFoundException('Reimbursement Request', reimbursementRequestId);
    }

    // Verify that the user's organization matches the reimbursement request's organization
    const userOrganization = await prisma.user.findFirst({
      where: {
        userId: user.userId
      },
      include: {
        organizations: true
      }
    });

    const hasAccess = userOrganization?.organizations.some(
      (org) => org.organizationId === reimbursementRequest.organizationId
    );

    if (!hasAccess) {
      throw new InvalidOrganizationException('Reimbursement Request');
    }

    // If the reimbursement request has already been submitted to SABO, just return (message will be deleted by route)
    if (
      reimbursementRequest.reimbursementStatuses.some((status) => status.type === ReimbursementStatusType.SABO_SUBMITTED)
    ) {
      return;
    }

    // Call the service function to mark as SABO submitted
    await ReimbursementRequestService.markReimbursementRequestAsSaboSubmitted(
      reimbursementRequestId,
      user,
      reimbursementRequest.organization
    );
  }

  /**
   * Approves a change request from a Slack interactive button click.
   * Auth (admin/head/requested-reviewer) is enforced inside reviewChangeRequest.
   *
   * @param userSlackId Slack id of the user who clicked the button
   * @param crId the change request to approve
   * @param respond Bolt response callback bound to this interaction's response_url
   */
  static async handleApproveCRAction(
    userSlackId: string,
    crId: string,
    respond: (msg: {
      response_type?: 'ephemeral';
      text?: string;
      replace_original?: boolean;
      delete_original?: boolean;
    }) => Promise<unknown>
  ): Promise<void> {
    const reviewer = await prisma.user.findFirst({
      where: {
        userSettings: {
          slackId: userSlackId
        }
      }
    });

    if (!reviewer) {
      console.error('User not found for slack ID:', userSlackId);
      throw new NotFoundException('User', userSlackId);
    }

    const cr = await prisma.change_Request.findUnique({
      where: {
        crId
      }
    });

    if (!cr) {
      throw new NotFoundException('Change Request', crId);
    }

    const org = await prisma.organization.findUnique({
      where: {
        organizationId: cr.organizationId
      }
    });

    if (!org) {
      throw new NotFoundException('Organization', cr.organizationId);
    }

    try {
      await ChangeRequestsService.reviewChangeRequest(reviewer, crId, '', true, org);
      await respond({
        replace_original: true,
        text: `✅ CR #${cr.identifier} approved by ${reviewer.firstName} ${reviewer.lastName}.`
      });
    } catch (error) {
      if (error instanceof AccessDeniedException) {
        await respond({
          response_type: 'ephemeral',
          text: `❌ You're not authorized to approve this CR. Only admins, team heads, or requested reviewers can approve.`
        });
      } else if (error instanceof NotFoundException) {
        await respond({
          response_type: 'ephemeral',
          text: `❌ ${error.message}`
        });
      } else if (error instanceof HttpException) {
        await respond({
          response_type: 'ephemeral',
          text: `❌ ${error.message}`
        });
      } else {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error approving CR via Slack:', error);
        await respond({
          response_type: 'ephemeral',
          text: `❌ An unexpected error occurred while approving this CR.\n\n*Error:* ${msg}`
        });
      }
    }
  }

  /**
   * Given a slack event representing a message in a channel,
   * make the appropriate announcement change in prisma.
   * @param event the slack event that will be processed
   * @param organizationId the id of the organization represented by the slack api
   * @returns an annoucement if an announcement was processed and created/modified/deleted
   */
  static async processMessageSent(event: SlackMessageEvent, organizationId: string): Promise<Announcement | undefined> {
    //get the name of the channel from the slack api
    const slackChannelName: string = (await getChannelName(event.channel)) ?? `Unknown_Channel:${event.channel}`;
    const dateCreated = new Date(1000 * Number(event.event_ts));

    //get the message that will be processed either as the event or within a subtype
    let eventMessage: SlackMessage;

    if (event.subtype) {
      switch (event.subtype) {
        case 'message_deleted':
          //delete the message using the client_msg_id
          eventMessage = (event as SlackDeletedMessage).previous_message;
          return AnnouncementService.deleteAnnouncement(eventMessage.client_msg_id, organizationId);
        case 'message_changed':
          eventMessage = (event as SlackUpdatedMessage).message;
          break;
        default:
          //other events that do not effect announcements
          return;
      }
    } else {
      eventMessage = event as SlackMessage;
    }

    //loop through the blocks of the meta data while accumulating the
    //text and users notified
    let messageText = '';
    let userIdsToNotify: string[] = [];

    //get the name of the user that sent the message from slack
    let userName = (await getUserName(eventMessage.user)) ?? '';

    //if slack could not produce the name of the user, look for their name in prisma
    if (!userName) {
      try {
        const userWithThatSlackId = await prisma.user.findFirst({ where: { userSettings: { slackId: eventMessage.user } } });
        userName = `${userWithThatSlackId?.firstName} ${userWithThatSlackId?.lastName}`;
      } catch {
        userName = 'Unknown_User:' + eventMessage.user;
      }
    }

    //pull out the blocks of data from the metadata within the message event
    const richTextBlocks = eventMessage.blocks?.filter((eventBlock: any) => eventBlock.type === 'rich_text');

    if (richTextBlocks && richTextBlocks.length > 0 && richTextBlocks[0].elements.length > 0) {
      for (const element of richTextBlocks[0].elements[0].elements) {
        messageText += await blockToString(element);
        userIdsToNotify = userIdsToNotify.concat(await blockToMentionedUsers(element, organizationId, event.channel));
      }
    } else {
      return;
    }

    //get rid of duplicates within the users to notify
    userIdsToNotify = [...new Set(userIdsToNotify)];

    //if no users are notified, disregard the message
    if (userIdsToNotify.length === 0) {
      return;
    }

    if (event.subtype === 'message_changed') {
      //try to edit the announcement, if no announcement with that id exists create a new announcement
      try {
        return await AnnouncementService.updateAnnouncement(
          messageText,
          userIdsToNotify,
          userName,
          eventMessage.client_msg_id,
          slackChannelName,
          organizationId
        );
      } catch (error) {
        //if couldn't find the announcement to edit, create a new one below
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    return await AnnouncementService.createAnnouncement(
      messageText,
      userIdsToNotify,
      dateCreated,
      userName,
      eventMessage.client_msg_id,
      slackChannelName,
      organizationId
    );
  }
}
