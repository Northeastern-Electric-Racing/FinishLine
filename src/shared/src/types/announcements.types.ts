import { User } from './user-types';

export interface Announcement {
  announcementId: string;
  text: string;
  userCreated: User;
  dateCreated: Date;
  slackEventId: string;
  slackChannelName: string;
}
