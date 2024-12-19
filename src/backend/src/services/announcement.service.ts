import { Announcement } from 'shared';
import prisma from '../prisma/prisma';
import { getAnnouncementQueryArgs } from '../prisma-query-args/announcements.query.args';
import announcementTransformer from '../transformers/announcements.transformer';

export default class AnnouncementService {
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
