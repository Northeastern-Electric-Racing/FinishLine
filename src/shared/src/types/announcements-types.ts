/** A Slack announcement that mentioned the user: the cards in the home page's General Announcements block */
export interface BaseAnnouncement {
  announcementId: string;
  text: string;
  senderName: string;
  dateMessageSent: Date;
  slackEventId: string;
  slackChannelName: string;
  dateDeleted?: Date;
}

/** One page of the current user's unread announcements, for the home page's General Announcements block */
export interface AnnouncementPage {
  announcements: BaseAnnouncement[];
  nextCursor?: string;
  totalCount: number;
}
