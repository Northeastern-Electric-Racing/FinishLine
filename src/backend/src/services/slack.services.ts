import { getChannelName, getUserName } from '../integrations/slack';
import AnnouncementService from './announcement.service';
import { Announcement } from 'shared';
import prisma from '../prisma/prisma';
import { blockToMentionedUsers, blockToString } from '../utils/slack.utils';
import { NotFoundException } from '../utils/errors.utils';

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

export default class SlackServices {
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
