import { User } from './user-types';

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
