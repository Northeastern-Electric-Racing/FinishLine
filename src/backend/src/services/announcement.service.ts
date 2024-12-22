import { Announcement } from 'shared';
import prisma from '../prisma/prisma';
import { getAnnouncementQueryArgs } from '../prisma-query-args/announcements.query.args';
import announcementTransformer from '../transformers/announcements.transformer';
import { NotFoundException } from '../utils/errors.utils';
import { HttpException } from '../utils/errors.utils';

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
    dateMessageSent: Date,
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
        dateMessageSent,
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
          set: usersReceivedIds.map((id) => ({
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
    const originalAnnouncement = await prisma.announcement.findUnique({
      where: {
        slackEventId
      }
    });

    if (!originalAnnouncement) throw new NotFoundException('Announcement', slackEventId);

    const announcement = await prisma.announcement.update({
      where: { slackEventId },
      data: {
        dateDeleted: new Date(),
        usersReceived: {
          set: []
        }
      },
      ...getAnnouncementQueryArgs(organizationId)
    });

    return announcementTransformer(announcement);
  }

  /**
   * Gets all of a user's unread announcements
   * @param userId id of the current user
   * @param organization the user's orgainzation
   * @returns the unread announcements of the user
   */
  static async getUserUnreadAnnouncements(userId: string, organizationId: string) {
    const unreadAnnouncements = await prisma.announcement.findMany({
      where: {
        usersReceived: {
          some: { userId }
        }
      },
      ...getAnnouncementQueryArgs(organizationId)
    });

    if (!unreadAnnouncements) throw new HttpException(404, 'User Unread Announcements Not Found');

    return unreadAnnouncements.map(announcementTransformer);
  }
}
