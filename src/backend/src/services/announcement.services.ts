import { AnnouncementPage } from 'shared';
import prisma from '../prisma/prisma.js';
import { getBaseAnnouncementQueryArgs } from '../prisma-query-args/announcements.query-args.js';
import { baseAnnouncementTransformer } from '../transformers/announcements.transformer.js';
import { DeletedException, HttpException, NotFoundException } from '../utils/errors.utils.js';
import { validateOrgUsers } from '../utils/users.utils.js';

const ANNOUNCEMENT_PAGE_SIZE = 10;

export default class AnnouncementService {
  /**
   * Creates an announcement that is sent to users
   * this data is populated from slack events
   * @param text slack message text
   * @param usersReceivedIds users to send announcements to
   * @param dateMessageSent date created of slack message
   * @param senderName name of user who sent slack message
   * @param slackEventId id of slack event (provided by slack api)
   * @param slackChannelName name of channel message was sent in
   * @param organizationId id of organization of users
   * @throws if any receiving user doesn't exist or isn't in the organization
   */
  static async createAnnouncement(
    text: string,
    usersReceivedIds: string[],
    dateMessageSent: Date,
    senderName: string,
    slackEventId: string,
    slackChannelName: string,
    organizationId: string
  ): Promise<void> {
    await validateOrgUsers(usersReceivedIds, organizationId);

    await prisma.announcement.create({
      data: {
        text,
        usersReceived: {
          connect: usersReceivedIds.map((userId) => ({ userId }))
        },
        dateMessageSent,
        senderName,
        slackEventId,
        slackChannelName,
        organizationId
      }
    });
  }

  /**
   * Edits the announcement created from the given slack message
   * @throws NotFoundException if no announcement was created from that slack message
   * @throws if any receiving user doesn't exist or isn't in the organization
   */
  static async updateAnnouncement(
    text: string,
    usersReceivedIds: string[],
    senderName: string,
    slackEventId: string,
    slackChannelName: string,
    organizationId: string
  ): Promise<void> {
    const originalAnnouncement = await prisma.announcement.findUnique({
      where: { slackEventId },
      select: { announcementId: true, dateDeleted: true, organizationId: true }
    });

    if (!originalAnnouncement) throw new NotFoundException('Announcement', slackEventId);

    if (originalAnnouncement.dateDeleted) throw new DeletedException('Announcement', slackEventId);

    if (originalAnnouncement.organizationId !== organizationId)
      throw new HttpException(400, `Announcement is not apart of the current organization`);

    await validateOrgUsers(usersReceivedIds, organizationId);

    await prisma.announcement.update({
      where: { announcementId: originalAnnouncement.announcementId },
      data: {
        text,
        usersReceived: {
          set: usersReceivedIds.map((userId) => ({ userId }))
        },
        senderName,
        slackChannelName
      }
    });
  }

  /**
   * Soft deletes the announcement created from the given slack message and clears it from everyone's unread list
   * @throws NotFoundException if no announcement was created from that slack message
   */
  static async deleteAnnouncement(slackEventId: string, organizationId: string): Promise<void> {
    const originalAnnouncement = await prisma.announcement.findUnique({
      where: { slackEventId },
      select: { dateDeleted: true, organizationId: true }
    });

    if (!originalAnnouncement) throw new NotFoundException('Announcement', slackEventId);

    if (originalAnnouncement.dateDeleted) throw new DeletedException('Announcement', slackEventId);

    if (originalAnnouncement.organizationId !== organizationId)
      throw new HttpException(400, `Announcement is not apart of the current organization`);

    await prisma.announcement.update({
      where: { slackEventId },
      data: {
        dateDeleted: new Date(),
        usersReceived: {
          set: []
        }
      }
    });
  }

  /**
   * Gets one page of a user's unread announcements, newest first
   * @param userId id of the current user
   * @param organizationId the user's organization
   * @param cursor the announcementId of the last announcement on the previous page
   * @returns the page, the cursor of the next page, and how many unread announcements the user has in total
   */
  static async getUserUnreadAnnouncements(
    userId: string,
    organizationId: string,
    cursor?: string
  ): Promise<AnnouncementPage> {
    const where = {
      dateDeleted: null,
      usersReceived: { some: { userId } },
      organizationId
    };

    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where,
        ...(cursor && { cursor: { announcementId: cursor }, skip: 1 }),
        orderBy: [{ dateMessageSent: 'desc' }, { announcementId: 'desc' }],
        take: ANNOUNCEMENT_PAGE_SIZE,
        ...getBaseAnnouncementQueryArgs()
      }),
      prisma.announcement.count({ where })
    ]);

    return {
      announcements: announcements.map(baseAnnouncementTransformer),
      nextCursor:
        announcements.length === ANNOUNCEMENT_PAGE_SIZE ? announcements[announcements.length - 1].announcementId : undefined,
      totalCount
    };
  }

  /**
   * Removes a announcement from the user's unread announcements
   * @param userId id of the user to remove announcement from
   * @param announcementId id of the announcement to remove
   */
  static async removeUserAnnouncement(userId: string, announcementId: string): Promise<void> {
    const requestedUser = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true }
    });

    if (!requestedUser) throw new NotFoundException('User', userId);

    await prisma.user.update({
      where: { userId },
      data: {
        unreadAnnouncements: {
          disconnect: { announcementId }
        }
      },
      select: { userId: true }
    });
  }
}
