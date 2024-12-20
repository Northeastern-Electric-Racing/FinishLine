import { Announcement } from 'shared';
import prisma from '../prisma/prisma';
import { getAnnouncementQueryArgs } from '../prisma-query-args/announcements.query.args';
import announcementTransformer from '../transformers/announcements.transformer';

export default class AnnouncementService {
  /**
   * Creates an announcement that is sent to users
   * this data is populated from slack events
   * @param text slack message text
   * @param usersReceivedIds users to send announcements to
   * @param dateCreated date created of slack message
   * @param senderName name of user who sent slack message
   * @param slackEventId id of slack event (provided by slack api)
   * @param slackChannelName name of channel message was sent in
   * @param organizationId id of organization of users
   * @returns the created announcement
   */
  static async createAnnouncement(
    text: string,
    usersReceivedIds: string[],
    dateCreated: Date,
    senderName: string,
    slackEventId: string,
    slackChannelName: string,
    organizationId: string
  ): Promise<Announcement> {
    const announcement = await prisma.announcement.create({
      data: {
        text,
        usersReceived: {
          connect: usersReceivedIds.map((id) => ({
            userId: id
          }))
        },
        dateCreated,
        senderName,
        slackEventId,
        slackChannelName
      },
      ...getAnnouncementQueryArgs(organizationId)
    });

    return announcementTransformer(announcement);
  }
}
