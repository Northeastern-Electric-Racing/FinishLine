import { Announcement } from 'shared';
import prisma from '../prisma/prisma';
import { getAnnouncementQueryArgs } from '../prisma-query-args/announcements.query.args';
import announcementTransformer from '../transformers/announcements.transformer';
import { NotFoundException } from '../utils/errors.utils';

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

  static async updateAnnouncement(
    text: string,
    usersReceivedIds: string[],
    dateCreated: Date,
    senderName: string,
    slackEventId: string,
    slackChannelName: string,
    organizationId: string
  ): Promise<Announcement> {
    const originalAnnouncement = await prisma.announcement.findUnique({
      where: {
        slackEventId
      }
    });

    if (!originalAnnouncement) throw new NotFoundException('Announcement', slackEventId);

    const announcement = await prisma.announcement.update({
      where: { announcementId: originalAnnouncement.announcementId },
      data: {
        text,
        usersReceived: {
          connect: usersReceivedIds.map((id) => ({
            userId: id
          }))
        },
        slackEventId,
        dateCreated,
        senderName,
        slackChannelName
      },
      ...getAnnouncementQueryArgs(organizationId)
    });

    return announcementTransformer(announcement);
  }

  static async deleteAnnouncement(slackEventId: string, organizationId: string): Promise<Announcement> {
    const announcement = await prisma.announcement.update({
      where: { slackEventId },
      data: {
        dateDeleted: new Date()
      },
      ...getAnnouncementQueryArgs(organizationId)
    });

    if (!announcement) throw new NotFoundException('Announcement', slackEventId);

    return announcementTransformer(announcement);
  }
}
