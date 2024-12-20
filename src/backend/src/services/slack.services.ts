import UsersService from './users.services';
import { getChannelName, getUserName, getUsersInChannel } from '../integrations/slack';
import { User_Settings } from '@prisma/client';
import AnnouncementService from './announcement.service';
import { Announcement } from 'shared';

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

export default class slackServices {
  /**
   * Converts a SlackRichTextBlock into a string representation for an announcement.
   * @param block the block of information from slack
   * @returns the string that will be combined with other block's strings to create the announcement
   */
  private static async blockToString(block: SlackRichTextBlock): Promise<string> {
    switch (block.type) {
      case 'broadcast':
        return '@' + block.range;
      case 'color':
        return block.value ?? '';
      case 'channel':
        //channels are represented as an id, get the name from the slack api
        let channelName = block.channel_id;
        try {
          channelName = await getChannelName(block.channel_id ?? '');
        } catch (error) {
          channelName = `ISSUE PARSING CHANNEL:${block.channel_id}`;
        }
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
        let userName: string = block.user_id ?? '';
        try {
          userName = (await getUserName(block.user_id ?? '')) ?? `Unknown User:${block.user_id}`;
        } catch (error) {
          userName = `Unknown_User:${block.user_id}`;
        }
        return '@' + userName;
      case 'usergroup':
        return `usergroup:${block.usergroup_id}`;
    }
  }

  /**
   * Gets the users notified in a specific SlackRichTextBlock.
   * @param block the block that may contain mentioned user/users
   * @param usersSettings the settings of all the users in prisma
   * @param channelId the id of the channel that the block is being sent in
   * @returns an array of prisma user ids of users to be notified
   */
  private static async blockToMentionedUsers(
    block: SlackRichTextBlock,
    usersSettings: User_Settings[],
    channelId: string
  ): Promise<string[]> {
    switch (block.type) {
      case 'broadcast':
        switch (block.range) {
          case 'everyone':
            return usersSettings.map((usersSettings) => usersSettings.userId);
          case 'channel':
          case 'here':
            //@here behaves the same as @channel; notifies all the users in that channel
            let slackIds: string[] = [];
            try {
              slackIds = await getUsersInChannel(channelId);
            } catch (ignored) {}
            return usersSettings
              .filter((userSettings) => {
                return slackIds.some((slackId) => slackId === userSettings.slackId);
              })
              .map((user) => user.userId);
          default:
            return [];
        }
      case 'user':
        return usersSettings
          .filter((userSettings) => userSettings.slackId === block.user_id)
          .map((userSettings) => userSettings.userId);
      default:
        //only broadcasts and specific user mentions add recievers to announcements
        return [];
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
    let slackChannelName: string;
    //get the name of the channel from the slack api
    try {
      slackChannelName = await getChannelName(event.channel);
    } catch (error) {
      slackChannelName = `Unknown_Channel:${event.channel}`;
    }
    const dateCreated = new Date(Number(event.event_ts));

    //get the message that will be processed either as the event or within a subtype
    let eventMessage: SlackMessage;

    if (event.subtype) {
      switch (event.subtype) {
        case 'message_deleted':
          //delete the message using the client_msg_id
          eventMessage = (event as SlackDeletedMessage).previous_message;
          try {
            return AnnouncementService.deleteAnnouncement(eventMessage.client_msg_id, organizationId);
          } catch (ignored) {
            return;
          }
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

    //Get the settings of all users in this organization to compare slack ids
    const users = await UsersService.getAllUsers();
    const userSettings = await Promise.all(
      users.map((user) => {
        return UsersService.getUserSettings(user.userId);
      })
    );

    //get the name of the user that sent the message from slack
    let userName: string = '';
    try {
      userName = (await getUserName(eventMessage.user)) ?? '';
    } catch (ignored) {}

    //if slack could not produce the name of the user, look for their name in prisma
    if (!userName) {
      const userIdList = userSettings
        .filter((userSetting) => userSetting.slackId === eventMessage.user)
        .map((userSettings) => userSettings.userId);
      if (userIdList.length !== 0) {
        const prismaUserName = users.find((user) => user.userId === userIdList[0]);
        userName = prismaUserName
          ? `${prismaUserName?.firstName} ${prismaUserName?.lastName}`
          : 'Unknown User:' + eventMessage.user;
      } else {
        userName = 'Unknown_User:' + eventMessage.user;
      }
    }

    //pull out the blocks of data from the metadata within the message event
    const richTextBlocks = eventMessage.blocks?.filter((eventBlock: any) => eventBlock.type === 'rich_text');

    if (richTextBlocks && richTextBlocks.length === 1) {
      for (const element of richTextBlocks[0].elements[0].elements) {
        messageText += await slackServices.blockToString(element);
        userIdsToNotify = userIdsToNotify.concat(
          await slackServices.blockToMentionedUsers(element, userSettings, event.channel)
        );
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

    console.log('processed event');

    if (event.subtype === 'message_changed') {
      //try to edit the announcement, if no announcement with that id exists create a new announcement
      try {
        return await AnnouncementService.updateAnnouncement(
          messageText,
          userIdsToNotify,
          dateCreated,
          userName,
          eventMessage.client_msg_id,
          slackChannelName,
          organizationId
        );
      } catch (ignored) {}
    }
    try {
      return await AnnouncementService.createAnnouncement(
        messageText,
        userIdsToNotify,
        dateCreated,
        userName,
        eventMessage.client_msg_id,
        slackChannelName,
        organizationId
      );
    } catch (error) {
      //if announcement does not have unique cient_msg_id disregard it
      return;
    }
  }
}
