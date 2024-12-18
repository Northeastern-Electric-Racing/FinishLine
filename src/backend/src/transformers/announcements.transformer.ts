import { Prisma } from '@prisma/client';
import { AnnouncementQueryArgs } from '../prisma-query-args/announcements.query.args';
import { Announcement } from 'shared';
import { userTransformer } from './user.transformer';

const announcementTransformer = (announcement: Prisma.AnnouncementGetPayload<AnnouncementQueryArgs>): Announcement => {
  return {
    announcementId: announcement.announcementId,
    text: announcement.text,
    dateCreated: announcement.dateCreated,
    userCreated: userTransformer(announcement.userCreated),
    slackEventId: announcement.slackEventId,
    slackChannelName: announcement.slackChannelName
  };
};

export default announcementTransformer;
