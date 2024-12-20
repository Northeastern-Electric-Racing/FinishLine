import { User } from './user-types';

export interface Announcement {
  announcementId: string;
  text: string;
  usersReceived: User[];
  senderName: string;
  dateCreated: Date;
  slackEventId: string;
  slackChannelName: string;
  dateDeleted?: Date;
}
