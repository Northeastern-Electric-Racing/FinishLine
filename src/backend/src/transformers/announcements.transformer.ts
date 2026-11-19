import { Prisma } from '@prisma/client';
import { BaseAnnouncementQueryArgs } from '../prisma-query-args/announcements.query-args.js';
import { BaseAnnouncement } from 'shared';

export const baseAnnouncementTransformer = (
  announcement: Prisma.AnnouncementGetPayload<BaseAnnouncementQueryArgs>
): BaseAnnouncement => {
  return {
    ...announcement,
    dateDeleted: announcement.dateDeleted ?? undefined
  };
};
