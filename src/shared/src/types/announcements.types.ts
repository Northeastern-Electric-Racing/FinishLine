import { User } from './user-types.js';

export interface Announcement {
  announcementId: string;
  text: string;
  usersReceived: User[];
  senderName: string;
  dateMessageSent: Date;
  slackEventId: string;
  slackChannelName: string;
  dateDeleted?: Date;
}

export interface SlackMessagePreview {
  text: string;
  userName?: string;
  timestamp: string;
  permalink: string;
}
