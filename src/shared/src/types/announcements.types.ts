export interface Announcement {
  announcementId: string;
  text: string;
  senderName: string;
  dateMessageSent: Date;
  slackEventId: string;
  slackChannelName: string;
  dateDeleted?: Date;
}
