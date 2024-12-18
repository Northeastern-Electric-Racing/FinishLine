import UsersService from './users.services';
import { getChannelName, getUserName, getUsersInChannel } from '../integrations/slack';
import { User_Settings } from '@prisma/client';
import AnnouncementService from './announcement.service';
import { Announcement } from 'shared';

export interface SlackMessageEvent {
  type: 'message';
  subtype?: string;
  channel: string;
  event_ts: string;
  channel_type: string;
}

export interface SlackMessage extends SlackMessageEvent {
  user: string;
  type: 'message';
  client_msg_id: string;
  text: string;
  blocks: {
    type: string;
    block_id: string;
    elements: any[];
  }[];
}

export interface SlackDeletedMessage extends SlackMessageEvent {
  subtype: 'message_deleted';
  previous_message: SlackMessage;
}

export interface SlackUpdatedMessage extends SlackMessageEvent {
  subtype: 'message_changed';
  message: SlackMessage;
  previous_message: SlackMessage;
}

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
  private static async blockToString(block: SlackRichTextBlock): Promise<string> {
    switch (block.type) {
      case 'broadcast':
        return '@' + block.range;
      case 'color':
        return block.value ?? '';
      case 'channel':
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
        if (block.unicode) {
          return String.fromCharCode(parseInt(block.unicode, 16));
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
            const slackIds = await getUsersInChannel(channelId);
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
        return [];
    }
  }

  static async processMessageSent(event: SlackMessageEvent, organizationId: string): Promise<Announcement | undefined> {
    const slackChannelName = await getChannelName(event.channel);
    const dateCreated = new Date(Number(event.event_ts));

    let eventMessage: SlackMessage;

    if (event.subtype) {
      switch (event.subtype) {
        case 'message_deleted':
          eventMessage = (event as SlackDeletedMessage).previous_message;
          try {
            return AnnouncementService.DeleteAnnouncement(eventMessage.client_msg_id, organizationId);
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

    let messageText = '';
    let userIdsToNotify: string[] = [];

    const users = await UsersService.getAllUsers();
    const userSettings = await Promise.all(
      users.map((user) => {
        return UsersService.getUserSettings(user.userId);
      })
    );

    let userName: string = '';
    try {
      userName = (await getUserName(eventMessage.user)) ?? '';
    } catch (ignored) {}

    if (!userName) {
      const userIdList = userSettings
        .filter((userSetting) => userSetting.slackId === eventMessage.user)
        .map((userSettings) => userSettings.userId);
      if (userIdList.length !== 0) {
        userName = users.find((user) => user.userId === userIdList[0])?.firstName ?? 'Unknown User:' + eventMessage.user;
      } else {
        userName = 'Unknown_User:' + eventMessage.user;
      }
    }

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

    if (event.subtype === 'message_changed') {
      try {
        return AnnouncementService.UpdateAnnouncement(
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
    return AnnouncementService.createAnnouncement(
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
