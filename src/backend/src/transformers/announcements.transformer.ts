import { Prisma } from '@prisma/client';
import { AnnouncementQueryArgs } from '../prisma-query-args/announcements.query.args';
import { Announcement } from 'shared';
import { userTransformer } from './user.transformer';

const announcementTransformer = (announcement: Prisma.AnnouncementGetPayload<AnnouncementQueryArgs>): Announcement => {
  return {
    ...announcement,
    usersReceived: announcement.usersReceived.map(userTransformer),
    dateDeleted: announcement.dateDeleted ?? undefined
  };
};

export default announcementTransformer;
