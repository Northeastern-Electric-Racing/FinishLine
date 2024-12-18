import { UserWithScheduleSettings } from 'shared';
import UsersService from './users.services';
import { WebClient } from '@slack/web-api';
import { getChannelName, getUserName, getUsersInChannel } from '../integrations/slack';
import { UserWithId } from '../utils/teams.utils';
import { UserWithSecureSettings, UserWithSettings } from '../utils/auth.utils';
import { User_Settings } from '@prisma/client';
import NotificationsService from './notifications.services';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export interface SlackMessageEvent {
  type: string;
  subtype?: string;
  channel: string;
  user: string;
  text: string;
  ts: string;
  event_ts: string;
  channel_type: string;
  blocks: any;
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
        let userName = block.user_id;
        try {
          userName = await getUserName(block.user_id ?? '');
        } catch (error) {
          userName = `ISSUE PARSING USER:${block.user_id}`;
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

  static async processMessageSent(event: SlackMessageEvent) {
    let messageText = '';
    let userIdsToNotify: string[] = [];
    const users = await UsersService.getAllUsers();
    const userSettings = await Promise.all(
      users.map((user) => {
        return UsersService.getUserSettings(user.userId);
      })
    );

    const richTextBlocks = event.blocks?.filter((eventBlock: any) => eventBlock.type === 'rich_text');

    if (richTextBlocks && richTextBlocks.length === 1) {
      for (const element of richTextBlocks[0].elements[0].elements) {
        messageText += await slackServices.blockToString(element);
        userIdsToNotify = userIdsToNotify.concat(await slackServices.blockToMentionedUsers(element, userSettings, ''));
      }
    }

    // if (event.subtype) {
    //   switch (event.subtype) {
    //     case '':
    //   }
    // }

    // console.log(event.blocks.elements);
    console.log(event.type === 'message');
  }
}
