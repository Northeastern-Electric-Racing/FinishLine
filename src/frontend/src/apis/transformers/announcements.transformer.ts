import { Announcement } from 'shared';

export const announcementsTransformer = (announcement: Announcement): Announcement => {
  return {
    ...announcement,
    dateMessageSent: new Date(announcement.dateMessageSent),
    dateDeleted: announcement.dateDeleted ? new Date(announcement.dateDeleted) : undefined
  };
};
