import { Prisma } from '@prisma/client';
import { AnnouncementQueryArgs } from '../prisma-query-args/announcements.query.args';
import { Announcement } from 'shared';
import { userTransformer } from './user.transformer';

const announcementTransformer = (announcement: Prisma.AnnouncementGetPayload<AnnouncementQueryArgs>): Announcement => {
  return {
    announcementId: announcement.announcementId,
    text: announcement.text,
    usersReceived: announcement.usersReceived.map(userTransformer),
    dateCreated: announcement.dateCreated,
    senderName: announcement.senderName,
    slackEventId: announcement.slackEventId,
    slackChannelName: announcement.slackChannelName,
    dateDeleted: announcement.dateDeleted ?? undefined
  };
};

export default announcementTransformer;
